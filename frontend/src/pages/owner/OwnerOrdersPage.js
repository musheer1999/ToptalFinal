import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Button, EmptyState, StatusBadge, fmtMoney, fmtDate } from '../../components/ui';
import { PageShell, PageHeader, OwnerRestaurantGate, OwnerRestaurantHeader, RestaurantEditModal } from './_shared';

const STATUS_NEXT = { Placed: 'Processing', Processing: 'In Route', 'In Route': 'Delivered' };

function OwnerOrdersInner() {
  const { ownerRestaurant, loadRestaurantOrders, advanceOrderStatus, cancelOrder, showToast } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [editingRest, setEditingRest] = useState(false);

  useEffect(() => {
    if (ownerRestaurant) {
      loadRestaurantOrders(ownerRestaurant.id).then(setOrders).catch(() => {}).finally(() => setLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerRestaurant]);

  if (loading) return <PageShell><div style={{ textAlign: 'center', padding: 60, color: '#718096' }}>Loading orders...</div></PageShell>;

  return (
    <PageShell>
      <PageHeader title="Orders" subtitle="Manage incoming orders." />
      <OwnerRestaurantHeader onEdit={() => setEditingRest(true)} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total',     value: orders.length,                                       color: '#1A202C' },
          { label: 'New',       value: orders.filter(o => o.status === 'Placed').length,     color: '#2563EB' },
          { label: 'Kitchen',   value: orders.filter(o => o.status === 'Processing').length, color: '#FF6B35' },
          { label: 'On way',    value: orders.filter(o => o.status === 'In Route').length,   color: '#9333EA' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length,  color: '#0891B2' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #EDF0F5', borderRadius: 12, padding: '12px 10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
            <div style={{ fontSize: 10, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="📭" title="No orders yet" body="Orders from customers will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const nextStatus = STATUS_NEXT[order.status];
            return (
              <div key={order.id} style={{ background: 'white', border: '1px solid #EDF0F5', borderRadius: 14, padding: 14, boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>#{order.id}</div>
                  <StatusBadge status={order.status} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 1 }}>Customer</div>
                    <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.customer_email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 1 }}>Date</div>
                    <div style={{ fontSize: 12 }}>{fmtDate(order.created_at)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 1 }}>Total</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#FF6B35' }}>{fmtMoney(parseFloat(order.total))}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid #F0F2F5', paddingTop: 10 }}>
                  {nextStatus && (
                    <Button size="sm" onClick={async () => {
                      try {
                        await advanceOrderStatus(order.id, nextStatus);
                        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: nextStatus } : o));
                        showToast({ kind: 'success', title: `#${order.id} → ${nextStatus}` });
                      } catch (err) { showToast({ kind: 'error', title: err.message }); }
                    }}>→ {nextStatus}</Button>
                  )}
                  {(order.status === 'Placed' || order.status === 'Processing') && (
                    <Button size="sm" variant="danger" onClick={async () => {
                      try {
                        await cancelOrder(order.id);
                        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Canceled' } : o));
                        showToast({ kind: 'error', title: `#${order.id} canceled` });
                      } catch (err) { showToast({ kind: 'error', title: err.message }); }
                    }}>Cancel</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/orders/${order.id}`)}>Details →</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingRest && <RestaurantEditModal restaurant={ownerRestaurant} onClose={() => setEditingRest(false)} />}
    </PageShell>
  );
}

export function OwnerOrdersPage() {
  return <OwnerRestaurantGate><OwnerOrdersInner /></OwnerRestaurantGate>;
}
