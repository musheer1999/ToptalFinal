import React from 'react';

export function AuthCard({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff4f0 0%, #f7f8fc 50%, #fff4f0 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 20, border: '1px solid #E8ECF0',
        boxShadow: '0 8px 40px rgba(255,107,53,0.10)',
        padding: '36px 32px', width: '100%', maxWidth: 400, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg, #FF6B35, #ff9a6c)',
          borderRadius: '20px 20px 0 0',
        }} />
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🍔</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A202C', letterSpacing: -0.5, margin: '0 0 6px' }}>
            {title}
          </h1>
          <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
