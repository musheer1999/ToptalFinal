import { useCallback } from 'react';
import apiCall from '../../../utils/apiCall';

function useOrderDetailQuery({ onAfterLoadOrder }) {
  const loadOrderById = useCallback(async (orderId) => {
    const data = await apiCall('GET', `/orders/${orderId}`);
    onAfterLoadOrder(data.order || null);
  }, [onAfterLoadOrder]);

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
    markReceived,
    loadOrderById,
  };
}

export default useOrderDetailQuery;
