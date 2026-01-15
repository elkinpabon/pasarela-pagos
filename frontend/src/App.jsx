import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

// Productos con datos quemados
const PRODUCTS = [
  { id: 1, name: 'Cuaderno A4', price: 3.50, image: '📓' },
  { id: 2, name: 'Lápices x12', price: 2.00, image: '✏️' },
  { id: 3, name: 'Bolígrafos x10', price: 4.50, image: '🖊️' },
  { id: 4, name: 'Marcadores x6', price: 5.50, image: '🖍️' },
  { id: 5, name: 'Borrador', price: 0.50, image: '🧹' },
  { id: 6, name: 'Regla 30cm', price: 1.00, image: '📐' },
];

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [cart, setCart] = useState([]);
  const [showPaymentBox, setShowPaymentBox] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDoc, setCustomerDoc] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [paymentBoxInitialized, setPaymentBoxInitialized] = useState(false);

  // Cargar SDK de Payphone
  useEffect(() => {
    let checkSDKInterval;
    
    const checkPayphoneSDK = () => {
      if (window.PPaymentButtonBox) {
        setPaymentBoxInitialized(true);
        console.log('✓ Payphone SDK cargado correctamente');
        if (checkSDKInterval) clearInterval(checkSDKInterval);
      }
    };

    // Verificar SDK
    checkSDKInterval = setInterval(checkPayphoneSDK, 500);
    return () => {
      if (checkSDKInterval) clearInterval(checkSDKInterval);
    };
  }, []);

  const addToCart = (product) => {
    const exists = cart.find(item => item.id === product.id);
    if (exists) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Convertir a centavos para Payphone
  const amountInCents = Math.round(total * 100);

  const handleInitiatePayment = (e) => {
    e.preventDefault();
    
    if (!customerName || !customerEmail || !customerPhone || !customerDoc) {
      setErrorModal('Completa todos los campos');
      return;
    }

    if (total <= 0) {
      setErrorModal('El carrito está vacío');
      return;
    }

    if (!paymentBoxInitialized || !window.PPaymentButtonBox) {
      setErrorModal('El SDK de Payphone aún se está cargando. Intenta nuevamente.');
      return;
    }

    initializePaymentBox();
    setShowPaymentBox(true);
  };

  const initializePaymentBox = async () => {
    // Generar ID único para la transacción
    const clientTransactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Guardar transacción en sessionStorage
    sessionStorage.setItem('currentTransaction', JSON.stringify({
      clientTransactionId,
      amount: amountInCents,
      customerName,
      customerEmail,
      customerPhone,
      customerDoc,
      cartItems: cart,
      timestamp: new Date().toISOString()
    }));

    try {
      // Preparar transacción en backend
      console.log('Preparando transacción en backend...');
      const prepareResponse = await axios.post(`${API_BASE_URL}/prepare-payment`, {
        clientTransactionId,
        amount: amountInCents,
        email: customerEmail,
        phone: customerPhone
      });

      if (!prepareResponse.data.success) {
        throw new Error(prepareResponse.data.error || 'Error preparando pago en backend');
      }

      const { payWithCard, payWithPayPhone } = prepareResponse.data;
      console.log('✓ URLs de pago obtenidas del backend');
      
      if (!payWithCard) {
        throw new Error('No se recibió la URL de pago');
      }

      // Redirigir directamente a la URL de pago (en navegador, no en iframe)
      console.log('Redirigiendo a formulario de Payphone...');
      window.location.href = payWithCard;
      
    } catch (error) {
      console.error('Error preparando pago:', error);
      setErrorModal('Error preparando pago: ' + error.message);
      setShowPaymentBox(false);
    }
  };

  const handlePaymentSuccess = () => {
    console.log('✓ Pago procesado correctamente');
    setSuccessModal(true);
    
    // Limpiar estado después de 2 segundos
    setTimeout(() => {
      setCart([]);
      setShowPaymentBox(false);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerDoc('');
      setSuccessModal(false);
      setActiveTab('products');
    }, 2000);
    
    // Enviar confirmación al backend
    const transaction = JSON.parse(sessionStorage.getItem('currentTransaction') || '{}');
    if (transaction.clientTransactionId) {
      fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientTransactionId: transaction.clientTransactionId,
          status: 'SUCCESS',
          amount: transaction.amount
        })
      }).catch(err => console.error('Error confirmando en backend:', err));
    }
  };

  const handleClosePayment = () => {
    setShowPaymentBox(false);
    const container = document.getElementById('pp-button');
    if (container) {
      container.innerHTML = '';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🛒 Prueba Payphone EC</h1>
        {paymentBoxInitialized && <p className="sdk-status">✓ SDK cargado</p>}
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Productos
        </button>
        <button
          className={`tab ${activeTab === 'checkout' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkout')}
        >
          Carrito ({cart.length})
        </button>
      </div>

      {/* Pestaña Productos */}
      {activeTab === 'products' && (
        <div className="tab-content">
          <div className="products-grid">
            {PRODUCTS.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image">{product.image}</div>
                <h3>{product.name}</h3>
                <p className="price">${product.price.toFixed(2)}</p>
                <button onClick={() => addToCart(product)} className="btn-add">
                  Agregar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pestaña Checkout */}
      {activeTab === 'checkout' && (
        <div className="tab-content">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>El carrito está vacío</p>
            </div>
          ) : (
            <div className="checkout-container">
              {/* Resumen del carrito */}
              <div className="cart-summary">
                <h2>Resumen</h2>
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <span className="item-name">{item.image} {item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <div className="item-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        min="1"
                      />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="item-total">${(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeFromCart(item.id)} className="btn-remove">✕</button>
                  </div>
                ))}
                <div className="cart-total">
                  <h3>Total: ${total.toFixed(2)}</h3>
                  <p className="total-cents">({amountInCents} centavos)</p>
                </div>
              </div>

              {/* Formulario de pago */}
              {!showPaymentBox ? (
                <form className="checkout-form" onSubmit={handleInitiatePayment}>
                  <h2>Información de Pago</h2>
                  
                  {errorModal && <div className="error">{errorModal}</div>}
                  
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Teléfono *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+593999999999"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Cédula/Documento *</label>
                    <input
                      type="text"
                      value={customerDoc}
                      onChange={(e) => setCustomerDoc(e.target.value)}
                      placeholder="0123456789"
                      required
                    />
                  </div>

                  <button type="submit" className="btn-submit">
                    Proceder al Pago
                  </button>
                </form>
              ) : (
                <div className="payment-box-container">
                  <h2>Cajita de Pagos Payphone</h2>
                  <div id="pp-button"></div>
                  <button onClick={handleClosePayment} className="btn-cancel">
                    Cancelar Pago
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Error */}
      {errorModal && errorModal !== '' && (
        <div className="modal-overlay" onClick={() => setErrorModal('')}>
          <div className="modal">
            <div className="modal-icon error-icon">⚠️</div>
            <h2>Error</h2>
            <p>{errorModal}</p>
            <button onClick={() => setErrorModal('')} className="btn-close">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {successModal && (
        <div className="modal-overlay" onClick={() => setSuccessModal(false)}>
          <div className="modal">
            <div className="modal-icon">✓</div>
            <h2>¡Pago Completado!</h2>
            <p>Tu transacción ha sido procesada exitosamente.</p>
            <p className="modal-info">
              <small>Revisa tu email para confirmar el pago</small>
            </p>
            <button onClick={() => setSuccessModal(false)} className="btn-close">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
