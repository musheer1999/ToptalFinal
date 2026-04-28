import { useCallback } from 'react';
import apiCall from '../../../utils/apiCall';

function useCustomerOrdersQuery({ onAfterLoadOrders }) {
  const loadRestaurants = useCallback(async (onAfterLoadRestaurants) => {
    const data = await apiCall('GET', '/restaurants');
    onAfterLoadRestaurants(data.restaurants || []);
  }, []);

  const loadMyOrders = useCallback(async () => {
    const data = await apiCall('GET', '/orders/my');
    onAfterLoadOrders(data.orders || []);
    return data.orders || [];
  }, [onAfterLoadOrders]);

  const cancelOrder = useCallback(async (orderId) => {
    await apiCall('PATCH', `/orders/${orderId}/status`, { status: 'Canceled' });
  }, []);

  const markReceived = useCallback(async (orderId) => {
    await apiCall('PATCH', `/orders/${orderId}/status`, { status: 'Received' });
  }, []);

  const reorder = useCallback(async (orderId) => {
    const data = await apiCall('POST', `/orders/${orderId}/reorder`);
    return data.order?.id;
  }, []);

  return {
    reorder,
    cancelOrder,
    loadMyOrders,
    markReceived,
    loadRestaurants,
  };
}

export default useCustomerOrdersQuery;
