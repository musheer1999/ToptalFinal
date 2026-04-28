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
// credentials: 'include' tells the browser to send the httpOnly cookie
// automatically — we never touch the token in JavaScript code.
//
// Usage:
//   const data = await apiCall('GET', '/restaurants');
//   const data = await apiCall('POST', '/auth/login', { email, password });
async function apiCall(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const options = { method, headers, credentials: 'include' };
  if (body) options.body = JSON.stringify(body);

  // Make the request — catch network-level failures (backend not running)
  const response = await fetch(`${API_URL}${endpoint}`, options).catch(() => {
    throw new Error('Cannot connect to the server. Make sure the backend is running.');
  });
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

  // ── BACKEND STATUS ───────────────────────────────────────────
  const [backendOffline, setBackendOffline] = useState(false);

  // ── DATA STATE ───────────────────────────────────────────────
  // These hold data fetched from the backend
  const [restaurants, setRestaurants] = useState([]);
  const [meals, setMeals]             = useState([]);   // meals for current restaurant view
  const [coupons, setCoupons]         = useState([]);   // coupons for current restaurant
  const [users, setUsers]             = useState([]);   // customers (owner view)
  const [orders, setOrders]           = useState([]);   // orders list

  // ── CART STATE ───────────────────────────────────────────────
  // Cart is stored in React state (not the backend)
  // Format: { restaurantId: '5', items: [{ mealId: '3', qty: 2 }] }
  const [cart, setCart] = useState({ restaurantId: null, items: [] });

  // ── TOAST (NOTIFICATION) STATE ───────────────────────────────
  const [toasts, setToasts] = useState([]);

  // ── BACKEND HEALTH CHECK ─────────────────────────────────────
  // Polls /api/health every 30s. No auth required on that endpoint.
  // Polling means the banner auto-clears once the backend comes up,
  // even if the frontend was already open when the backend was down.
  useEffect(() => {
    const check = () => {
      fetch(`${API_URL}/health`)
        .then(() => setBackendOffline(false))
        .catch(() => setBackendOffline(true));
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── LOAD RESTAURANTS WHEN USER LOGS IN ───────────────────────
  // useEffect runs after render. Here: fetch restaurants when session changes.
  useEffect(() => {
    if (session) {
      loadRestaurants();
    } else {
      // Clear data when logged out
      setRestaurants([]);
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
    setToasts(prev => [...prev, { id, ...toast }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ════════════════════════════════════════════════════════════
  // AUTH ACTIONS — Sign In, Sign Up, Sign Out
  // ════════════════════════════════════════════════════════════

  // Sign In → calls POST /api/auth/login
  // The backend sets an httpOnly cookie — we only store non-sensitive user info
  const signIn = useCallback(async (email, password) => {
    const data = await apiCall('POST', '/auth/login', { email, password });
    localStorage.setItem('fd_user', JSON.stringify(data.user));
    setSession(data.user);
    return data.user; // caller uses this to decide where to redirect
  }, []);

  // Sign Up → calls POST /api/auth/register
  const signUp = useCallback(async (email, password, role) => {
    const data = await apiCall('POST', '/auth/register', { email, password, role });
    localStorage.setItem('fd_user', JSON.stringify(data.user));
    setSession(data.user);
    return data.user;
  }, []);

  // Sign Out → tell backend to clear the httpOnly cookie, then clear local state
  const signOut = useCallback(async () => {
    await apiCall('POST', '/auth/logout').catch(() => {});
    localStorage.removeItem('fd_user');
    setSession(null);
    setCart({ restaurantId: null, items: [] });
  }, []);

  // ════════════════════════════════════════════════════════════
  // RESTAURANT ACTIONS
  // Backend routes: /api/restaurants/...
  // ════════════════════════════════════════════════════════════

  // Load all restaurants (used on Browse Restaurants page)
  const loadRestaurants = useCallback(async () => {
    try {
      const data = await apiCall('GET', '/restaurants');
      setRestaurants(data.restaurants);
    } catch (err) {
      console.error('Failed to load restaurants:', err.message);
    }
  }, []);

  // Get a single restaurant object by ID from local state
  // (We already loaded all restaurants, so no extra API call needed)
  const getRestaurant = useCallback((id) =>
    restaurants.find(r => String(r.id) === String(id)),
  [restaurants]);

  // Owner creates their restaurant → POST /api/restaurants
  const createRestaurant = useCallback(async (formData) => {
    const data = await apiCall('POST', '/restaurants', formData);
    // Add the new restaurant to our local list so UI updates immediately
    setRestaurants(prev => [data.restaurant, ...prev]);
    return data.restaurant;
  }, []);

  // Owner updates their restaurant → PUT /api/restaurants/:id
  const updateRestaurant = useCallback(async (id, changes) => {
    const data = await apiCall('PUT', `/restaurants/${id}`, changes);
    setRestaurants(prev => prev.map(r => String(r.id) === String(id) ? data.restaurant : r));
  }, []);

  // Owner deletes their restaurant → DELETE /api/restaurants/:id
  const deleteRestaurant = useCallback(async (id) => {
    await apiCall('DELETE', `/restaurants/${id}`);
    setRestaurants(prev => prev.filter(r => String(r.id) !== String(id)));
    // Also clear meals/coupons that belong to this restaurant from local state
    setMeals(prev => prev.filter(m => String(m.restaurant_id) !== String(id)));
    setCoupons(prev => prev.filter(c => String(c.restaurant_id) !== String(id)));
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
  const getMeal = useCallback((id) =>
    meals.find(m => String(m.id) === String(id)),
  [meals]);

  // Get all meals for a restaurant from local state
  const mealsForRestaurant = useCallback((rid) =>
    meals.filter(m => String(m.restaurant_id) === String(rid)),
  [meals]);

  // Owner creates a meal → POST /api/restaurants/:restaurantId/meals
  const createMeal = useCallback(async (restaurantId, formData) => {
    const data = await apiCall('POST', `/restaurants/${restaurantId}/meals`, formData);
    setMeals(prev => [...prev, data.meal]);
    return data.meal;
  }, []);

  // Owner updates a meal → PUT /api/restaurants/:restaurantId/meals/:mealId
  const updateMeal = useCallback(async (restaurantId, mealId, changes) => {
    const data = await apiCall('PUT', `/restaurants/${restaurantId}/meals/${mealId}`, changes);
    setMeals(prev => prev.map(m => String(m.id) === String(mealId) ? data.meal : m));
  }, []);

  // Owner deletes a meal → DELETE /api/restaurants/:restaurantId/meals/:mealId
  const deleteMeal = useCallback(async (restaurantId, mealId) => {
    await apiCall('DELETE', `/restaurants/${restaurantId}/meals/${mealId}`);
    setMeals(prev => prev.filter(m => String(m.id) !== String(mealId)));
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
  const couponsForRestaurant = useCallback((rid) =>
    coupons.filter(c => String(c.restaurant_id) === String(rid)),
  [coupons]);

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
    setCoupons(prev => [...prev, data.coupon]);
    return data.coupon;
  }, []);

  // Owner updates a coupon
  const updateCoupon = useCallback(async (restaurantId, couponId, changes) => {
    const data = await apiCall('PUT', `/restaurants/${restaurantId}/coupons/${couponId}`, changes);
    setCoupons(prev => prev.map(c => String(c.id) === String(couponId) ? data.coupon : c));
  }, []);

  // Owner deletes a coupon
  const deleteCoupon = useCallback(async (restaurantId, couponId) => {
    await apiCall('DELETE', `/restaurants/${restaurantId}/coupons/${couponId}`);
    setCoupons(prev => prev.filter(c => String(c.id) !== String(couponId)));
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

  // Customer places an order → POST /api/orders
  const placeOrder = useCallback(async ({ couponCode, tip }) => {
    if (!cart.restaurantId || cart.items.length === 0) return null;

    const body = {
      restaurant_id: parseInt(cart.restaurantId),
      // Map cart items to the format the backend expects
      items: cart.items.map(i => ({
        meal_id: parseInt(i.mealId),
        quantity: i.qty,
      })),
      coupon_code: couponCode || null,
      tip: parseFloat(tip) || 0,
    };

    const data = await apiCall('POST', '/orders', body);
    // Clear the cart after successful order placement
    setCart({ restaurantId: null, items: [] });
    return data.order.id; // return the new order ID for redirect
  }, [cart]);

  // Update order status (used by both customer and owner)
  // → PATCH /api/orders/:orderId/status
  const advanceOrderStatus = useCallback(async (orderId, newStatus) => {
    await apiCall('PATCH', `/orders/${orderId}/status`, { status: newStatus });
    // Update the order in local state if it's in our orders list
    setOrders(prev => prev.map(o =>
      String(o.id) === String(orderId) ? { ...o, status: newStatus } : o
    ));
  }, []);

  // Convenience wrappers
  const cancelOrder  = useCallback((id) => advanceOrderStatus(id, 'Canceled'),  [advanceOrderStatus]);
  const markReceived = useCallback((id) => advanceOrderStatus(id, 'Received'),  [advanceOrderStatus]);

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
    setUsers(prev => prev.map(u =>
      String(u.id) === String(userId) ? { ...u, is_blocked: true } : u
    ));
  }, []);

  // Owner unblocks a customer → DELETE /api/users/:userId/block
  const unblockUser = useCallback(async (userId, restaurantId) => {
    await apiCall('DELETE', `/users/${userId}/block`, { restaurant_id: parseInt(restaurantId) });
    setUsers(prev => prev.map(u =>
      String(u.id) === String(userId) ? { ...u, is_blocked: false } : u
    ));
  }, []);

  // ════════════════════════════════════════════════════════════
  // CART ACTIONS (local only — cart is NOT saved to backend)
  // ════════════════════════════════════════════════════════════

  // Total number of items in cart (shows on cart button badge)
  const cartCount = useMemo(() =>
    cart.items.reduce((sum, i) => sum + i.qty, 0),
  [cart]);

  // Total price of all items in cart (before discount and tip)
  const cartSubtotal = useMemo(() =>
    cart.items.reduce((sum, i) => {
      const meal = meals.find(m => String(m.id) === String(i.mealId));
      return sum + (meal ? parseFloat(meal.price) * i.qty : 0);
    }, 0),
  [cart, meals]);

  // Add a meal to the cart
  const addToCart = useCallback((mealId, qty) => {
    // Find the meal to get its restaurant ID
    const meal = meals.find(m => String(m.id) === String(mealId));
    if (!meal) return;

    const rid = String(meal.restaurant_id);

    setCart(prev => {
      // If cart already has items from a DIFFERENT restaurant,
      // clear the cart and start fresh with this new restaurant
      if (prev.restaurantId && prev.restaurantId !== rid) {
        return { restaurantId: rid, items: [{ mealId: String(mealId), qty }] };
      }
      // If this meal is already in cart, just increase quantity
      const existing = prev.items.find(i => i.mealId === String(mealId));
      if (existing) {
        return {
          restaurantId: rid,
          items: prev.items.map(i =>
            i.mealId === String(mealId) ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }
      // New meal — add to cart
      return {
        restaurantId: rid,
        items: [...prev.items, { mealId: String(mealId), qty }],
      };
    });
  }, [meals]);

  // Change quantity of an item in cart (qty=0 removes it)
  const updateCartQty = useCallback((mealId, qty) => {
    setCart(prev => {
      if (qty <= 0) {
        const next = prev.items.filter(i => i.mealId !== String(mealId));
        return { restaurantId: next.length ? prev.restaurantId : null, items: next };
      }
      return {
        ...prev,
        items: prev.items.map(i => i.mealId === String(mealId) ? { ...i, qty } : i),
      };
    });
  }, []);

  const removeFromCart = useCallback((mealId) => updateCartQty(mealId, 0), [updateCartQty]);
  const clearCart      = useCallback(() => setCart({ restaurantId: null, items: [] }), []);

  // ── OWNER'S RESTAURANT ───────────────────────────────────────
  // Since each owner has ONE restaurant, we find it by their user ID.
  // This is used on owner pages to know which restaurant they manage.
  const ownerRestaurant = useMemo(() =>
    session?.role === 'owner'
      ? restaurants.find(r => String(r.owner_id) === String(session.id))
      : null,
  [restaurants, session]);

  // ── EVERYTHING EXPORTED TO THE APP ──────────────────────────
  // Any component can access these by calling useStore()
  const value = {
    // ── Backend status ────────────────────────────────────────
    backendOffline,

    // ── Auth ──────────────────────────────────────────────────
    session, signIn, signUp, signOut,

    // ── Restaurants ───────────────────────────────────────────
    restaurants, loadRestaurants, getRestaurant,
    createRestaurant, updateRestaurant, deleteRestaurant,
    ownerRestaurant,

    // ── Meals ─────────────────────────────────────────────────
    meals, loadMeals, getMeal, mealsForRestaurant,
    createMeal, updateMeal, deleteMeal,

    // ── Coupons ───────────────────────────────────────────────
    coupons, loadCoupons, couponsForRestaurant,
    validateCoupon, createCoupon, updateCoupon, deleteCoupon,

    // ── Orders ────────────────────────────────────────────────
    orders, loadMyOrders, loadRestaurantOrders, loadOrderById,
    placeOrder, advanceOrderStatus, cancelOrder, markReceived, reorder,

    // ── Users (owner) ─────────────────────────────────────────
    users, loadUsers, blockUser, unblockUser,

    // ── Cart ──────────────────────────────────────────────────
    cart, cartCount, cartSubtotal,
    addToCart, updateCartQty, removeFromCart, clearCart,

    // ── Toasts ────────────────────────────────────────────────
    toasts, showToast,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

// Custom hook — the easy way to use the store in any component
// Usage example:
//   const { session, restaurants, loadRestaurants } = useStore();
export function useStore() {
  return useContext(StoreContext);
}
