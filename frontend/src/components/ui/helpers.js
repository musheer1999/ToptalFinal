export const fmtMoney = (n) => `₹${Number(n).toFixed(2)}`;

export const fmtDate = (iso) => {
  const d = new Date(iso);
  const diffMin = Math.round((Date.now() - d) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export const fmtDateFull = (iso) => {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
};
