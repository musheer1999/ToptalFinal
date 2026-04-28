import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import { Button, Card, Field, Input, Textarea, Select, Modal } from '../../components/ui';
import { useStore } from '../../context/StoreContext';
import { CUISINES } from '../../data/seedData';

export function PageShell({ children }) {
  return (
    <div style={{ background: '#F7F8FC', minHeight: '100vh' }}>
      <NavBar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 14px 80px' }}>
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ margin: 0, fontSize: 'clamp(20px, 6vw, 30px)', fontWeight: 800, color: '#1A202C', letterSpacing: -0.5 }}>{title}</h1>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: 14, color: '#718096' }}>{subtitle}</p>}
    </div>
  );
}

export function OwnerRestaurantGate({ children }) {
  const { ownerRestaurant, restaurants } = useStore();
  if (restaurants.length === 0) {
    return (
      <PageShell>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#718096' }}>Loading...</div>
      </PageShell>
    );
  }
  if (!ownerRestaurant) return <CreateRestaurantPage />;
  return children;
}

export function OwnerRestaurantHeader({ onEdit }) {
  const { ownerRestaurant } = useStore();
  if (!ownerRestaurant) return null;
  const r = ownerRestaurant;
  return (
    <div style={{
      background: 'white', border: '1px solid #EDF0F5', borderRadius: 14,
      marginBottom: 20, overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <img
          src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=200&q=80"
          alt=""
          style={{ width: 80, height: 80, objectFit: 'cover', flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0, padding: '12px 12px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ padding: '2px 8px', borderRadius: 999, background: '#FFF1EC', color: '#C2410C', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Your restaurant
            </span>
            <span style={{ padding: '2px 8px', borderRadius: 999, background: '#F7F8FC', fontSize: 11, fontWeight: 600, color: '#4A5568' }}>
              {r.cuisine}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A202C', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {r.name}
          </div>
          <div style={{ fontSize: 12, color: '#718096', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {r.description}
          </div>
        </div>
        <div style={{ padding: 12, flexShrink: 0 }}>
          <Button size="sm" variant="secondary" onClick={onEdit}>Edit</Button>
        </div>
      </div>
    </div>
  );
}

export function RestaurantEditModal({ restaurant, onClose }) {
  const { updateRestaurant, showToast } = useStore();
  const [form, setForm] = useState({
    name: restaurant.name, description: restaurant.description,
    cuisine: restaurant.cuisine, longitude: restaurant.longitude ?? '', latitude: restaurant.latitude ?? '',
  });
  const set = f => v => setForm(p => ({ ...p, [f]: v }));

  const save = async () => {
    try {
      await updateRestaurant(restaurant.id, {
        name: form.name, description: form.description, cuisine: form.cuisine,
        longitude: form.longitude === '' ? null : parseFloat(form.longitude),
        latitude:  form.latitude  === '' ? null : parseFloat(form.latitude),
      });
      showToast({ kind: 'success', title: 'Restaurant updated!' });
      onClose();
    } catch (err) { showToast({ kind: 'error', title: err.message }); }
  };

  return (
    <Modal open onClose={onClose} title="Edit restaurant"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={save}>Save changes</Button></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Name"><Input value={form.name} onChange={set('name')} /></Field>
        <Field label="Description"><Textarea value={form.description} onChange={set('description')} /></Field>
        <Field label="Cuisine"><Select value={form.cuisine} onChange={set('cuisine')} options={CUISINES} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Longitude" hint="Optional"><Input value={form.longitude} onChange={set('longitude')} placeholder="-122.4194" /></Field>
          <Field label="Latitude"  hint="Optional"><Input value={form.latitude}  onChange={set('latitude')}  placeholder="37.7749" /></Field>
        </div>
      </div>
    </Modal>
  );
}

export function CreateRestaurantPage() {
  const { createRestaurant, session, showToast } = useStore();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', description: '', cuisine: 'Italian', longitude: '', latitude: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = f => v => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim())        errs.name        = 'Restaurant name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await createRestaurant({
        name: form.name.trim(), description: form.description.trim(), cuisine: form.cuisine,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
      });
      showToast({ kind: 'success', title: 'Restaurant created!', body: `Welcome, ${form.name}!` });
      navigate('/owner/orders');
    } catch (err) { showToast({ kind: 'error', title: err.message }); }
    finally { setLoading(false); }
  };

  return (
    <PageShell>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🍽️</div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#1A202C' }}>Create your restaurant</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#718096' }}>Welcome, {session?.email}! Set up your restaurant to start receiving orders.</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Restaurant name" error={errors.name}><Input value={form.name} onChange={set('name')} placeholder="e.g. Bella Trattoria" error={errors.name} /></Field>
            <Field label="Description" error={errors.description}><Textarea value={form.description} onChange={set('description')} placeholder="What kind of food do you serve?" error={errors.description} /></Field>
            <Field label="Cuisine"><Select value={form.cuisine} onChange={set('cuisine')} options={CUISINES} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Longitude" hint="Optional"><Input value={form.longitude} onChange={set('longitude')} placeholder="-122.4194" /></Field>
              <Field label="Latitude"  hint="Optional"><Input value={form.latitude}  onChange={set('latitude')}  placeholder="37.7749" /></Field>
            </div>
            <Button type="submit" full size="lg" disabled={loading}>{loading ? 'Creating...' : 'Create restaurant →'}</Button>
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
