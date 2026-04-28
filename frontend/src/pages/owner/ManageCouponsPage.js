import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button, Card, EmptyState, Field, Input, Modal } from '../../components/ui';
import { PageShell, PageHeader, OwnerRestaurantGate, OwnerRestaurantHeader, RestaurantEditModal } from './_shared';

function CouponEditModal({ coupon, onClose, onSave }) {
  const [code, setCode] = useState(coupon.code);
  const [pct, setPct]   = useState(String(coupon.discount_percentage));
  return (
    <Modal open onClose={onClose} title={`Edit ${coupon.code}`}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => onSave({ code: code.toUpperCase(), discount_percentage: parseInt(pct, 10) || 0 })}>Save</Button></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Code"><Input value={code} onChange={v => setCode(v.toUpperCase())} /></Field>
        <Field label="Discount %"><Input value={pct} onChange={v => setPct(v.replace(/\D/g, ''))} /></Field>
      </div>
    </Modal>
  );
}

function ManageCouponsInner() {
  const { ownerRestaurant, loadCoupons, couponsForRestaurant, createCoupon, updateCoupon, deleteCoupon, showToast } = useStore();
  const r = ownerRestaurant;
  const [code, setCode]                   = useState('');
  const [pct, setPct]                     = useState('');
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editingRest, setEditingRest]     = useState(false);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);

  useEffect(() => { loadCoupons(r.id).catch(() => {}).finally(() => setLoading(false)); /* eslint-disable-next-line */ }, [r.id]);

  const coupons = couponsForRestaurant(r.id);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!code.trim()) return showToast({ kind: 'error', title: 'Code is required' });
    const discount = parseInt(pct, 10);
    if (isNaN(discount) || discount < 1 || discount > 100) return showToast({ kind: 'error', title: 'Discount must be 1–100' });
    try {
      await createCoupon(r.id, { code: code.trim().toUpperCase(), discount_percentage: discount });
      showToast({ kind: 'success', title: 'Coupon created!' });
      setCode(''); setPct(''); setShowForm(false);
    } catch (err) { showToast({ kind: 'error', title: err.message }); }
  };

  if (loading) return <PageShell><div style={{ textAlign: 'center', padding: 60, color: '#718096' }}>Loading coupons...</div></PageShell>;

  return (
    <PageShell>
      <PageHeader title="Coupons" subtitle="Reward customers with discount codes." />
      <OwnerRestaurantHeader onEdit={() => setEditingRest(true)} />

      <div style={{ marginBottom: 12 }}>
        <Button onClick={() => setShowForm(s => !s)} variant={showForm ? 'secondary' : 'primary'}>
          {showForm ? '× Close form' : '+ Add new coupon'}
        </Button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>New coupon</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Code"><Input value={code} onChange={v => setCode(v.toUpperCase())} placeholder="SAVE20" /></Field>
            <Field label="Discount %" hint="1 to 100"><Input value={pct} onChange={v => setPct(v.replace(/\D/g, ''))} placeholder="20" /></Field>
            <Button type="submit" full>Create coupon</Button>
          </form>
        </Card>
      )}

      <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Coupons ({coupons.length})</h3>
      {coupons.length === 0 ? (
        <EmptyState icon="🎟️" title="No coupons yet" body='Tap "+ Add new coupon" to create a discount.' />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {coupons.map(c => (
            <div key={c.id} style={{ background: 'white', border: '1px solid #EDF0F5', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
              <div style={{ fontSize: 22 }}>🎟️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}><code style={{ background: '#F7F8FC', padding: '2px 8px', borderRadius: 6 }}>{c.code}</code></div>
                <div style={{ fontSize: 13, color: '#38A169', fontWeight: 600, marginTop: 2 }}>{c.discount_percentage}% off</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size="sm" variant="secondary" onClick={() => setEditingCoupon(c)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={async () => {
                  try { await deleteCoupon(r.id, c.id); showToast({ kind: 'error', title: 'Coupon deleted' }); }
                  catch (err) { showToast({ kind: 'error', title: err.message }); }
                }}>✕</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingCoupon && (
        <CouponEditModal coupon={editingCoupon} onClose={() => setEditingCoupon(null)}
          onSave={async (changes) => {
            try { await updateCoupon(r.id, editingCoupon.id, changes); showToast({ kind: 'success', title: 'Coupon updated!' }); setEditingCoupon(null); }
            catch (err) { showToast({ kind: 'error', title: err.message }); }
          }}
        />
      )}
      {editingRest && <RestaurantEditModal restaurant={r} onClose={() => setEditingRest(false)} />}
    </PageShell>
  );
}

export function ManageCouponsPage() {
  return <OwnerRestaurantGate><ManageCouponsInner /></OwnerRestaurantGate>;
}
