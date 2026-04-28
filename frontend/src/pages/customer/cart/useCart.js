import { useCallback, useMemo, useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useCartContext } from '../../../context/CartContext';

function useCart() {
  const { showToast } = useStore();
  const { cart, updateCartQty, removeFromCart, clearCart, cartSubtotal } = useCartContext();
  const [restaurant, setRestaurant] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [tip, setTip] = useState(0);
  const [placing, setPlacing] = useState(false);

  const mealsById = useMemo(
    () =>
      new Map(
        (cart.items || []).map((item) => [
          String(item.mealId),
          { name: item.mealName, price: item.price },
        ])
      ),
    [cart.items]
  );

  const discount = appliedCoupon ? cartSubtotal * (appliedCoupon.discount_percentage / 100) : 0;
  const total = cartSubtotal - discount + Number(tip);

  const onAfterLoadCartContext = useCallback(({ restaurant: loadedRestaurant }) => {
    setRestaurant(loadedRestaurant);
  }, []);

  const onAfterCouponValidation = useCallback(
    (coupon) => {
      setAppliedCoupon(coupon);
      setCouponError('');
      showToast({
        kind: 'success',
        title: 'Coupon applied!',
        body: `${coupon.discount_percentage}% off.`,
      });
    },
    [showToast]
  );

  const onCouponError = useCallback((message) => {
    setCouponError(message);
    setAppliedCoupon(null);
  }, []);

  const onOrderPlaced = useCallback(
    (orderId) => {
      clearCart();
      showToast({ kind: 'success', title: 'Order placed!' });
      return orderId;
    },
    [clearCart, showToast]
  );

  return {
    tip,
    cart,
    total,
    mealsById,
    placing,
    discount,
    restaurant,
    couponCode,
    couponError,
    appliedCoupon,
    cartSubtotal,

    setTip,
    setPlacing,
    onOrderPlaced,
    onCouponError,
    setCouponCode,
    removeFromCart,
    updateCartQty,
    setCouponError,
    setAppliedCoupon,
    onAfterLoadCartContext,
    onAfterCouponValidation,
  };
}

export default useCart;
