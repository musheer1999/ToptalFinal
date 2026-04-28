import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button, EmptyState, Banner } from '../../components/ui';
import { PageShell, PageHeader, OwnerRestaurantGate, OwnerRestaurantHeader, RestaurantEditModal } from './_shared';

function ManageUsersInner() {
  const { ownerRestaurant, loadUsers, users, blockUser, unblockUser, showToast } = useStore();
  const r = ownerRestaurant;
  const [loading, setLoading]         = useState(true);
  const [editingRest, setEditingRest] = useState(false);

  useEffect(() => { loadUsers().catch(() => {}).finally(() => setLoading(false)); /* eslint-disable-next-line */ }, []);

  if (loading) return <PageShell><div style={{ textAlign: 'center', padding: 60, color: '#718096' }}>Loading users...</div></PageShell>;

  const customers = users.filter(u => u.role === 'customer');

  return (
    <PageShell>
      <PageHeader title="Manage users" subtitle="Block or unblock customers from ordering." />
      <OwnerRestaurantHeader onEdit={() => setEditingRest(true)} />
      <div style={{ marginBottom: 14 }}>
        <Banner tone="warning">⚠️ Blocking a user prevents them from placing orders at your restaurant.</Banner>
      </div>

      {customers.length === 0 ? (
        <EmptyState icon="👥" title="No customers yet" body="Customers who order from you will appear here." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {customers.map(user => {
            const blocked = user.is_blocked;
            return (
              <div key={user.id} style={{ background: 'white', border: '1px solid #EDF0F5', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 999, background: '#FFF1EC', color: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {user.email[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                  <div style={{ marginTop: 4 }}>
                    {blocked
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: '#FEE7E7', color: '#9B2C2C', fontSize: 11, fontWeight: 600 }}><span style={{ width: 5, height: 5, borderRadius: 999, background: '#E53E3E' }} />Blocked</span>
                      : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, background: '#E6F7EC', color: '#22543D', fontSize: 11, fontWeight: 600 }}><span style={{ width: 5, height: 5, borderRadius: 999, background: '#38A169' }} />Active</span>
                    }
                  </div>
                </div>
                <Button size="sm" variant={blocked ? 'success' : 'danger'} onClick={async () => {
                  try {
                    if (blocked) { await unblockUser(user.id, r.id); showToast({ kind: 'success', title: `Unblocked ${user.email}` }); }
                    else         { await blockUser(user.id, r.id);   showToast({ kind: 'error',   title: `Blocked ${user.email}` }); }
                  } catch (err) { showToast({ kind: 'error', title: err.message }); }
                }}>
                  {blocked ? 'Unblock' : 'Block'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
      {editingRest && <RestaurantEditModal restaurant={r} onClose={() => setEditingRest(false)} />}
    </PageShell>
  );
}

export function ManageUsersPage() {
  return <OwnerRestaurantGate><ManageUsersInner /></OwnerRestaurantGate>;
}
