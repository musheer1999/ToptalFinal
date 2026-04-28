import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Button, EmptyState, StatusBadge, fmtMoney, fmtDate } from '../../components/ui';
import { PageShell, PageHeader } from './_shared';

function OrderCard({ order, restaurantName, onCancel, onMarkReceived, onReorder, onDetails }) {
  return (
    <div style={{ background: 'white', border: '1px solid #EDF0F5', borderRadius: 14, padding: 16, boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#1A202C' }}>#{order.id}</div>
        <StatusBadge status={order.status} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Restaurant</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{restaurantName}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Date</div>
          <div style={{ fontSize: 13 }}>{fmtDate(order.created_at)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Total</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#FF6B35' }}>{fmtMoney(parseFloat(order.total))}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid #F0F2F5', paddingTop: 12 }}>
        {(order.status === 'Placed' || order.status === 'Processing') && (
          <Button size="sm" variant="danger" onClick={onCancel}>Cancel</Button>
        )}
        {order.status === 'Delivered' && (
          <Button size="sm" variant="success" onClick={onMarkReceived}>Mark received</Button>
        )}
        <Button size="sm" variant="secondary" onClick={onReorder}>Reorder</Button>
        <Button size="sm" variant="ghost" onClick={onDetails}>Details →</Button>
      </div>
    </div>
  );
}

export function CustomerOrdersPage() {
  const { loadMyOrders, orders, getRestaurant, cancelOrder, markReceived, reorder, showToast } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyOrders().catch(() => {}).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <PageShell><div style={{ textAlign: 'center', padding: 80, color: '#718096' }}>Loading orders...</div></PageShell>;

  return (
    <PageShell>
      <PageHeader title="Orders history" subtitle={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`} />
      {orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" body="Browse restaurants to place your first order."
          action={<Button onClick={() => navigate('/browse-restaurants')}>Browse restaurants</Button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => {
            const restaurant = getRestaurant(order.restaurant_id);
            return (
              <OrderCard
                key={order.id}
                order={order}
                restaurantName={order.restaurant_name || restaurant?.name || '—'}
                onCancel={async () => {
                  try { await cancelOrder(order.id); showToast({ kind: 'error', title: `Order #${order.id} canceled` }); loadMyOrders(); }
                  catch (err) { showToast({ kind: 'error', title: err.message }); }
                }}
                onMarkReceived={async () => {
                  try { await markReceived(order.id); showToast({ kind: 'success', title: 'Marked received!' }); loadMyOrders(); }
                  catch (err) { showToast({ kind: 'error', title: err.message }); }
                }}
                onReorder={async () => {
                  try {
                    const newId = await reorder(order.id);
                    showToast({ kind: 'success', title: `Order #${newId} placed!` });
                    navigate(`/orders/${newId}`);
                  } catch (err) { showToast({ kind: 'error', title: err.message }); }
                }}
                onDetails={() => navigate(`/orders/${order.id}`)}
              />
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
