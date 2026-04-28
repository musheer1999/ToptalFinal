import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, Input } from '../../../components/ui';
import { PageShell, PageHeader } from '../_shared';
import useBrowseRestaurants from './useBrowseRestaurants';
import useBrowseRestaurantsQuery from './useBrowseRestaurantsQuery';

const CUISINE_IMAGES = {
  Italian:  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  Japanese: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
  Mexican:  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
  American: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  Indian:   'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
  Thai:     'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80',
  French:   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
  Chinese:  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
  default:  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
};

function RestaurantCard({ restaurant: r }) {
  const navigate = useNavigate();
  const image = CUISINE_IMAGES[r.cuisine] || CUISINE_IMAGES.default;
  return (
    <div onClick={() => navigate(`/browse-meals/${r.id}`)} style={{
      background: 'white', border: '1px solid #EDF0F5', borderRadius: 14,
      overflow: 'hidden', cursor: 'pointer',
      boxShadow: '0 1px 3px rgba(15,23,42,0.06)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,23,42,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ height: 160, background: '#F7F8FC', position: 'relative', overflow: 'hidden' }}>
        <img src={image} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.95)', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>
          {r.cuisine || 'Various'}
        </div>
      </div>
      <div style={{ padding: 14 }}>
        <h3 style={{ margin: '0 0 5px', fontSize: 15, fontWeight: 700, color: '#1A202C' }}>{r.name}</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#718096', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {r.description || 'Click to view menu'}
        </p>
        <Button size="sm">Browse menu →</Button>
      </div>
    </div>
  );
}

export function BrowseRestaurantsPage() {
  const [search, setSearch]   = useState('');
  const [cuisine, setCuisine] = useState('All');

  const { restaurants, onAfterGetRestaurants } = useBrowseRestaurants();

  const { loading, loadRestaurants } = useBrowseRestaurantsQuery({ onAfterGetRestaurants });

  const cuisines = useMemo(() =>
    ['All', ...new Set(restaurants.map(r => r.cuisine).filter(Boolean))],
  [restaurants]);

  const filtered = restaurants.filter(r =>
    (cuisine === 'All' || r.cuisine === cuisine) &&
    (search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.cuisine || '').toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  if (loading) {
    return <PageShell><div style={{ textAlign: 'center', padding: 80, color: '#718096' }}>Loading restaurants...</div></PageShell>;
  }

  return (
    <PageShell>
      <PageHeader title="Browse restaurants" subtitle={`${restaurants.length} kitchens delivering tonight.`} />

      <div style={{ marginBottom: 16 }}>
        <Input value={search} onChange={setSearch} placeholder="Search restaurants or cuisines..."
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg>}
        />
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {cuisines.map(c => (
          <button key={c} onClick={() => setCuisine(c)} style={{
            padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', border: '1px solid', whiteSpace: 'nowrap', flexShrink: 0,
            borderColor: cuisine === c ? '#1A202C' : '#E2E8F0',
            background: cuisine === c ? '#1A202C' : 'white',
            color: cuisine === c ? 'white' : '#4A5568',
          }}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No restaurants found" body="Try a different search or filter." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      )}
    </PageShell>
  );
}