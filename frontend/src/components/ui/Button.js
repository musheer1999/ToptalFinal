import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', full, onClick, type, disabled, style }) {
  const sizes = {
    sm: { padding: '7px 12px', fontSize: 13, borderRadius: 8 },
    md: { padding: '10px 16px', fontSize: 14, borderRadius: 10 },
    lg: { padding: '14px 20px', fontSize: 15, borderRadius: 12 },
  };
  const variants = {
    primary:   { background: '#FF6B35', color: 'white', border: '1px solid #FF6B35' },
    secondary: { background: 'white', color: '#1A202C', border: '1px solid #E2E8F0' },
    ghost:     { background: 'transparent', color: '#4A5568', border: '1px solid transparent' },
    danger:    { background: 'white', color: '#E53E3E', border: '1px solid #FED7D7' },
    success:   { background: '#38A169', color: 'white', border: '1px solid #38A169' },
    dark:      { background: '#1A202C', color: 'white', border: '1px solid #1A202C' },
  };
  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...sizes[size],
        ...variants[variant],
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: full ? '100%' : 'auto',
        fontFamily: 'inherit',
        transition: 'all 0.15s ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
