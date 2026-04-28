import { useCallback, useMemo, useState } from 'react';
import { useStore } from '../../../context/StoreContext';

const STATUS_NEXT = { Placed: 'Processing', Processing: 'In Route', 'In Route': 'Delivered' };

function useOwnerOrders() {
  const { ownerRestaurant, showToast } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRest, setEditingRest] = useState(false);

  const stats = useMemo(
    () => [
      { label: 'Total', value: orders.length, color: '#1A202C' },
      {
        label: 'New',
        value: orders.filter((order) => order.status === 'Placed').length,
        color: '#2563EB',
      },
      {
        label: 'Kitchen',
        value: orders.filter((order) => order.status === 'Processing').length,
        color: '#FF6B35',
      },
      {
        label: 'On way',
        value: orders.filter((order) => order.status === 'In Route').length,
        color: '#9333EA',
      },
      {
        label: 'Delivered',
        value: orders.filter((order) => order.status === 'Delivered').length,
        color: '#0891B2',
      },
    ],
    [orders]
  );

  const onLoadOrdersSuccess = useCallback((loadedOrders) => {
    setOrders(loadedOrders);
  }, []);

  const onOrderStatusChange = useCallback((orderId, status) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
  }, []);

  const notifySuccess = useCallback(
    (title) => {
      showToast({ kind: 'success', title });
    },
    [showToast]
  );

  const notifyError = useCallback(
    (title) => {
      showToast({ kind: 'error', title });
    },
    [showToast]
  );

  return {
    stats,
    orders,
    loading,
    editingRest,
    ownerRestaurant,

    setLoading,
    setEditingRest,
    notifyError,
    notifySuccess,
    onLoadOrdersSuccess,
    onOrderStatusChange,
    getNextStatus: (status) => STATUS_NEXT[status],
  };
}

export default useOwnerOrders;
