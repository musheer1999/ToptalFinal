import { useCallback, useMemo, useState } from 'react';
import { useStore } from '../../../context/StoreContext';
import { useCartContext } from '../../../context/CartContext';

function useBrowseMeals() {
  const { showToast } = useStore();
  const { cart, updateCartQty, removeFromCart, addMealToCart: addToCart } = useCartContext();
  const [restaurant, setRestaurant] = useState(null);
  const [meals, setMeals] = useState([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const onAfterLoad = useCallback(({ restaurant: loadedRestaurant, meals: loadedMeals }) => {
    setRestaurant(loadedRestaurant);
    setMeals(loadedMeals);
  }, []);

  const types = useMemo(
    () => ['All', ...new Set(meals.map((meal) => meal.type).filter(Boolean))],
    [meals]
  );

  const filteredMeals =
    typeFilter === 'All' ? meals : meals.filter((meal) => meal.type === typeFilter);

  const addMealToCart = useCallback(
    (meal) => {
      addToCart(meal, restaurant?.name || '');
      showToast({ kind: 'success', title: `Added ${meal.name}`, body: '1 × added to cart.' });
    },
    [addToCart, restaurant?.name, showToast]
  );

  return {
    cart,
    meals,
    types,
    loading,
    restaurant,
    typeFilter,
    filteredMeals,

    setLoading,
    onAfterLoad,
    addMealToCart,
    removeFromCart,
    setTypeFilter,
    updateCartQty,
  };
}

export default useBrowseMeals;
