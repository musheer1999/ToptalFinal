import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Button, Card, EmptyState, StatusBadge, fmtMoney } from '../../components/ui';
import { PageShell, PageHeader, SummaryRow, Timeline } from './_shared';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const { loadOrderById, cancelOrder, markReceived, reorder, showToast } = useStore();
  const navigate = useNavigate();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderById(orderId).then(setOrder).catch(() => setOrder(null)).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) return <PageShell><div style={{ textAlign: 'center', padding: 80, color: '#718096' }}>Loading order...</div></PageShell>;
  if (!order)  return <PageShell><EmptyState icon="❌" title="Order not found" /></PageShell>;

  const subtotal = parseFloat(order.subtotal) || 0;
  const discount = parseFloat(order.discount) || 0;
  const tip      = parseFloat(order.tip)      || 0;
  const total    = parseFloat(order.total)    || 0;

  return (
    <PageShell>
      <PageHeader
        back={{ to: '/orders/customer', label: 'Back to orders' }}
        title={`Order #${order.id}`}
        subtitle={order.restaurant_name}
        right={<StatusBadge status={order.status} size="lg" />}
      />
      <style>{`@media(min-width:720px){.order-detail-layout{display:grid!important;grid-template-columns:1fr 360px;gap:16px;align-items:start}}`}</style>
      <div className="order-detail-layout" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(order.items || []).map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '8px 0', borderBottom: '1px solid #F7F8FC' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{item.meal_name}</div>
                  <div style={{ fontSize: 12, color: '#718096' }}>{item.quantity} × {fmtMoney(parseFloat(item.price))}</div>
                </div>
                <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtMoney(item.quantity * parseFloat(item.price))}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: '#EDF0F5', margin: '14px 0' }} />
          <SummaryRow label="Subtotal" value={fmtMoney(subtotal)} />
          {discount > 0 && <SummaryRow label={`Coupon (${order.coupon_code || ''})`} value={`−${fmtMoney(discount)}`} valueColor="#38A169" />}
          {tip > 0 && <SummaryRow label="Tip" value={fmtMoney(tip)} />}
          <div style={{ height: 1, background: '#EDF0F5', margin: '10px 0' }} />
          <SummaryRow label="Total" value={fmtMoney(total)} large />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {(order.status === 'Placed' || order.status === 'Processing') && (
              <Button variant="danger" onClick={async () => {
                try { await cancelOrder(order.id); setOrder(o => ({...o, status: 'Canceled'})); showToast({ kind: 'error', title: 'Order canceled' }); }
                catch (err) { showToast({ kind: 'error', title: err.message }); }
              }}>Cancel order</Button>
            )}
            {order.status === 'Delivered' && (
              <Button variant="success" onClick={async () => {
                try { await markReceived(order.id); setOrder(o => ({...o, status: 'Received'})); showToast({ kind: 'success', title: 'Marked as received!' }); }
                catch (err) { showToast({ kind: 'error', title: err.message }); }
              }}>Mark as received</Button>
            )}
            <Button variant="secondary" onClick={async () => {
              try { const newId = await reorder(order.id); showToast({ kind: 'success', title: `Order #${newId} placed!` }); navigate(`/orders/${newId}`); }
              catch (err) { showToast({ kind: 'error', title: err.message }); }
            }}>Reorder</Button>
          </div>
        </Card>

        <Card>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Status timeline</h3>
          <Timeline history={order.status_history || []} currentStatus={order.status} />
        </Card>
      </div>
    </PageShell>
  );
}
