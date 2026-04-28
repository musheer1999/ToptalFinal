import React from 'react';

export function Banner({ tone = 'warning', children }) {
  const tones = {
    warning: { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412' },
    info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' },
    danger: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
  };
  const t = tones[tone] || tones.warning;
  return (
    <div
      style={{
        background: t.bg,
        border: `1px solid ${t.border}`,
        color: t.text,
        borderRadius: 12,
        padding: '12px 16px',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {children}
    </div>
  );
}
