import React from 'react';

export function Card({ children, style, padded = true, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        border: '1px solid #EDF0F5',
        borderRadius: 14,
        boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
        padding: padded ? 20 : 0,
        transition: 'transform 0.15s, box-shadow 0.15s',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
