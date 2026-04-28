// ============================================================
// App.js — The Router: connects URLs to pages
//
// React Router watches the URL and shows the right component.
// Example: user goes to /browse-restaurants → BrowseRestaurantsPage shows
//
// Route types used here:
//  - Public routes: anyone can visit (landing, sign-in, sign-up)
//  - Customer routes: only logged-in customers
//  - Owner routes: only logged-in restaurant owners
// ============================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import the global state provider
import { StoreProvider, useStore } from './context/StoreContext';

// Import toast notification container
import { ToastContainer } from './components/ui';

// Import all pages
import { LandingPage } from './pages/auth/LandingPage';
import { SignInPage }  from './pages/auth/SignInPage';
import { SignUpPage }  from './pages/auth/SignUpPage';
import { BrowseRestaurantsPage } from './pages/customer/BrowseRestaurantsPage';
import { BrowseMealsPage }       from './pages/customer/BrowseMealsPage';
import { CartPage }              from './pages/customer/CartPage';
import { CustomerOrdersPage }    from './pages/customer/CustomerOrdersPage';
import { OrderDetailPage }       from './pages/customer/OrderDetailPage';
import { OwnerOrdersPage }       from './pages/owner/OwnerOrdersPage';
import { ManageRestaurantsPage } from './pages/owner/ManageRestaurantsPage';
import { ManageMealsPage }       from './pages/owner/ManageMealsPage';
import { ManageCouponsPage }     from './pages/owner/ManageCouponsPage';
import { ManageUsersPage }       from './pages/owner/ManageUsersPage';

// ── PROTECTED ROUTE HELPERS ─────────────────────────────────────
// These check if the user is logged in / has the right role before
// showing a page. If not, they redirect to the sign-in page.

// Only for logged-in customers
function CustomerRoute({ children }) {
  const { session } = useStore();
  if (!session) return <Navigate to="/sign-in" replace />;
  if (session.role !== 'customer') return <Navigate to="/owner/orders" replace />;
  return children;
}

// Only for logged-in restaurant owners
function OwnerRoute({ children }) {
  const { session } = useStore();
  if (!session) return <Navigate to="/sign-in" replace />;
  if (session.role !== 'owner') return <Navigate to="/browse-restaurants" replace />;
  return children;
}

// ── APP CONTENT ─────────────────────────────────────────────────
// Separated so it can access the StoreContext (useStore)
function AppContent() {
  const { toasts, backendOffline } = useStore();

  return (
    <>
      {/* Backend offline banner */}
      {backendOffline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#FFF3CD', borderBottom: '1px solid #FFEAA7',
          padding: '10px 20px', textAlign: 'center', fontSize: 14, color: '#856404',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span>⚠️</span>
          <strong>Backend is not running.</strong>
          <span>Start the backend server  to use the app.</span>
        </div>
      )}

      {/* Push content down when banner is visible */}
      {backendOffline && <div style={{ height: 41 }} />}

      {/* All routes */}
      <Routes>
        {/* ── PUBLIC ROUTES ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        {/* ── CUSTOMER ROUTES ── */}
        <Route path="/browse-restaurants" element={
          <CustomerRoute><BrowseRestaurantsPage /></CustomerRoute>
        } />
        <Route path="/browse-meals/:restaurantId" element={
          <CustomerRoute><BrowseMealsPage /></CustomerRoute>
        } />
        <Route path="/cart" element={
          <CustomerRoute><CartPage /></CustomerRoute>
        } />
        <Route path="/orders/customer" element={
          <CustomerRoute><CustomerOrdersPage /></CustomerRoute>
        } />
        <Route path="/orders/:orderId" element={
          // Both customer AND owner can view order details
          <OrderDetailPage />
        } />

        {/* ── OWNER ROUTES ── */}
        <Route path="/owner/orders" element={
          <OwnerRoute><OwnerOrdersPage /></OwnerRoute>
        } />
        <Route path="/owner/restaurants" element={
          <OwnerRoute><ManageRestaurantsPage /></OwnerRoute>
        } />
        <Route path="/owner/meals" element={
          <OwnerRoute><ManageMealsPage /></OwnerRoute>
        } />
        <Route path="/owner/coupons" element={
          <OwnerRoute><ManageCouponsPage /></OwnerRoute>
        } />
        <Route path="/owner/users" element={
          <OwnerRoute><ManageUsersPage /></OwnerRoute>
        } />

        {/* ── CATCH ALL ── */}
        {/* Any unknown URL goes back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast notifications — shown on top of everything */}
      <ToastContainer toasts={toasts} />

      {/* Global CSS animation for toasts */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </>
  );
}

// ── MAIN APP ────────────────────────────────────────────────────
// The App component wraps everything with:
//  1. BrowserRouter — enables URL routing
//  2. StoreProvider — makes global state available everywhere
export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </BrowserRouter>
  );
}
