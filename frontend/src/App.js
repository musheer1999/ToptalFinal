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
import { CartProvider } from './context/CartContext';

// Import toast notification container
import { ToastContainer } from './components/ui';

// Import all pages
import { LandingPage } from './pages/auth/LandingPage';
import { SignInPage }  from './pages/auth/SignInPage';
import { SignUpPage }  from './pages/auth/SignUpPage';
import {
  BrowseMealsPage,
  BrowseRestaurantsPage,
  CartPage,
  CustomerOrdersPage,
  OrderDetailPage,
} from './pages/customer';
import {
  OwnerOrdersPage,
  ManageMealsPage,
  ManageUsersPage,
  ManageCouponsPage,
  ManageRestaurantsPage,
} from './pages/owner';

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
  const { toasts } = useStore();

  return (
    <>
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
        <CartProvider>
          <AppContent />
        </CartProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}
