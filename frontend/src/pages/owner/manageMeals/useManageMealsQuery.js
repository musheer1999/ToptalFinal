import { useCallback } from 'react';
import apiCall from '../../../utils/apiCall';

function useManageMealsQuery() {
  const loadMeals = useCallback(async (restaurantId) => {
    const data = await apiCall('GET', `/restaurants/${restaurantId}/meals`);
    return data.meals || [];
  }, []);

  const createMeal = useCallback(async (restaurantId, payload) => {
    await apiCall('POST', `/restaurants/${restaurantId}/meals`, payload);
  }, []);

  const updateMeal = useCallback(async (restaurantId, mealId, payload) => {
    await apiCall('PUT', `/restaurants/${restaurantId}/meals/${mealId}`, payload);
  }, []);

  const deleteMeal = useCallback(async (restaurantId, mealId) => {
    await apiCall('DELETE', `/restaurants/${restaurantId}/meals/${mealId}`);
  }, []);

  return {
    loadMeals,
    createMeal,
    updateMeal,
    deleteMeal,
  };
}

export default useManageMealsQuery;
