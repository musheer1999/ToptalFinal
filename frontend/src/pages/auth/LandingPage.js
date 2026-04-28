import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Button } from '../../components/ui';

export function LandingPage() {
  const navigate = useNavigate();
  const { session } = useStore();

  if (session) {
    return (
      <Navigate to={session.role === 'owner' ? '/owner/orders' : '/browse-restaurants'} replace />
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fff4f0 0%, #f7f8fc 60%, #fff4f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 520, width: '100%' }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: 'bounce 2s infinite' }}>🍔</div>
        <h1
          style={{
            fontSize: 'clamp(28px, 8vw, 42px)',
            fontWeight: 800,
            color: '#1A202C',
            letterSpacing: -1,
            margin: '0 0 12px',
          }}
        >
          Meal<span style={{ color: '#FF6B35' }}>route</span>
        </h1>
        <p style={{ fontSize: 16, color: '#718096', marginBottom: 36, lineHeight: 1.6 }}>
          Order delicious meals from your favourite restaurants. Fast delivery, right to your door.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button size="lg" onClick={() => navigate('/sign-in')}>
            Sign in
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/sign-up')}>
            Create account
          </Button>
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 48 }}
        >
          {[
            { icon: '🍽️', label: 'Browse Restaurants' },
            { icon: '🛒', label: 'Easy Ordering' },
            { icon: '🔔', label: 'Live Status Updates' },
            { icon: '📦', label: 'Track Your Orders' },
          ].map((f) => (
            <div
              key={f.label}
              style={{
                background: 'white',
                border: '1px solid #E8ECF0',
                borderRadius: 14,
                padding: '16px 12px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#718096' }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`}</style>
    </div>
  );
}
