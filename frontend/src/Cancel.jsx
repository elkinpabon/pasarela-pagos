import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cancel() {
  const navigate = useNavigate();

  useEffect(() => {
    // Mostrar el mensaje durante 3 segundos antes de redirigir
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>✕</div>
        <h1>Pago Cancelado</h1>
        <p style={styles.message}>
          Tu transacción ha sido cancelada. El monto no ha sido cobrado.
        </p>
        <p style={styles.subtext}>
          Serás redirigido al inicio en unos segundos...
        </p>
        <button style={styles.button} onClick={handleBackHome}>
          Volver al Inicio Ahora
        </button>
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
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    textAlign: 'center'
  },
  icon: {
    fontSize: '60px',
    color: '#ef4444',
    marginBottom: '20px'
  },
  message: {
    color: '#666',
    marginBottom: '15px',
    fontSize: '16px'
  },
  subtext: {
    color: '#999',
    marginBottom: '30px',
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
