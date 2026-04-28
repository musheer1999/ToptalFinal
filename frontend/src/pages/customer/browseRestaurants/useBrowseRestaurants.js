import { useCallback, useState } from 'react';

function useBrowseRestaurants() {
  const [restaurants, setRestaurants] = useState([]);

  const onAfterGetRestaurants = useCallback((loadedRestaurants) => {
    setRestaurants(loadedRestaurants);
  }, []);

  return {
    restaurants,

    onAfterGetRestaurants,
  };
}

export default useBrowseRestaurants;