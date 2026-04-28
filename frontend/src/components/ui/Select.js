import React from 'react';

export function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      style={{
        width: '100%', boxSizing: 'border-box', padding: '11px 12px',
        borderRadius: 10, border: '1px solid #E2E8F0',
        background: 'white', fontSize: 14, color: '#1A202C',
        outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1.5L6 6.5L11 1.5' stroke='%23718096' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32,
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o =>
        typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  );
}
