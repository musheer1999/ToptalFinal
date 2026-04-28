import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, EmptyState, StatusBadge, fmtMoney } from '../../../components/ui';
import { PageShell, PageHeader, SummaryRow, Timeline } from '../_shared';
import { useStore } from '../../../context/StoreContext';
import useOrderDetail from './useOrderDetail';
import useOrderDetailQuery from './useOrderDetailQuery';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const {
    order,
    loading,
    setLoading,
    prices,
    onAfterLoadOrder,
    setOrderStatus,
    notifySuccess,
    notifyError,
  } = useOrderDetail();
  const { session } = useStore();
  const isCustomer = session?.role === 'customer';
  const { loadOrderById, cancelOrder, markReceived, reorder } = useOrderDetailQuery({
    onAfterLoadOrder,
  });

  useEffect(() => {
    setLoading(true);
    loadOrderById(orderId)
      .catch(() => onAfterLoadOrder(null))
      .finally(() => setLoading(false));
  }, [loadOrderById, onAfterLoadOrder, orderId, setLoading]);

  if (loading)
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: 80, color: '#718096' }}>Loading order...</div>
      </PageShell>
    );
  if (!order)
    return (
      <PageShell>
        <EmptyState icon="❌" title="Order not found" />
      </PageShell>
    );

  return (
    <PageShell>
      <PageHeader
        back={{ to: '/orders/customer', label: 'Back to orders' }}
        title={`Order #${order.id}`}
        subtitle={order.restaurant_name}
        right={<StatusBadge status={order.status} size="lg" />}
      />
      <style>{`@media(min-width:720px){.order-detail-layout{display:grid!important;grid-template-columns:1fr 360px;gap:16px;align-items:start}}`}</style>
      <div
        className="order-detail-layout"
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(order.items || []).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 0',
                  borderBottom: '1px solid #F7F8FC',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{item.meal_name}</div>
                  <div style={{ fontSize: 12, color: '#718096' }}>
                    {item.quantity} × {fmtMoney(parseFloat(item.price))}
                  </div>
                </div>
                <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {fmtMoney(item.quantity * parseFloat(item.price))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: '#EDF0F5', margin: '14px 0' }} />
          <SummaryRow label="Subtotal" value={fmtMoney(prices.subtotal)} />
          {prices.discount > 0 && (
            <SummaryRow
              label={`Coupon (${order.coupon_code || ''})`}
              value={`−${fmtMoney(prices.discount)}`}
              valueColor="#38A169"
            />
          )}
          {prices.tip > 0 && <SummaryRow label="Tip" value={fmtMoney(prices.tip)} />}
          <div style={{ height: 1, background: '#EDF0F5', margin: '10px 0' }} />
          <SummaryRow label="Total" value={fmtMoney(prices.total)} large />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {(order.status === 'Placed' || order.status === 'Processing') && (
              <Button
                variant="danger"
                onClick={async () => {
                  try {
                    await cancelOrder(order.id);
                    setOrderStatus('Canceled');
                    notifySuccess('Order canceled');
                  } catch (err) {
                    notifyError(err.message);
                  }
                }}
              >
                Cancel order
              </Button>
            )}
            {isCustomer && order.status === 'Delivered' && (
              <Button
                variant="success"
                onClick={async () => {
                  try {
                    await markReceived(order.id);
                    setOrderStatus('Received');
                    notifySuccess('Marked as received!');
                  } catch (err) {
                    notifyError(err.message);
                  }
                }}
              >
                Mark as received
              </Button>
            )}
            {isCustomer && (
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    const newId = await reorder(order.id);
                    notifySuccess(`Order #${newId} placed!`);
                    navigate(`/orders/${newId}`);
                  } catch (err) {
                    notifyError(err.message);
                  }
                }}
              >
                Reorder
              </Button>
            )}
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
