// ============================================================
// NavBar.js — Fully responsive top navigation bar
//
// Works at 280px → desktop without ANY wrapping
// Key strategy:
//   - Logo = icon only on very small screens
//   - Customer nav = icon buttons on mobile
//   - Owner nav = "Orders" + compact "Manage▾" dropdown
//   - User menu = avatar circle only (no email shown)
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useCartContext } from '../../context/CartContext';
import { fmtMoney, QtyStepper, Button } from '.';

// ── LOGO ──────────────────────────────────────────────────────
function Logo() {
  const navigate = useNavigate();
  const { session } = useStore();
  const home = session?.role === 'owner' ? '/owner/orders' : '/browse-restaurants';
  return (
    <div
      onClick={() => navigate(home)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}
    >
      <img src="/logo.png" alt="logo" style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
      {/* Text hidden below 380px */}
      
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#1A202C',
          letterSpacing: -0.3,
          whiteSpace: 'nowrap',
        }}
        className="logo-text"
      >
        ToptalMeals
      </span>

     
    </div>
  );
}

// ── CUSTOMER NAVIGATION ────────────────────────────────────────
function CustomerNavLinks({ onOpenCart }) {
  const { cartCount } = useCartContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navBtn = (to, fullLabel, shortLabel, active) => (
    <button
      onClick={() => navigate(to)}
      style={{
        padding: '6px 8px',
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        color: active ? '#1A202C' : '#4A5568',
        background: active ? '#F0F2F5' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <span className="full-label">{fullLabel}</span>
      <span className="short-label">{shortLabel}</span>
    </button>
  );

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
      {navBtn(
        '/browse-restaurants',
        'Restaurants',
        'Browse',
        pathname.startsWith('/browse-restaurants')
      )}
      {/* "My Orders" → "Orders" on mobile */}
      {navBtn('/orders/customer', 'My Orders', 'Orders', pathname.startsWith('/orders/customer'))}

      {/* Cart button - always shows */}
      <button
        onClick={onOpenCart}
        style={{
          border: '1px solid #E2E8F0',
          background: 'white',
          borderRadius: 999,
          padding: '6px 10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 13,
          fontWeight: 600,
          color: '#1A202C',
          cursor: 'pointer',
          fontFamily: 'inherit',
          marginLeft: 2,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
        </svg>
        <span className="full-label">Cart</span>
        {cartCount > 0 ? (
          <span
            style={{
              background: '#FF6B35',
              color: 'white',
              borderRadius: 999,
              minWidth: 18,
              height: 18,
              fontSize: 10,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}
          >
            {cartCount}
          </span>
        ) : null}
      </button>
    </nav>
  );
}

// ── OWNER NAVIGATION ───────────────────────────────────────────
function OwnerNavLinks() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const isManageActive = [
    '/owner/restaurants',
    '/owner/meals',
    '/owner/coupons',
    '/owner/users',
  ].some((p) => pathname.startsWith(p));
  const isOrdersActive = pathname.startsWith('/owner/orders');

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
      <button
        onClick={() => navigate('/owner/orders')}
        style={{
          padding: '6px 8px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 500,
          color: isOrdersActive ? '#1A202C' : '#4A5568',
          background: isOrdersActive ? '#F0F2F5' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        Orders
      </button>

      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            padding: '6px 8px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: isManageActive ? '#1A202C' : '#4A5568',
            background: isManageActive ? '#F0F2F5' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            whiteSpace: 'nowrap',
          }}
        >
          Manage
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path
              d="M1 1l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {open && (
          <div
            style={{
              position: 'fixed',
              top: 56,
              right: 12, // fixed so it doesn't clip
              background: 'white',
              border: '1px solid #EDF0F5',
              borderRadius: 12,
              boxShadow: '0 12px 32px rgba(15,23,42,0.14)',
              minWidth: 190,
              padding: 6,
              zIndex: 200,
            }}
          >
            {[
              { to: '/owner/restaurants', icon: '🍽️', label: 'My Restaurant' },
              { to: '/owner/meals', icon: '🍕', label: 'Meals' },
              { to: '/owner/coupons', icon: '🎟️', label: 'Coupons' },
              { to: '/owner/users', icon: '👥', label: 'Users' },
            ].map((item) => (
              <button
                key={item.to}
                onClick={() => {
                  navigate(item.to);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#1A202C',
                  background: pathname.startsWith(item.to) ? '#F7F8FC' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

// ── USER AVATAR MENU ───────────────────────────────────────────
function UserMenu() {
  const { session, signOut } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: session.role === 'owner' ? '#1A202C' : '#FF6B35',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {session.email[0].toUpperCase()}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            top: 56,
            right: 12,
            background: 'white',
            border: '1px solid #EDF0F5',
            borderRadius: 12,
            boxShadow: '0 12px 32px rgba(15,23,42,0.14)',
            minWidth: 200,
            padding: 6,
            zIndex: 200,
          }}
        >
          <div
            style={{
              padding: '8px 12px 2px',
              fontSize: 11,
              color: '#718096',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Signed in as
          </div>
          <div
            style={{ padding: '0 12px 6px', fontSize: 13, fontWeight: 600, wordBreak: 'break-all' }}
          >
            {session.email}
          </div>
          <div
            style={{
              padding: '0 12px 6px',
              fontSize: 11,
              color: '#718096',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {session.role}
          </div>
          <div style={{ height: 1, background: '#EDF0F5', margin: '4px 0' }} />
          <button
            onClick={() => {
              setOpen(false);
              signOut();
              navigate('/');
            }}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 14,
              color: '#E53E3E',
              fontFamily: 'inherit',
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ── CART DRAWER ────────────────────────────────────────────────
function CartDrawer({ onClose }) {
  const { cart, updateCartQty, removeFromCart, cartSubtotal, cartCount } = useCartContext();
  const navigate = useNavigate();
  const restaurantName = cart.restaurantName || 'Current restaurant';

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 300 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 420,
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(15,23,42,0.15)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #EDF0F5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>Your cart</div>
            {cart.restaurantId && (
              <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>
                from {restaurantName}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: '#F7F8FC',
              borderRadius: 999,
              width: 32,
              height: 32,
              fontSize: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {cartCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: 40 }}>🛒</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 12 }}>Your cart is empty</div>
              <div style={{ fontSize: 14, color: '#718096', marginTop: 6 }}>
                Add meals to get started
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.items.map((item) => {
                return (
                  <div
                    key={item.mealId}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: 12,
                      border: '1px solid #EDF0F5',
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 10,
                        background: '#FFF1EC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        flexShrink: 0,
                      }}
                    >
                      🍽️
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{item.mealName}</div>
                      <div
                        style={{ fontSize: 13, color: '#FF6B35', fontWeight: 600, marginTop: 2 }}
                      >
                        {fmtMoney(parseFloat(item.price))}
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <QtyStepper
                          value={item.qty}
                          onChange={(q) => updateCartQty(item.mealId, q)}
                          min={0}
                        />
                        <button
                          onClick={() => removeFromCart(item.mealId)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#E53E3E',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {cartCount > 0 && (
          <div style={{ borderTop: '1px solid #EDF0F5', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: '#718096' }}>Subtotal</span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>{fmtMoney(cartSubtotal)}</span>
            </div>
            <Button
              full
              size="lg"
              onClick={() => {
                onClose();
                navigate('/cart');
              }}
            >
              Go to checkout →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN NAVBAR ────────────────────────────────────────────────
export default function NavBar() {
  const { session } = useStore();
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  if (!session) return null;

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(255,255,255,0.96)' : 'white',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: '1px solid #EDF0F5',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 54,
            padding: '0 14px',
          }}
        >
          <Logo />
          <div style={{ flex: 1 }} />
          {session.role === 'owner' ? (
            <OwnerNavLinks />
          ) : (
            <CustomerNavLinks onOpenCart={() => setCartOpen(true)} />
          )}
          <div
            style={{ width: 1, height: 18, background: '#E2E8F0', flexShrink: 0, margin: '0 4px' }}
          />
          <UserMenu />
        </div>
      </header>

      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}

      {/* Global responsive CSS */}
      <style>{`
        /* Below 480px: show short label, hide full label */
        @media (max-width: 480px) {
          .full-label { display: none !important; }
          .short-label { display: inline !important; }
        }
        @media (min-width: 481px) {
          .short-label { display: none !important; }
        }
        /* Below 360px: hide logo text */
        @media (max-width: 360px) { .logo-text { display: none !important; } }
      `}</style>
    </>
  );
}
