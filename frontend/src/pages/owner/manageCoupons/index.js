import React, { useEffect, useState } from 'react';
import { Button, Card, EmptyState, Field, Input, Modal } from '../../../components/ui';
import { OwnerRestaurantGate, OwnerRestaurantHeader, PageHeader, PageShell, RestaurantEditModal } from '../_shared';
import useManageCoupons from './useManageCoupons';
import useManageCouponsQuery from './useManageCouponsQuery';

function CouponEditModal({ coupon, onClose, onSave }) {
  const [pct, setPct] = useState(String(coupon.discount_percentage));
  const [code, setCode] = useState(coupon.code);

  return (
    <Modal open onClose={onClose} title={`Edit ${coupon.code}`}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => onSave({ code: code.toUpperCase(), discount_percentage: parseInt(pct, 10) || 0 })}>Save</Button></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Code"><Input value={code} onChange={(value) => setCode(value.toUpperCase())} /></Field>
        <Field label="Discount %"><Input value={pct} onChange={(value) => setPct(value.replace(/\D/g, ''))} /></Field>
      </div>
    </Modal>
  );
}

function ManageCouponsInner() {
  const {
    pct,
    code,
    showForm,
    coupons,
    loading,
    editingRest,
    ownerRestaurant,
    editingCoupon,
    setPct,
    setCode,
    setLoading,
    setShowForm,
    notifyError,
    notifySuccess,
    setEditingRest,
    onCouponsLoaded,
    setEditingCoupon,
  } = useManageCoupons();
  const { loadCoupons, createCoupon, updateCoupon, deleteCoupon } = useManageCouponsQuery();

  useEffect(() => {
    loadCoupons(ownerRestaurant.id).then(onCouponsLoaded).catch(() => {}).finally(() => setLoading(false));
  }, [loadCoupons, onCouponsLoaded, ownerRestaurant.id, setLoading]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!code.trim()) return notifyError('Code is required');
    const discount = parseInt(pct, 10);
    if (Number.isNaN(discount) || discount < 1 || discount > 100) return notifyError('Discount must be 1–100');
    try {
      await createCoupon(ownerRestaurant.id, { code: code.trim().toUpperCase(), discount_percentage: discount });
      const loadedCoupons = await loadCoupons(ownerRestaurant.id);
      onCouponsLoaded(loadedCoupons);
      notifySuccess('Coupon created!');
      setCode('');
      setPct('');
      setShowForm(false);
    } catch (err) {
      notifyError(err.message);
    }
  };

  if (loading) return <PageShell><div style={{ textAlign: 'center', padding: 60, color: '#718096' }}>Loading coupons...</div></PageShell>;

  return (
    <PageShell>
      <PageHeader title="Coupons" subtitle="Reward customers with discount codes." />
      <OwnerRestaurantHeader onEdit={() => setEditingRest(true)} />
      <div style={{ marginBottom: 12 }}>
        <Button onClick={() => setShowForm((prev) => !prev)} variant={showForm ? 'secondary' : 'primary'}>
          {showForm ? '× Close form' : '+ Add new coupon'}
        </Button>
      </div>
      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>New coupon</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Code"><Input value={code} onChange={(value) => setCode(value.toUpperCase())} placeholder="SAVE20" /></Field>
            <Field label="Discount %" hint="1 to 100"><Input value={pct} onChange={(value) => setPct(value.replace(/\D/g, ''))} placeholder="20" /></Field>
            <Button type="submit" full>Create coupon</Button>
          </form>
        </Card>
      )}
      <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Coupons ({coupons.length})</h3>
      {coupons.length === 0 ? (
        <EmptyState icon="🎟️" title="No coupons yet" body='Tap "+ Add new coupon" to create a discount.' />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {coupons.map((coupon) => (
            <div key={coupon.id} style={{ background: 'white', border: '1px solid #EDF0F5', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
              <div style={{ fontSize: 22 }}>🎟️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}><code style={{ background: '#F7F8FC', padding: '2px 8px', borderRadius: 6 }}>{coupon.code}</code></div>
                <div style={{ fontSize: 13, color: '#38A169', fontWeight: 600, marginTop: 2 }}>{coupon.discount_percentage}% off</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size="sm" variant="secondary" onClick={() => setEditingCoupon(coupon)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={async () => {
                  try {
                    await deleteCoupon(ownerRestaurant.id, coupon.id);
                    const loadedCoupons = await loadCoupons(ownerRestaurant.id);
                    onCouponsLoaded(loadedCoupons);
                    notifyError('Coupon deleted');
                  } catch (err) {
                    notifyError(err.message);
                  }
                }}>✕</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editingCoupon && (
        <CouponEditModal coupon={editingCoupon} onClose={() => setEditingCoupon(null)}
          onSave={async (changes) => {
            try {
              await updateCoupon(ownerRestaurant.id, editingCoupon.id, changes);
              const loadedCoupons = await loadCoupons(ownerRestaurant.id);
              onCouponsLoaded(loadedCoupons);
              notifySuccess('Coupon updated!');
              setEditingCoupon(null);
            } catch (err) {
              notifyError(err.message);
            }
          }}
        />
      )}
      {editingRest && <RestaurantEditModal restaurant={ownerRestaurant} onClose={() => setEditingRest(false)} />}
    </PageShell>
  );
}

export function ManageCouponsPage() {
  return <OwnerRestaurantGate><ManageCouponsInner /></OwnerRestaurantGate>;
}
