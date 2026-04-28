import { useCallback } from 'react';
import apiCall from '../../../utils/apiCall';

function useBrowseMealsQuery({ onAfterLoad }) {
  const loadRestaurantMenu = useCallback(
    async (restaurantId) => {
      const [restaurantsData, mealsData] = await Promise.all([
        apiCall('GET', '/restaurants'),
        apiCall('GET', `/restaurants/${restaurantId}/meals`),
      ]);

      const restaurant =
        (restaurantsData.restaurants || []).find(
          (item) => String(item.id) === String(restaurantId)
        ) || null;

      onAfterLoad({
        restaurant,
        meals: mealsData.meals || [],
      });
    },
    [onAfterLoad]
  );

  return {
    loadRestaurantMenu,
  };
}

export default useBrowseMealsQuery;
