import React from 'react';

const STATUS_COLORS = {
  Placed:     { bg: '#E6F0FF', dot: '#2563EB', text: '#1E40AF' },
  Processing: { bg: '#FFF1EC', dot: '#FF6B35', text: '#C2410C' },
  'In Route': { bg: '#F3E8FF', dot: '#9333EA', text: '#6B21A8' },
  Delivered:  { bg: '#E0F7FA', dot: '#0891B2', text: '#155E75' },
  Received:   { bg: '#E6F7EC', dot: '#38A169', text: '#22543D' },
  Canceled:   { bg: '#FEE7E7', dot: '#E53E3E', text: '#9B2C2C' },
};

export function StatusBadge({ status, size = 'sm' }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Placed;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: size === 'lg' ? '6px 12px' : '4px 10px',
      borderRadius: 999, background: c.bg, color: c.text,
      fontWeight: 600, fontSize: size === 'lg' ? 13 : 12,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: c.dot }} />
      {status}
    </span>
  );
}
