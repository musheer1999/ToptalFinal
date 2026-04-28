import { useCallback, useState } from 'react';
import { useStore } from '../../../context/StoreContext';

function useManageCoupons() {
  const { ownerRestaurant, showToast } = useStore();
  const [code, setCode] = useState('');
  const [pct, setPct] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [editingRest, setEditingRest] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const onCouponsLoaded = useCallback((loadedCoupons) => {
    setCoupons(loadedCoupons);
  }, []);

  const notifySuccess = useCallback((title) => {
    showToast({ kind: 'success', title });
  }, [showToast]);

  const notifyError = useCallback((title) => {
    showToast({ kind: 'error', title });
  }, [showToast]);

  return {
    pct,
    code,
    showForm,
    coupons,
    loading,
    editingRest,
    ownerRestaurant,
    editingCoupon,

    setPct,
    setCode,
    setLoading,
    setShowForm,
    notifyError,
    notifySuccess,
    setEditingRest,
    onCouponsLoaded,
    setEditingCoupon,
  };
}

export default useManageCoupons;
