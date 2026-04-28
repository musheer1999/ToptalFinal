import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Button, Field, Input } from '../../components/ui';
import { AuthCard } from './AuthCard';

export function SignInPage() {
  const navigate = useNavigate();
  const { signIn, session } = useStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  if (session) {
    return <Navigate to={session.role === 'owner' ? '/owner/orders' : '/browse-restaurants'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!password)     { setError('Please enter your password'); return; }
    setLoading(true);
    try {
      const user = await signIn(email.trim().toLowerCase(), password);
      navigate(user.role === 'owner' ? '/owner/orders' : '/browse-restaurants');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Email address">
          <Input type="email" value={email} onChange={setEmail} placeholder="you@gmail.com" />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={setPassword} placeholder="Password" />
        </Field>
        {error && (
          <div style={{ fontSize: 13, color: '#E53E3E', background: '#FFF5F5', padding: '10px 12px', borderRadius: 8 }}>
            {error}
          </div>
        )}
        <Button type="submit" full size="lg" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#718096' }}>
        Don't have an account?{' '}
        <button onClick={() => navigate('/sign-up')} style={{
          background: 'none', border: 'none', color: '#FF6B35',
          fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 13,
        }}>
          Sign up
        </button>
      </p>
    </AuthCard>
  );
}
