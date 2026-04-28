import React from 'react';

export function ToastContainer({ toasts }) {
  return (
    <>
      <style>{`
        .toast-container {
          position: fixed;
          top: 70px;
          right: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
          align-items: flex-end;
        }
        @media (max-width: 600px) {
          .toast-container {
            top: auto;
            right: auto;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            align-items: center;
            width: calc(100vw - 32px);
          }
        }
      `}</style>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} style={{
            pointerEvents: 'auto',
            width: 'min(360px, 100%)',
            background: 'white', border: '1px solid #EDF0F5',
            borderLeft: `3px solid ${t.kind === 'success' ? '#38A169' : t.kind === 'error' ? '#E53E3E' : '#FF6B35'}`,
            borderRadius: 12, padding: '12px 14px',
            boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
            animation: 'slideInRight 0.25s ease',
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A202C' }}>{t.title}</div>
            {t.body && <div style={{ fontSize: 13, color: '#4A5568', marginTop: 2 }}>{t.body}</div>}
          </div>
        ))}
      </div>
    </>
  );
}
