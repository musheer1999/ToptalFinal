import { useCallback } from 'react';
import apiCall from '../../../utils/apiCall';

function useManageCouponsQuery() {
  const loadCoupons = useCallback(async (restaurantId) => {
    const data = await apiCall('GET', `/restaurants/${restaurantId}/coupons`);
    return data.coupons || [];
  }, []);

  const createCoupon = useCallback(async (restaurantId, payload) => {
    await apiCall('POST', `/restaurants/${restaurantId}/coupons`, payload);
  }, []);

  const updateCoupon = useCallback(async (restaurantId, couponId, payload) => {
    await apiCall('PUT', `/restaurants/${restaurantId}/coupons/${couponId}`, payload);
  }, []);

  const deleteCoupon = useCallback(async (restaurantId, couponId) => {
    await apiCall('DELETE', `/restaurants/${restaurantId}/coupons/${couponId}`);
  }, []);

  return {
    loadCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
  };
}

export default useManageCouponsQuery;
