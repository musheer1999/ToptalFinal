import { useCallback, useMemo, useState } from 'react';
import { useStore } from '../../../context/StoreContext';

function useOrderDetail() {
  const { showToast } = useStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const onAfterLoadOrder = useCallback((loadedOrder) => {
    setOrder(loadedOrder);
  }, []);

  const prices = useMemo(() => {
    const subtotal = parseFloat(order?.subtotal) || 0;
    const discount = parseFloat(order?.discount) || 0;
    const tip = parseFloat(order?.tip) || 0;
    const total = parseFloat(order?.total) || 0;
    return { subtotal, discount, tip, total };
  }, [order]);

  const setOrderStatus = useCallback((status) => {
    setOrder((prev) => (prev ? { ...prev, status } : prev));
  }, []);

  const notifySuccess = useCallback((title) => {
    showToast({ kind: 'success', title });
  }, [showToast]);

  const notifyError = useCallback((title) => {
    showToast({ kind: 'error', title });
  }, [showToast]);

  return {
    order,
    prices,
    loading,

    setOrder,
    setLoading,
    notifyError,
    notifySuccess,
    setOrderStatus,
    onAfterLoadOrder,
  };
}

export default useOrderDetail;
