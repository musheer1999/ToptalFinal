import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Button, Card, EmptyState, Field, Input, QtyStepper, fmtMoney } from '../../components/ui';
import { PageShell, PageHeader, SummaryRow } from './_shared';

export function CartPage() {
  const { cart, getRestaurant, getMeal, updateCartQty, removeFromCart, cartSubtotal, validateCoupon, placeOrder, showToast } = useStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode]   = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [tip, setTip]       = useState(0);
  const [placing, setPlacing] = useState(false);

  const restaurant = cart.restaurantId ? getRestaurant(cart.restaurantId) : null;
  const discount   = appliedCoupon ? cartSubtotal * (appliedCoupon.discount_percentage / 100) : 0;
  const total      = cartSubtotal - discount + Number(tip);

  const applyCoupon = async () => {
    if (!couponCode.trim()) { setCouponError('Enter a coupon code'); return; }
    try {
      const coupon = await validateCoupon(cart.restaurantId, couponCode.trim());
      setAppliedCoupon(coupon); setCouponError('');
      showToast({ kind: 'success', title: 'Coupon applied!', body: `${coupon.discount_percentage}% off.` });
    } catch (err) { setCouponError(err.message); setAppliedCoupon(null); }
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const orderId = await placeOrder({ couponCode: appliedCoupon?.code, tip });
      if (orderId) { showToast({ kind: 'success', title: 'Order placed!' }); navigate(`/orders/${orderId}`); }
    } catch (err) { showToast({ kind: 'error', title: err.message }); }
    finally { setPlacing(false); }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <PageShell>
        <PageHeader title="Your cart" />
        <EmptyState icon="🛒" title="Your cart is empty" body="Browse restaurants and add some meals."
          action={<Button onClick={() => navigate('/browse-restaurants')}>Browse restaurants</Button>} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader title="Your cart" subtitle={restaurant ? `From ${restaurant.name}` : ''} back={{ to: `/browse-meals/${cart.restaurantId}`, label: 'Back to menu' }} />
      <style>{`@media(min-width:720px){.cart-layout{display:grid!important;grid-template-columns:1fr 380px;gap:16px;align-items:start}}`}</style>
      <div className="cart-layout" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cart.items.map(item => {
            const meal = getMeal(item.mealId);
            if (!meal) return null;
            return (
              <Card key={item.mealId}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: '#FFF1EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🍽️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{meal.name}</div>
                      <div style={{ fontSize: 13, color: '#718096' }}>{fmtMoney(parseFloat(meal.price))} each</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <QtyStepper value={item.qty} onChange={q => updateCartQty(item.mealId, q)} min={0} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{fmtMoney(parseFloat(meal.price) * item.qty)}</span>
                      <button onClick={() => removeFromCart(item.mealId)} style={{ border: 'none', background: 'transparent', color: '#E53E3E', cursor: 'pointer', padding: 4, fontSize: 18 }}>🗑️</button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Checkout summary</h3>
          <Field label="Coupon code" error={couponError}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input value={couponCode} onChange={v => { setCouponCode(v); setCouponError(''); }} placeholder="e.g. WELCOME10" error={couponError} />
              <Button variant="secondary" onClick={applyCoupon}>Apply</Button>
            </div>
          </Field>
          {appliedCoupon && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: '#E6F7EC', borderRadius: 8, fontSize: 13, color: '#22543D', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>{appliedCoupon.code}</strong> — {appliedCoupon.discount_percentage}% off</span>
              <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#22543D' }}>×</button>
            </div>
          )}
          <div style={{ marginTop: 14 }}>
            <Field label="Tip">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[0, 2, 4, 6, 10].map(t => (
                  <button key={t} onClick={() => setTip(t)} style={{
                    padding: '7px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit', border: '1px solid',
                    borderColor: tip === t ? '#FF6B35' : '#E2E8F0',
                    background: tip === t ? '#FFF1EC' : 'white',
                    color: tip === t ? '#C2410C' : '#4A5568',
                  }}>₹{t}</button>
                ))}
              </div>
            </Field>
          </div>
          <div style={{ height: 1, background: '#EDF0F5', margin: '14px 0' }} />
          <SummaryRow label="Subtotal" value={fmtMoney(cartSubtotal)} />
          {discount > 0 && <SummaryRow label="Discount" value={`−${fmtMoney(discount)}`} valueColor="#38A169" />}
          <SummaryRow label="Tip" value={fmtMoney(Number(tip))} />
          <div style={{ height: 1, background: '#EDF0F5', margin: '10px 0' }} />
          <SummaryRow label="Total" value={fmtMoney(total)} large />
          <div style={{ marginTop: 16 }}>
            <Button full size="lg" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Placing order...' : 'Place order →'}
            </Button>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
