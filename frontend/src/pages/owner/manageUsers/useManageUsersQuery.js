import { useCallback } from 'react';
import apiCall from '../../../utils/apiCall';

function useManageUsersQuery() {
  const loadUsers = useCallback(async () => {
    const data = await apiCall('GET', '/users');
    return data.users || [];
  }, []);

  const blockUser = useCallback(async (userId, restaurantId) => {
    await apiCall('POST', `/users/${userId}/block`, { restaurant_id: parseInt(restaurantId, 10) });
  }, []);

  const unblockUser = useCallback(async (userId, restaurantId) => {
    await apiCall('DELETE', `/users/${userId}/block`, { restaurant_id: parseInt(restaurantId, 10) });
  }, []);

  return {
    loadUsers,
    blockUser,
    unblockUser,
  };
}

export default useManageUsersQuery;
