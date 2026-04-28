import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Button, Card, EmptyState, Field, Input, Textarea, Select, Modal, fmtMoney } from '../../components/ui';
import { PageShell, PageHeader, OwnerRestaurantGate, OwnerRestaurantHeader, RestaurantEditModal } from './_shared';
import { MEAL_TYPES } from '../../data/seedData';

function MealEditModal({ meal, onClose, onSave }) {
  const [form, setForm] = useState({
    name: meal.name, description: meal.description || '',
    price: String(meal.price), type: meal.type || 'Main',
  });
  const set = f => v => setForm(p => ({ ...p, [f]: v }));
  return (
    <Modal open onClose={onClose} title={`Edit: ${meal.name}`}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={() => onSave({ name: form.name, description: form.description, price: parseFloat(form.price) || 0, type: form.type })}>Save</Button></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Name"><Input value={form.name} onChange={set('name')} /></Field>
        <Field label="Description"><Textarea value={form.description} onChange={set('description')} rows={2} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label="Price (₹)"><Input value={form.price} onChange={v => setForm(p => ({...p, price: v.replace(/[^0-9.]/g, '')}))} /></Field>
          <Field label="Type"><Select value={form.type} onChange={set('type')} options={MEAL_TYPES} /></Field>
        </div>
      </div>
    </Modal>
  );
}

function ManageMealsInner() {
  const { ownerRestaurant, loadMeals, mealsForRestaurant, createMeal, updateMeal, deleteMeal, showToast } = useStore();
  const r = ownerRestaurant;
  const [form, setForm]             = useState({ name: '', description: '', price: '', type: 'Main' });
  const set = f => v => setForm(p => ({ ...p, [f]: v }));
  const [editingMeal, setEditingMeal]   = useState(null);
  const [deletingMeal, setDeletingMeal] = useState(null);
  const [editingRest, setEditingRest]   = useState(false);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);

  useEffect(() => { loadMeals(r.id).catch(() => {}).finally(() => setLoading(false)); /* eslint-disable-next-line */ }, [r.id]);

  const meals = mealsForRestaurant(r.id);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast({ kind: 'error', title: 'Meal name is required' });
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) return showToast({ kind: 'error', title: 'Enter a valid price' });
    try {
      await createMeal(r.id, { name: form.name.trim(), description: form.description.trim(), price, type: form.type });
      showToast({ kind: 'success', title: 'Meal created!', body: form.name });
      setForm({ name: '', description: '', price: '', type: 'Main' });
      setShowForm(false);
    } catch (err) { showToast({ kind: 'error', title: err.message }); }
  };

  if (loading) return <PageShell><div style={{ textAlign: 'center', padding: 60, color: '#718096' }}>Loading meals...</div></PageShell>;

  return (
    <PageShell>
      <PageHeader title="Meals" subtitle="Add and edit meals on your menu." />
      <OwnerRestaurantHeader onEdit={() => setEditingRest(true)} />

      <div style={{ marginBottom: 12 }}>
        <Button onClick={() => setShowForm(s => !s)} variant={showForm ? 'secondary' : 'primary'}>
          {showForm ? '× Close form' : '+ Add new meal'}
        </Button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>New meal</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Meal name"><Input value={form.name} onChange={set('name')} placeholder="e.g. Carbonara" /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={set('description')} placeholder="What's in it?" rows={2} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Field label="Price (₹)"><Input value={form.price} onChange={v => setForm(p => ({...p, price: v.replace(/[^0-9.]/g, '')}))} placeholder="14.50" /></Field>
              <Field label="Type"><Select value={form.type} onChange={set('type')} options={MEAL_TYPES} /></Field>
            </div>
            <Button type="submit" full>Create meal</Button>
          </form>
        </Card>
      )}

      <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Menu ({meals.length})</h3>
      {meals.length === 0 ? (
        <EmptyState icon="🍕" title="No meals yet" body='Tap "+ Add new meal" to add your first item.' />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {meals.map(meal => (
            <div key={meal.id} style={{ background: 'white', border: '1px solid #EDF0F5', borderRadius: 12, padding: 14, display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FFF1EC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🍽️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{meal.name}</div>
                <div style={{ fontSize: 12, color: '#718096', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{meal.description}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#FF6B35' }}>{fmtMoney(parseFloat(meal.price))}</span>
                  <span style={{ padding: '1px 7px', borderRadius: 999, background: '#F7F8FC', fontSize: 11, fontWeight: 600, color: '#4A5568' }}>{meal.type}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <Button size="sm" variant="secondary" onClick={() => setEditingMeal(meal)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => setDeletingMeal(meal)}>✕</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingMeal && (
        <MealEditModal meal={editingMeal} onClose={() => setEditingMeal(null)}
          onSave={async (changes) => {
            try { await updateMeal(r.id, editingMeal.id, changes); showToast({ kind: 'success', title: 'Meal updated!' }); setEditingMeal(null); }
            catch (err) { showToast({ kind: 'error', title: err.message }); }
          }}
        />
      )}
      {deletingMeal && (
        <Modal open onClose={() => setDeletingMeal(null)} title="Delete meal?" size="sm"
          footer={<>
            <Button variant="secondary" onClick={() => setDeletingMeal(null)}>Cancel</Button>
            <Button style={{ background: '#E53E3E', borderColor: '#E53E3E', color: 'white' }} onClick={async () => {
              try { await deleteMeal(r.id, deletingMeal.id); showToast({ kind: 'error', title: 'Meal deleted' }); setDeletingMeal(null); }
              catch (err) { showToast({ kind: 'error', title: err.message }); }
            }}>Delete</Button>
          </>}
        >
          <p style={{ margin: 0, color: '#4A5568' }}><strong>{deletingMeal.name}</strong> will be removed.</p>
        </Modal>
      )}
      {editingRest && <RestaurantEditModal restaurant={r} onClose={() => setEditingRest(false)} />}
    </PageShell>
  );
}

export function ManageMealsPage() {
  return <OwnerRestaurantGate><ManageMealsInner /></OwnerRestaurantGate>;
}
