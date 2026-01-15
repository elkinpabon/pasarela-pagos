import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

// Productos con imágenes de alta calidad
const PRODUCTS = [
  { 
    id: 1, 
    name: 'MacBook Pro 14"', 
    description: 'Chip M3 Pro, 18GB RAM, 512GB SSD',
    price: 1999.00, 
    originalPrice: 2499.00,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
    category: 'Laptops',
    rating: 4.9,
    reviews: 128,
    badge: 'Más vendido',
    stock: 12,
    freeShipping: true
  },
  { 
    id: 2, 
    name: 'iPhone 15 Pro Max', 
    description: '256GB, Titanio Natural, 5G',
    price: 1199.00, 
    originalPrice: 1299.00,
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
    category: 'Smartphones',
    rating: 4.8,
    reviews: 256,
    badge: 'Nuevo',
    stock: 8,
    freeShipping: true
  },
  { 
    id: 3, 
    name: 'AirPods Pro 2', 
    description: 'Cancelación de ruido activa, USB-C',
    price: 249.00, 
    originalPrice: 279.00,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop',
    category: 'Audio',
    rating: 4.7,
    reviews: 512,
    badge: null,
    stock: 25,
    freeShipping: true
  },
  { 
    id: 4, 
    name: 'iPad Air M2', 
    description: '11", 128GB, Wi-Fi, Chip M2',
    price: 599.00, 
    originalPrice: 699.00,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
    category: 'Tablets',
    rating: 4.6,
    reviews: 89,
    badge: '-14%',
    stock: 5,
    freeShipping: true
  },
  { 
    id: 5, 
    name: 'Apple Watch Ultra 2', 
    description: 'GPS + Cellular, 49mm, Titanio',
    price: 799.00, 
    originalPrice: 899.00,
    image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop',
    category: 'Wearables',
    rating: 4.9,
    reviews: 167,
    badge: 'Premium',
    stock: 3,
    freeShipping: true
  },
  { 
    id: 6, 
    name: 'Sony WH-1000XM5', 
    description: 'Auriculares inalámbricos premium',
    price: 349.00, 
    originalPrice: 399.00,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    category: 'Audio',
    rating: 4.8,
    reviews: 234,
    badge: 'Top rated',
    stock: 18,
    freeShipping: false
  },
  { 
    id: 7, 
    name: 'Samsung 32" 4K Monitor', 
    description: 'ViewFinity S8, HDR, USB-C',
    price: 449.00, 
    originalPrice: 549.00,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop',
    category: 'Monitores',
    rating: 4.5,
    reviews: 78,
    badge: null,
    stock: 15,
    freeShipping: false
  },
  { 
    id: 8, 
    name: 'Logitech MX Master 3S', 
    description: 'Mouse ergonómico silencioso',
    price: 99.00, 
    originalPrice: 119.00,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    category: 'Accesorios',
    rating: 4.7,
    reviews: 445,
    badge: 'Popular',
    stock: 30,
    freeShipping: false
  },
];

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('products');
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showPaymentBox, setShowPaymentBox] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDoc, setCustomerDoc] = useState('');
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [paymentBoxInitialized, setPaymentBoxInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isCartOpen, setIsCartOpen] = useState(false);

  const categories = ['Todos', ...new Set(PRODUCTS.map(p => p.category))];

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
    // Mostrar notificación
    showNotification(`${product.name} agregado al carrito`);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2500);
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
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const savings = cart.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);

  // Filtrar productos
  const filteredProducts = PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      {/* Notificación Toast */}
      {notification && (
        <div className="toast-notification">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>{notification}</span>
        </div>
      )}

      {/* Top Banner Promocional */}
      <div className="promo-banner">
        <div className="promo-content">
          <span className="promo-badge">🔥 OFERTA</span>
          <span className="promo-text">Envío GRATIS en pedidos superiores a $500 | Usa el código <strong>TECH20</strong> para 20% extra</span>
          <button className="promo-close">✕</button>
        </div>
      </div>

      {/* Header Profesional */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <div className="logo-icon-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div className="logo-text-wrapper">
              <span className="logo-text">TechStore</span>
              <span className="logo-subtitle">Premium Electronics</span>
            </div>
          </div>
          
          <div className="search-bar">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              type="text" 
              placeholder="Buscar productos, marcas, categorías..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <kbd className="search-shortcut">⌘K</kbd>
          </div>

          <div className="header-actions">
            <button className="header-btn wishlist-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button className="header-btn user-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
            <button className="cart-button" onClick={() => setIsCartOpen(!isCartOpen)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              {total > 0 && <span className="cart-total-preview">${total.toFixed(0)}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mini Cart Dropdown */}
      {isCartOpen && cart.length > 0 && (
        <div className="mini-cart">
          <div className="mini-cart-header">
            <h4>Tu Carrito ({totalItems})</h4>
            <button onClick={() => setIsCartOpen(false)}>✕</button>
          </div>
          <div className="mini-cart-items">
            {cart.slice(0, 3).map(item => (
              <div key={item.id} className="mini-cart-item">
                <img src={item.image} alt={item.name} />
                <div className="mini-cart-item-info">
                  <span>{item.name}</span>
                  <span className="mini-cart-price">{item.quantity} × ${item.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {cart.length > 3 && <p className="mini-cart-more">+{cart.length - 3} más...</p>}
          </div>
          <div className="mini-cart-footer">
            <div className="mini-cart-total">
              <span>Total:</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <button className="btn-checkout" onClick={() => { setActiveTab('checkout'); setIsCartOpen(false); }}>
              Ir al Checkout
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <div className="nav-container">
          <button
            className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Productos
          </button>
          <button
            className={`nav-tab ${activeTab === 'checkout' ? 'active' : ''}`}
            onClick={() => setActiveTab('checkout')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Checkout
            {totalItems > 0 && <span className="tab-badge">{totalItems}</span>}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="products-section">
            {/* Categories Filter */}
            <div className="categories-filter">
              {categories.map(cat => (
                <button 
                  key={cat}
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card">
                  {product.badge && <span className={`product-badge ${product.badge === 'Nuevo' ? 'new' : product.badge === 'Premium' ? 'premium' : ''}`}>{product.badge}</span>}
                  <button className="wishlist-btn-card">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  <div className="product-image-container">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <div className="product-overlay">
                      <button 
                        className="quick-add-btn"
                        onClick={() => addToCart(product)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Agregar rápido
                      </button>
                      <button className="quick-view-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Vista rápida
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    {product.description && <p className="product-description">{product.description}</p>}
                    <div className="product-rating">
                      <div className="stars-container">
                        {[1,2,3,4,5].map(star => (
                          <svg key={star} className={`star ${star <= Math.floor(product.rating) ? 'filled' : ''}`} viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        ))}
                      </div>
                      <span className="rating-text">{product.rating} <span className="reviews-count">({product.reviews} reseñas)</span></span>
                    </div>
                    <div className="product-pricing">
                      <span className="current-price">${product.price.toFixed(2)}</span>
                      <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                      <span className="discount-badge">-{Math.round((1 - product.price/product.originalPrice) * 100)}%</span>
                    </div>
                    <div className="product-meta">
                      {product.freeShipping && (
                        <span className="free-shipping-badge">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="3" width="15" height="13"/>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                            <circle cx="5.5" cy="18.5" r="2.5"/>
                            <circle cx="18.5" cy="18.5" r="2.5"/>
                          </svg>
                          Envío gratis
                        </span>
                      )}
                      {product.stock <= 5 && (
                        <span className="low-stock">Solo {product.stock} disponibles</span>
                      )}
                    </div>
                  </div>
                  <button className="btn-add-cart" onClick={() => addToCart(product)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    Añadir al carrito
                  </button>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="no-results">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                  <path d="M8 8l6 6M14 8l-6 6"/>
                </svg>
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros términos de búsqueda</p>
              </div>
            )}
          </div>
        )}

        {/* Checkout Tab */}
        {activeTab === 'checkout' && (
          <div className="checkout-section">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <h2>Tu carrito está vacío</h2>
                <p>Agrega productos para comenzar tu compra</p>
                <button className="btn-continue-shopping" onClick={() => setActiveTab('products')}>
                  Explorar productos
                </button>
              </div>
            ) : (
              <div className="checkout-layout">
                {/* Cart Items */}
                <div className="cart-section">
                  <div className="section-header">
                    <h2>Carrito de Compras</h2>
                    <span className="items-count">{totalItems} artículos</span>
                  </div>
                  
                  <div className="cart-items">
                    {cart.map(item => (
                      <div key={item.id} className="cart-item">
                        <img src={item.image} alt={item.name} className="cart-item-image" />
                        <div className="cart-item-details">
                          <span className="cart-item-category">{item.category}</span>
                          <h4 className="cart-item-name">{item.name}</h4>
                          <div className="cart-item-price-row">
                            <span className="cart-item-price">${item.price.toFixed(2)}</span>
                            <span className="cart-item-original">${item.originalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="cart-item-quantity">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                        <div className="cart-item-subtotal">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary & Payment Form */}
                <div className="summary-section">
                  {!showPaymentBox ? (
                    <>
                      {/* Order Summary */}
                      <div className="order-summary">
                        <h3>Resumen del Pedido</h3>
                        <div className="summary-row">
                          <span>Subtotal ({totalItems} artículos)</span>
                          <span>${(total + savings).toFixed(2)}</span>
                        </div>
                        <div className="summary-row discount-row">
                          <span>Descuento</span>
                          <span className="discount-amount">-${savings.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                          <span>Envío</span>
                          <span className="free-shipping">GRATIS</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row total-row">
                          <span>Total</span>
                          <strong>${total.toFixed(2)}</strong>
                        </div>
                        <div className="savings-banner">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                          </svg>
                          <span>¡Ahorras ${savings.toFixed(2)} en esta compra!</span>
                        </div>
                      </div>

                      {/* Payment Form */}
                      <form className="payment-form" onSubmit={handleInitiatePayment}>
                        <h3>Información de Pago</h3>
                        
                        {errorModal && (
                          <div className="form-error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="12" y1="8" x2="12" y2="12"/>
                              <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {errorModal}
                          </div>
                        )}

                        <div className="form-group">
                          <label>Nombre Completo</label>
                          <div className="input-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Juan Pérez"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Correo Electrónico</label>
                          <div className="input-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                              <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <input
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="correo@ejemplo.com"
                              required
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Teléfono</label>
                            <div className="input-wrapper">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                              </svg>
                              <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                placeholder="+593999999999"
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Cédula/RUC</label>
                            <div className="input-wrapper">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="16" rx="2"/>
                                <line x1="7" y1="9" x2="17" y2="9"/>
                                <line x1="7" y1="13" x2="12" y2="13"/>
                              </svg>
                              <input
                                type="text"
                                value={customerDoc}
                                onChange={(e) => setCustomerDoc(e.target.value)}
                                placeholder="0123456789"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <button type="submit" className="btn-pay-now">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                            <line x1="1" y1="10" x2="23" y2="10"/>
                          </svg>
                          Pagar ${total.toFixed(2)}
                        </button>

                        <div className="security-badges">
                          <div className="badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span>Pago Seguro</span>
                          </div>
                          <div className="badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            <span>SSL Encriptado</span>
                          </div>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="payment-processing">
                      <div className="processing-animation">
                        <div className="spinner"></div>
                      </div>
                      <h3>Procesando tu pago...</h3>
                      <p>Serás redirigido a la pasarela de pago</p>
                      <button onClick={handleClosePayment} className="btn-cancel-payment">
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Error */}
      {errorModal && errorModal !== '' && activeTab !== 'checkout' && (
        <div className="modal-overlay" onClick={() => setErrorModal('')}>
          <div className="modal error-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrapper error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2>Error</h2>
            <p>{errorModal}</p>
            <button onClick={() => setErrorModal('')} className="btn-modal">
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {successModal && (
        <div className="modal-overlay" onClick={() => setSuccessModal(false)}>
          <div className="modal success-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-icon-wrapper success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>¡Pago Exitoso!</h2>
            <p>Tu transacción ha sido procesada correctamente.</p>
            <p className="modal-subtext">Recibirás un correo de confirmación</p>
            <button onClick={() => setSuccessModal(false)} className="btn-modal success">
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="logo-icon">⚡</span>
            <span>TechStore</span>
          </div>
          <div className="footer-links">
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
            <a href="#">Soporte</a>
          </div>
          <div className="footer-payment">
            <span>Powered by</span>
            <strong>Payphone</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
