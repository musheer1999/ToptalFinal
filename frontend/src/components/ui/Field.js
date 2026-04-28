import React from 'react';

export function Field({ label, error, hint, children }) {
  return (
    <label style={{ display: 'block' }}>
      {label && (
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A202C', marginBottom: 6 }}>
          {label}
        </div>
      )}
      {children}
      {hint && !error && (
        <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontSize: 12, color: '#E53E3E', marginTop: 4 }}>{error}</div>
      )}
    </label>
  );
}
