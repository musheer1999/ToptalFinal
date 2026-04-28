import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useStore } from './StoreContext';

const EMPTY_CART = { restaurantId: null, restaurantName: '', items: [] };
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { session } = useStore();
  const [cart, setCart] = useState(EMPTY_CART);

  const cartCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.qty, 0),
    [cart.items]
  );

  const cartSubtotal = useMemo(
    () => cart.items.reduce((sum, item) => sum + parseFloat(item.price) * item.qty, 0),
    [cart.items]
  );

  const clearCart = useCallback(() => {
    setCart(EMPTY_CART);
  }, []);

  const addMealToCart = useCallback((meal, restaurantName = '') => {
    const mealId = String(meal.id);
    const restaurantId = String(meal.restaurant_id);

    setCart((prev) => {
      const activeRestaurantName = restaurantName || prev.restaurantName || '';
      if (prev.restaurantId && prev.restaurantId !== restaurantId) {
        return {
          restaurantId,
          restaurantName: activeRestaurantName,
          items: [{ mealId, mealName: meal.name, price: parseFloat(meal.price), qty: 1 }],
        };
      }

      const existing = prev.items.find((item) => item.mealId === mealId);
      if (existing) {
        return {
          ...prev,
          restaurantId,
          restaurantName: activeRestaurantName,
          items: prev.items.map((item) =>
            item.mealId === mealId ? { ...item, qty: item.qty + 1 } : item
          ),
        };
      }

      return {
        ...prev,
        restaurantId,
        restaurantName: activeRestaurantName,
        items: [
          ...prev.items,
          { mealId, mealName: meal.name, price: parseFloat(meal.price), qty: 1 },
        ],
      };
    });
  }, []);

  const updateCartQty = useCallback((mealId, qty) => {
    setCart((prev) => {
      if (qty <= 0) {
        const items = prev.items.filter((item) => item.mealId !== String(mealId));
        if (items.length === 0) return EMPTY_CART;
        return { ...prev, items };
      }

      return {
        ...prev,
        items: prev.items.map((item) => (item.mealId === String(mealId) ? { ...item, qty } : item)),
      };
    });
  }, []);

  const removeFromCart = useCallback(
    (mealId) => {
      updateCartQty(mealId, 0);
    },
    [updateCartQty]
  );

  useEffect(() => {
    if (!session) clearCart();
  }, [clearCart, session]);

  const value = {
    cart,
    cartCount,
    cartSubtotal,

    clearCart,
    updateCartQty,
    removeFromCart,
    addMealToCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
}
