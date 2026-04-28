import React from 'react';

export function QtyStepper({ value, onChange, min = 1, max = 99 }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid #E2E8F0',
        borderRadius: 999,
        padding: 2,
        background: 'white',
      }}
    >
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          border: 'none',
          background: value <= min ? '#F7F8FC' : 'white',
          color: '#1A202C',
          cursor: value <= min ? 'not-allowed' : 'pointer',
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        −
      </button>
      <span style={{ minWidth: 28, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          border: 'none',
          background: '#FF6B35',
          color: 'white',
          cursor: 'pointer',
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        +
      </button>
    </div>
  );
}
