import { useCallback, useState } from 'react';
import { useStore } from '../../../context/StoreContext';

function useCustomerOrders() {
  const { showToast } = useStore();
  const [orders, setOrders] = useState([]);
  const [restaurantsById, setRestaurantsById] = useState({});
  const [loading, setLoading] = useState(true);

  const onAfterLoadOrders = useCallback((loadedOrders) => {
    setOrders(loadedOrders);
  }, []);

  const onAfterLoadRestaurants = useCallback((restaurants) => {
    const byId = {};
    (restaurants || []).forEach((restaurant) => {
      byId[String(restaurant.id)] = restaurant;
    });
    setRestaurantsById(byId);
  }, []);

  const notifySuccess = useCallback(
    (title, body) => {
      showToast({ kind: 'success', title, body });
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
    orders,
    loading,
    restaurantsById,

    setLoading,
    notifyError,
    notifySuccess,
    onAfterLoadOrders,
    onAfterLoadRestaurants,
  };
}

export default useCustomerOrders;
