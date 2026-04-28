import React from 'react';

export function Input({ value, onChange, type = 'text', placeholder, error, icon, style, ...rest }) {
  return (
    <div style={{ position: 'relative' }}>
      {icon && (
        <div style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: '#718096', pointerEvents: 'none',
        }}>
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: icon ? '11px 12px 11px 38px' : '11px 12px',
          borderRadius: 10,
          border: `1px solid ${error ? '#E53E3E' : '#E2E8F0'}`,
          background: 'white', fontSize: 14, color: '#1A202C',
          outline: 'none', fontFamily: 'inherit',
          transition: 'border-color 0.15s',
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = error ? '#E53E3E' : '#FF6B35'}
        onBlur={e => e.target.style.borderColor = error ? '#E53E3E' : '#E2E8F0'}
        {...rest}
      />
    </div>
  );
}
