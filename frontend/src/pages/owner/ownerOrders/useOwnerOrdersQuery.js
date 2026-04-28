import { useCallback } from 'react';
import apiCall from '../../../utils/apiCall';

function useOwnerOrdersQuery() {
  const loadRestaurantOrders = useCallback(async (restaurantId) => {
    const data = await apiCall('GET', `/orders/restaurant/${restaurantId}`);
    return data.orders || [];
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    await apiCall('PATCH', `/orders/${orderId}/status`, { status });
  }, []);

  return {
    loadRestaurantOrders,
    updateOrderStatus,
  };
}

export default useOwnerOrdersQuery;
