import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, StatusBadge, fmtDate, fmtMoney } from '../../../components/ui';
import { OwnerRestaurantGate, OwnerRestaurantHeader, PageHeader, PageShell, RestaurantEditModal } from '../_shared';
import useOwnerOrders from './useOwnerOrders';
import useOwnerOrdersQuery from './useOwnerOrdersQuery';

function OwnerOrdersInner() {
  const navigate = useNavigate();
  const {
    stats,
    orders,
    loading,
    editingRest,
    ownerRestaurant,
    setLoading,
    setEditingRest,
    notifyError,
    notifySuccess,
    onLoadOrdersSuccess,
    onOrderStatusChange,
    getNextStatus,
  } = useOwnerOrders();
  const { loadRestaurantOrders, updateOrderStatus } = useOwnerOrdersQuery();

  useEffect(() => {
    if (!ownerRestaurant) return;
    loadRestaurantOrders(ownerRestaurant.id)
      .then(onLoadOrdersSuccess)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [loadRestaurantOrders, onLoadOrdersSuccess, ownerRestaurant, setLoading]);

  if (loading) return <PageShell><div style={{ textAlign: 'center', padding: 60, color: '#718096' }}>Loading orders...</div></PageShell>;

  return (
    <PageShell>
      <PageHeader title="Orders" subtitle="Manage incoming orders." />
      <OwnerRestaurantHeader onEdit={() => setEditingRest(true)} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10, marginBottom: 20 }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ background: 'white', border: '1px solid #EDF0F5', borderRadius: 12, padding: '12px 10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
            <div style={{ fontSize: 10, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, marginTop: 2 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="📭" title="No orders yet" body="Orders from customers will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((order) => {
            const nextStatus = getNextStatus(order.status);
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
                        await updateOrderStatus(order.id, nextStatus);
                        onOrderStatusChange(order.id, nextStatus);
                        notifySuccess(`#${order.id} → ${nextStatus}`);
                      } catch (err) {
                        notifyError(err.message);
                      }
                    }}>→ {nextStatus}</Button>
                  )}
                  {(order.status === 'Placed' || order.status === 'Processing') && (
                    <Button size="sm" variant="danger" onClick={async () => {
                      try {
                        await updateOrderStatus(order.id, 'Canceled');
                        onOrderStatusChange(order.id, 'Canceled');
                        notifyError(`#${order.id} canceled`);
                      } catch (err) {
                        notifyError(err.message);
                      }
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
