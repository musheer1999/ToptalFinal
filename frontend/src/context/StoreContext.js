// ============================================================
// StoreContext.js — The "brain" of the app
//
// This file connects the frontend to the REAL backend API.
// Instead of using fake seed data, every action now calls
// http://localhost:5000/api/... to get/save real data.
//
// HOW IT WORKS:
//   1. User clicks something (e.g., "Add meal")
//   2. The page calls a function from this file (e.g., createMeal)
//   3. That function sends an HTTP request to the backend
//   4. Backend saves to PostgreSQL and returns the result
//   5. We update React state so the UI re-renders
// ============================================================

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';

// ── BACKEND URL ──────────────────────────────────────────────────
// All API calls go here. Your backend must be running at this address.
// Start backend with: npm run dev (inside the backend folder)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── API HELPER ───────────────────────────────────────────────────
// A wrapper around fetch() so we don't repeat the same code everywhere.
// Automatically attaches the JWT token from localStorage.
//
// Usage:
//   const data = await apiCall('GET', '/restaurants');
//   const data = await apiCall('POST', '/auth/login', { email, password });
async function apiCall(method, endpoint, body = null) {
  // Build request headers
  const headers = { 'Content-Type': 'application/json' };

  // Attach JWT token if user is logged in
  // The backend checks this token to know who is making the request
  const token = localStorage.getItem('fd_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Build fetch options
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  // If server returned an error status (400, 401, 403, 404, 500...)
  // throw an error so our catch blocks handle it
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
}

// ── CREATE CONTEXT ───────────────────────────────────────────────
// This is the "empty box" — we fill it in StoreProvider below
const StoreContext = createContext(null);

// ── STORE PROVIDER ───────────────────────────────────────────────
// Wrap your whole app with this. Every component inside can then
// call useStore() to get data and functions.
export function StoreProvider({ children }) {
  // ── AUTH STATE ───────────────────────────────────────────────
  // session = null → not logged in
  // session = { id, email, role } → logged in user
  //
  // We read from localStorage so user stays logged in after page refresh
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem('fd_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── DATA STATE ───────────────────────────────────────────────
  // These hold data fetched from the backend
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantsLoaded, setRestaurantsLoaded] = useState(false);
  const [meals, setMeals] = useState([]); // meals for current restaurant view
  const [coupons, setCoupons] = useState([]); // coupons for current restaurant
  const [users, setUsers] = useState([]); // customers (owner view)
  const [orders, setOrders] = useState([]); // orders list

  // ── TOAST (NOTIFICATION) STATE ───────────────────────────────
  const [toasts, setToasts] = useState([]);

  // ── LOAD RESTAURANTS WHEN USER LOGS IN ───────────────────────
  // useEffect runs after render. Here: fetch restaurants when session changes.
  useEffect(() => {
    if (session) {
      loadRestaurants();
    } else {
      // Clear data when logged out
      setRestaurants([]);
      setRestaurantsLoaded(false);
      setMeals([]);
      setOrders([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // ── TOAST HELPER ─────────────────────────────────────────────
  // Show a small popup notification for 4 seconds
  // kind: 'success' | 'error' | 'info'
  const showToast = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // ════════════════════════════════════════════════════════════
  // AUTH ACTIONS — Sign In, Sign Up, Sign Out
  // ════════════════════════════════════════════════════════════

  // Sign In → calls POST /api/auth/login
  // Returns the user object so the page knows where to redirect
  const signIn = useCallback(async (email, password) => {
    // apiCall throws an error if login fails (wrong password etc.)
    const data = await apiCall('POST', '/auth/login', { email, password });

    // Save token and user info to localStorage for persistence
    localStorage.setItem('fd_token', data.token);
    localStorage.setItem('fd_user', JSON.stringify(data.user));
    setSession(data.user);

    return data.user; // caller uses this to decide where to redirect
  }, []);

  // Sign Up → calls POST /api/auth/register
  const signUp = useCallback(async (email, password, role) => {
    const data = await apiCall('POST', '/auth/register', { email, password, role });
    localStorage.setItem('fd_token', data.token);
    localStorage.setItem('fd_user', JSON.stringify(data.user));
    setSession(data.user);
    return data.user;
  }, []);

  // Sign Out → clear everything from memory and localStorage
  const signOut = useCallback(() => {
    localStorage.removeItem('fd_token');
    localStorage.removeItem('fd_user');
    setSession(null);
  }, []);

  // ════════════════════════════════════════════════════════════
  // RESTAURANT ACTIONS
  // Backend routes: /api/restaurants/...
  // ════════════════════════════════════════════════════════════

  // Load all restaurants (used on Browse Restaurants page)
  const loadRestaurants = useCallback(async () => {
    try {
      setRestaurantsLoaded(false);
      const data = await apiCall('GET', '/restaurants');
      setRestaurants(data.restaurants);
    } catch (err) {
      console.error('Failed to load restaurants:', err.message);
    } finally {
      setRestaurantsLoaded(true);
    }
  }, []);

  // Get a single restaurant object by ID from local state
  // (We already loaded all restaurants, so no extra API call needed)
  const getRestaurant = useCallback(
    (id) => restaurants.find((r) => String(r.id) === String(id)),
    [restaurants]
  );

  // Owner creates their restaurant → POST /api/restaurants
  const createRestaurant = useCallback(async (formData) => {
    const data = await apiCall('POST', '/restaurants', formData);
    // Add the new restaurant to our local list so UI updates immediately
    setRestaurants((prev) => [data.restaurant, ...prev]);
    return data.restaurant;
  }, []);

  // Owner updates their restaurant → PUT /api/restaurants/:id
  const updateRestaurant = useCallback(async (id, changes) => {
    const data = await apiCall('PUT', `/restaurants/${id}`, changes);
    setRestaurants((prev) => prev.map((r) => (String(r.id) === String(id) ? data.restaurant : r)));
  }, []);

  // Owner deletes their restaurant → DELETE /api/restaurants/:id
  const deleteRestaurant = useCallback(async (id) => {
    await apiCall('DELETE', `/restaurants/${id}`);
    setRestaurants((prev) => prev.filter((r) => String(r.id) !== String(id)));
    // Also clear meals/coupons that belong to this restaurant from local state
    setMeals((prev) => prev.filter((m) => String(m.restaurant_id) !== String(id)));
    setCoupons((prev) => prev.filter((c) => String(c.restaurant_id) !== String(id)));
  }, []);

  // ════════════════════════════════════════════════════════════
  // MEAL ACTIONS
  // Backend routes: /api/restaurants/:restaurantId/meals/...
  // ════════════════════════════════════════════════════════════

  // Load all meals for a specific restaurant
  // Called when customer opens a restaurant's menu page
  const loadMeals = useCallback(async (restaurantId) => {
    const data = await apiCall('GET', `/restaurants/${restaurantId}/meals`);
    setMeals(data.meals);
    return data.meals;
  }, []);

  // Get meals from local state (after loadMeals has been called)
  const getMeal = useCallback((id) => meals.find((m) => String(m.id) === String(id)), [meals]);

  // Get all meals for a restaurant from local state
  const mealsForRestaurant = useCallback(
    (rid) => meals.filter((m) => String(m.restaurant_id) === String(rid)),
    [meals]
  );

  // Owner creates a meal → POST /api/restaurants/:restaurantId/meals
  const createMeal = useCallback(async (restaurantId, formData) => {
    const data = await apiCall('POST', `/restaurants/${restaurantId}/meals`, formData);
    setMeals((prev) => [...prev, data.meal]);
    return data.meal;
  }, []);

  // Owner updates a meal → PUT /api/restaurants/:restaurantId/meals/:mealId
  const updateMeal = useCallback(async (restaurantId, mealId, changes) => {
    const data = await apiCall('PUT', `/restaurants/${restaurantId}/meals/${mealId}`, changes);
    setMeals((prev) => prev.map((m) => (String(m.id) === String(mealId) ? data.meal : m)));
  }, []);

  // Owner deletes a meal → DELETE /api/restaurants/:restaurantId/meals/:mealId
  const deleteMeal = useCallback(async (restaurantId, mealId) => {
    await apiCall('DELETE', `/restaurants/${restaurantId}/meals/${mealId}`);
    setMeals((prev) => prev.filter((m) => String(m.id) !== String(mealId)));
  }, []);

  // ════════════════════════════════════════════════════════════
  // COUPON ACTIONS
  // Backend routes: /api/restaurants/:restaurantId/coupons/...
  // ════════════════════════════════════════════════════════════

  // Load all coupons for a restaurant (owner view)
  const loadCoupons = useCallback(async (restaurantId) => {
    const data = await apiCall('GET', `/restaurants/${restaurantId}/coupons`);
    setCoupons(data.coupons);
    return data.coupons;
  }, []);

  // Get coupons from local state
  const couponsForRestaurant = useCallback(
    (rid) => coupons.filter((c) => String(c.restaurant_id) === String(rid)),
    [coupons]
  );

  // Validate a coupon code at checkout
  // → POST /api/restaurants/:restaurantId/coupons/validate
  const validateCoupon = useCallback(async (restaurantId, code) => {
    // Returns the coupon object if valid, throws if not
    const data = await apiCall('POST', `/restaurants/${restaurantId}/coupons/validate`, { code });
    return data.coupon; // { id, code, discount_percentage }
  }, []);

  // Owner creates a coupon
  const createCoupon = useCallback(async (restaurantId, formData) => {
    const data = await apiCall('POST', `/restaurants/${restaurantId}/coupons`, formData);
    setCoupons((prev) => [...prev, data.coupon]);
    return data.coupon;
  }, []);

  // Owner updates a coupon
  const updateCoupon = useCallback(async (restaurantId, couponId, changes) => {
    const data = await apiCall('PUT', `/restaurants/${restaurantId}/coupons/${couponId}`, changes);
    setCoupons((prev) => prev.map((c) => (String(c.id) === String(couponId) ? data.coupon : c)));
  }, []);

  // Owner deletes a coupon
  const deleteCoupon = useCallback(async (restaurantId, couponId) => {
    await apiCall('DELETE', `/restaurants/${restaurantId}/coupons/${couponId}`);
    setCoupons((prev) => prev.filter((c) => String(c.id) !== String(couponId)));
  }, []);

  // ════════════════════════════════════════════════════════════
  // ORDER ACTIONS
  // Backend routes: /api/orders/...
  // ════════════════════════════════════════════════════════════

  // Customer: load their order history → GET /api/orders/my
  const loadMyOrders = useCallback(async () => {
    const data = await apiCall('GET', '/orders/my');
    setOrders(data.orders);
    return data.orders;
  }, []);

  // Owner: load orders for their restaurant
  // → GET /api/orders/restaurant/:restaurantId
  const loadRestaurantOrders = useCallback(async (restaurantId) => {
    const data = await apiCall('GET', `/orders/restaurant/${restaurantId}`);
    return data.orders;
  }, []);

  // Get a single order with full detail (items + status history)
  // → GET /api/orders/:orderId
  const loadOrderById = useCallback(async (orderId) => {
    const data = await apiCall('GET', `/orders/${orderId}`);
    return data.order; // includes .items and .status_history arrays
  }, []);

  // Update order status (used by both customer and owner)
  // → PATCH /api/orders/:orderId/status
  const advanceOrderStatus = useCallback(async (orderId, newStatus) => {
    await apiCall('PATCH', `/orders/${orderId}/status`, { status: newStatus });
    // Update the order in local state if it's in our orders list
    setOrders((prev) =>
      prev.map((o) => (String(o.id) === String(orderId) ? { ...o, status: newStatus } : o))
    );
  }, []);

  // Convenience wrappers
  const cancelOrder = useCallback((id) => advanceOrderStatus(id, 'Canceled'), [advanceOrderStatus]);
  const markReceived = useCallback(
    (id) => advanceOrderStatus(id, 'Received'),
    [advanceOrderStatus]
  );

  // Customer reorders a past order → POST /api/orders/:orderId/reorder
  const reorder = useCallback(async (orderId) => {
    const data = await apiCall('POST', `/orders/${orderId}/reorder`);
    return data.order.id; // return new order ID
  }, []);

  // ════════════════════════════════════════════════════════════
  // USER MANAGEMENT (Owner only)
  // Backend routes: /api/users/...
  // ════════════════════════════════════════════════════════════

  // Owner loads all customers → GET /api/users
  const loadUsers = useCallback(async () => {
    const data = await apiCall('GET', '/users');
    setUsers(data.users);
    return data.users;
  }, []);

  // Owner blocks a customer → POST /api/users/:userId/block
  const blockUser = useCallback(async (userId, restaurantId) => {
    await apiCall('POST', `/users/${userId}/block`, { restaurant_id: parseInt(restaurantId) });
    // Update local state so button changes to "Unblock" immediately
    setUsers((prev) =>
      prev.map((u) => (String(u.id) === String(userId) ? { ...u, is_blocked: true } : u))
    );
  }, []);

  // Owner unblocks a customer → DELETE /api/users/:userId/block
  const unblockUser = useCallback(async (userId, restaurantId) => {
    await apiCall('DELETE', `/users/${userId}/block`, { restaurant_id: parseInt(restaurantId) });
    setUsers((prev) =>
      prev.map((u) => (String(u.id) === String(userId) ? { ...u, is_blocked: false } : u))
    );
  }, []);

  // ── OWNER'S RESTAURANT ───────────────────────────────────────
  // Since each owner has ONE restaurant, we find it by their user ID.
  // This is used on owner pages to know which restaurant they manage.
  const ownerRestaurant = useMemo(
    () =>
      session?.role === 'owner'
        ? restaurants.find((r) => String(r.owner_id) === String(session.id))
        : null,
    [restaurants, session]
  );

  // ── EVERYTHING EXPORTED TO THE APP ──────────────────────────
  // Any component can access these by calling useStore()
  const value = {
    // ── Auth ──────────────────────────────────────────────────
    session,
    signIn,
    signUp,
    signOut,

    // ── Restaurants ───────────────────────────────────────────
    restaurants,
    restaurantsLoaded,
    loadRestaurants,
    getRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    ownerRestaurant,

    // ── Meals ─────────────────────────────────────────────────
    meals,
    loadMeals,
    getMeal,
    mealsForRestaurant,
    createMeal,
    updateMeal,
    deleteMeal,

    // ── Coupons ───────────────────────────────────────────────
    coupons,
    loadCoupons,
    couponsForRestaurant,
    validateCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,

    // ── Orders ────────────────────────────────────────────────
    orders,
    loadMyOrders,
    loadRestaurantOrders,
    loadOrderById,
    advanceOrderStatus,
    cancelOrder,
    markReceived,
    reorder,

    // ── Users (owner) ─────────────────────────────────────────
    users,
    loadUsers,
    blockUser,
    unblockUser,

    // ── Toasts ────────────────────────────────────────────────
    toasts,
    showToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// Custom hook — the easy way to use the store in any component
// Usage example:
//   const { session, restaurants, loadRestaurants } = useStore();
export function useStore() {
  return useContext(StoreContext);
}
