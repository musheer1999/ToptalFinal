import React from 'react';

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null;

  const widths = { sm: 380, md: 520, lg: 720 };
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 16,
          width: '100%',
          maxWidth: widths[size],
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 24px 48px rgba(15,23,42,0.24)',
        }}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #EDF0F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1A202C' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#718096',
              fontSize: 22,
              cursor: 'pointer',
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #EDF0F5',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
