import { useCallback, useState } from 'react';
import apiCall from '../../../utils/apiCall';

function useBrowseRestaurantsQuery({ onAfterGetRestaurants }) {
  const [loading, setLoading] = useState(false);

  const loadRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiCall('GET', '/restaurants');
      onAfterGetRestaurants(data.restaurants || []);
    } catch (err) {
      console.error('Failed to load restaurants:', err.message);
    } finally {
      setLoading(false);
    }
  }, [onAfterGetRestaurants]);

  return {
    loading,

    loadRestaurants,
  };
}

export default useBrowseRestaurantsQuery;
