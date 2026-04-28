import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Card } from '../../components/ui';
import { PageShell, PageHeader, OwnerRestaurantGate, OwnerRestaurantHeader, RestaurantEditModal } from './_shared';

function ManageRestaurantInner() {
  const { ownerRestaurant } = useStore();
  const [editing, setEditing] = useState(false);
  const r = ownerRestaurant;
  return (
    <PageShell>
      <PageHeader title="Your restaurant" subtitle="Manage your restaurant details." />
      <OwnerRestaurantHeader onEdit={() => setEditing(true)} />
      <Card>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Details</h3>
        {[
          { label: 'Name',        value: r.name },
          { label: 'Cuisine',     value: r.cuisine },
          { label: 'Description', value: r.description },
          { label: 'Longitude',   value: r.longitude != null ? parseFloat(r.longitude).toFixed(6) : '—', mono: true },
          { label: 'Latitude',    value: r.latitude  != null ? parseFloat(r.latitude).toFixed(6)  : '—', mono: true },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', padding: '9px 0', borderBottom: '1px solid #F7F8FC', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: '#718096', minWidth: 90, flexShrink: 0 }}>{row.label}</div>
            <div style={{ fontSize: 13, fontFamily: row.mono ? 'monospace' : 'inherit', color: '#1A202C', wordBreak: 'break-word' }}>{String(row.value)}</div>
          </div>
        ))}
        <div style={{ marginTop: 14 }}>
          <button onClick={() => setEditing(true)} style={{ padding: '10px 16px', background: '#FF6B35', color: 'white', border: '1px solid #FF6B35', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Edit details</button>
        </div>
      </Card>
      {editing && <RestaurantEditModal restaurant={r} onClose={() => setEditing(false)} />}
    </PageShell>
  );
}

export function ManageRestaurantsPage() {
  return <OwnerRestaurantGate><ManageRestaurantInner /></OwnerRestaurantGate>;
}
