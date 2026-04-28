import { useCallback } from 'react';
import apiCall from '../../../utils/apiCall';

function useCartQuery({ onAfterLoadCartContext, onAfterCouponValidation }) {
  const loadCartContext = useCallback(
    async (restaurantId) => {
      if (!restaurantId) {
        onAfterLoadCartContext({ restaurant: null });
        return;
      }

      const restaurantsData = await apiCall('GET', '/restaurants');

      const restaurant =
        (restaurantsData.restaurants || []).find(
          (item) => String(item.id) === String(restaurantId)
        ) || null;

      onAfterLoadCartContext({ restaurant });
    },
    [onAfterLoadCartContext]
  );

  const validateCoupon = useCallback(
    async (restaurantId, code) => {
      const data = await apiCall('POST', `/restaurants/${restaurantId}/coupons/validate`, { code });
      onAfterCouponValidation(data.coupon);
      return data.coupon;
    },
    [onAfterCouponValidation]
  );

  const placeOrder = useCallback(async ({ cart, couponCode, tip }) => {
    if (!cart.restaurantId || !cart.items?.length) return null;

    const body = {
      restaurant_id: parseInt(cart.restaurantId, 10),
      items: cart.items.map((item) => ({
        meal_id: parseInt(item.mealId, 10),
        quantity: item.qty,
      })),
      coupon_code: couponCode || null,
      tip: parseFloat(tip) || 0,
    };

    const data = await apiCall('POST', '/orders', body);
    return data.order?.id || null;
  }, []);

  return {
    placeOrder,
    validateCoupon,
    loadCartContext,
  };
}

export default useCartQuery;
