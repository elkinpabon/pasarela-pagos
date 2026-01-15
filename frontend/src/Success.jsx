import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Success() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Extraer parámetros de la URL
    const id = searchParams.get('id');
    const clientTransactionId = searchParams.get('clientTransactionId');
    const authCode = searchParams.get('authCode');
    const amount = searchParams.get('amount');
    const status = searchParams.get('status');

    if (id && clientTransactionId) {
      setResult({
        id,
        clientTransactionId,
        authorizationCode: authCode || 'N/A',
        amount: amount ? parseInt(amount) / 100 : 'N/A',
        transactionStatus: status || 'Aprobada'
      });
    }
  }, [searchParams]);

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {result ? (
          <div style={styles.success}>
            <div style={styles.icon}>✓</div>
            <h1>¡Pago Confirmado!</h1>
            <p style={styles.message}>
              Tu transacción ha sido procesada correctamente.
            </p>

            <div style={styles.details}>
              <div style={styles.row}>
                <span>ID Payphone:</span>
                <strong>{result.id}</strong>
              </div>
              <div style={styles.row}>
                <span>Tu ID Transacción:</span>
                <strong>{result.clientTransactionId}</strong>
              </div>
              <div style={styles.row}>
                <span>Monto:</span>
                <strong>${parseFloat(result.amount).toFixed(2)} USD</strong>
              </div>
              <div style={styles.row}>
                <span>Estado:</span>
                <strong style={{ color: '#10b981' }}>
                  {result.transactionStatus}
                </strong>
              </div>
              <div style={styles.row}>
                <span>Código de Autorización:</span>
                <strong>{result.authorizationCode}</strong>
              </div>
            </div>

            <button style={styles.button} onClick={handleBackHome}>
              Volver al Inicio
            </button>
          </div>
        ) : (
          <div style={styles.error}>
            <div style={styles.iconError}>✕</div>
            <h1>Sin datos de transacción</h1>
            <p>No se encontraron parámetros de pago válidos.</p>
            <button style={styles.button} onClick={handleBackHome}>
              Volver al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
  },
  loading: {
    textAlign: 'center',
    padding: '40px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f0f0f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  success: {
    textAlign: 'center'
  },
  error: {
    textAlign: 'center'
  },
  icon: {
    fontSize: '60px',
    color: '#10b981',
    marginBottom: '20px'
  },
  iconError: {
    fontSize: '60px',
    color: '#ef4444',
    marginBottom: '20px'
  },
  message: {
    color: '#666',
    marginBottom: '30px',
    fontSize: '16px'
  },
  details: {
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '30px',
    textAlign: 'left'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #eee',
    fontSize: '14px'
  },
  note: {
    background: '#eff6ff',
    padding: '15px',
    borderRadius: '8px',
    color: '#0369a1',
    marginBottom: '20px',
    fontSize: '14px'
  },
  button: {
    padding: '12px 30px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    width: '100%'
  }
};
