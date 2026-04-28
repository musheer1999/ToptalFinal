import React from 'react';

export function EmptyState({ icon, title, body, action }) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      background: 'white', border: '1px dashed #E2E8F0', borderRadius: 14,
    }}>
      <div style={{ fontSize: 36, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#1A202C', marginBottom: 6 }}>{title}</div>
      {body && <p style={{ fontSize: 14, color: '#718096', marginBottom: 16, maxWidth: 300, margin: '0 auto 16px' }}>{body}</p>}
      {action}
    </div>
  );
}
