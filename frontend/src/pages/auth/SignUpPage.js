import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { Button, Field, Input, Select } from '../../components/ui';
import { AuthCard } from './AuthCard';

export function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, session } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (session) {
    return (
      <Navigate to={session.role === 'owner' ? '/owner/orders' : '/browse-restaurants'} replace />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!role) errs.role = 'Please select a role';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const user = await signUp(email.trim().toLowerCase(), password, role);
      navigate(user.role === 'owner' ? '/owner/orders' : '/browse-restaurants');
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Create account" subtitle="Join ToptalMeals today">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Email address" error={errors.email}>
          <Input
            type="email"
            value={email}
            onChange={(v) => {
              setEmail(v);
              setErrors((p) => ({ ...p, email: '' }));
            }}
            placeholder="you@gmail.com"
            error={errors.email}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <Input
            type="password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              setErrors((p) => ({ ...p, password: '' }));
            }}
            placeholder="Min. 6 characters"
            error={errors.password}
          />
        </Field>
        <Field label="I am a..." error={errors.role}>
          <Select
            value={role}
            onChange={(v) => {
              setRole(v);
              setErrors((p) => ({ ...p, role: '' }));
            }}
            placeholder="Select your role"
            options={[
              { value: 'customer', label: 'Regular User (Customer)' },
              { value: 'owner', label: 'Restaurant Owner' },
            ]}
          />
        </Field>
        {errors.form && (
          <div
            style={{
              fontSize: 13,
              color: '#E53E3E',
              background: '#FFF5F5',
              padding: '10px 12px',
              borderRadius: 8,
            }}
          >
            {errors.form}
          </div>
        )}
        <Button type="submit" full size="lg" disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#718096' }}>
        Already have an account?{' '}
        <button
          onClick={() => navigate('/sign-in')}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            fontFamily: 'inherit',
            fontSize: 13,
          }}
        >
          Sign in
        </button>
      </p>
    </AuthCard>
  );
}
