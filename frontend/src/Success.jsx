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
          <div style={styles.content}>
            <div style={styles.successIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={styles.iconSvg}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1 style={styles.title}>¡Pago Exitoso!</h1>
            <p style={styles.subtitle}>
              Tu transacción ha sido procesada correctamente
            </p>

            <div style={styles.details}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>ID de Transacción</span>
                <span style={styles.detailValue}>{result.id}</span>
              </div>
              <div style={styles.divider}></div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Referencia</span>
                <span style={styles.detailValue}>{result.clientTransactionId}</span>
              </div>
              <div style={styles.divider}></div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Monto Pagado</span>
                <span style={styles.amountValue}>${parseFloat(result.amount).toFixed(2)} USD</span>
              </div>
              <div style={styles.divider}></div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Estado</span>
                <span style={styles.statusBadge}>{result.transactionStatus}</span>
              </div>
              <div style={styles.divider}></div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Autorización</span>
                <span style={styles.detailValue}>{result.authorizationCode}</span>
              </div>
            </div>

            <p style={styles.emailNote}>
              📧 Recibirás un correo de confirmación con los detalles de tu compra
            </p>

            <button style={styles.button} onClick={handleBackHome}>
              Volver a la Tienda
            </button>
          </div>
        ) : (
          <div style={styles.content}>
            <div style={styles.errorIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={styles.iconSvg}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h1 style={styles.title}>Sin información</h1>
            <p style={styles.subtitle}>No se encontraron datos de la transacción</p>
            <button style={styles.button} onClick={handleBackHome}>
              Volver al Inicio
            </button>
          </div>
        )}
      </div>
      <div style={styles.footer}>
        <span>Powered by</span>
        <strong style={styles.footerBrand}>Payphone</strong>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  card: {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '48px 40px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  content: {
    textAlign: 'center'
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(16, 185, 129, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px'
  },
  errorIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px'
  },
  iconSvg: {
    width: '40px',
    height: '40px',
    color: '#10b981'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '32px'
  },
  details: {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'left'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0'
  },
  detailLabel: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: '14px',
    color: '#1e293b',
    fontWeight: '600',
    fontFamily: 'monospace'
  },
  amountValue: {
    fontSize: '18px',
    color: '#6366f1',
    fontWeight: '700'
  },
  statusBadge: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },
  divider: {
    height: '1px',
    background: '#e2e8f0'
  },
  emailNote: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px',
    padding: '12px 16px',
    background: '#f1f5f9',
    borderRadius: '10px'
  },
  button: {
    width: '100%',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  footer: {
    marginTop: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b',
    fontSize: '14px'
  },
  footerBrand: {
    color: '#818cf8'
  }
};
