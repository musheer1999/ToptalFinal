import React from 'react';

export function Textarea({ value, onChange, placeholder, rows = 3, error }) {
  return (
    <textarea
      value={value ?? ''}
      rows={rows}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', boxSizing: 'border-box', padding: '11px 12px',
        borderRadius: 10, border: `1px solid ${error ? '#E53E3E' : '#E2E8F0'}`,
        background: 'white', fontSize: 14, color: '#1A202C',
        outline: 'none', fontFamily: 'inherit', resize: 'vertical',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => e.target.style.borderColor = '#FF6B35'}
      onBlur={e => e.target.style.borderColor = error ? '#E53E3E' : '#E2E8F0'}
    />
  );
}
