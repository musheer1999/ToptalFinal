import { useCallback, useMemo, useState } from 'react';
import { useStore } from '../../../context/StoreContext';

function useManageUsers() {
  const { ownerRestaurant, showToast } = useStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRest, setEditingRest] = useState(false);

  const customers = useMemo(() => users.filter((user) => user.role === 'customer'), [users]);

  const onUsersLoaded = useCallback((loadedUsers) => {
    setUsers(loadedUsers);
  }, []);

  const updateBlockedStatus = useCallback((userId, isBlocked) => {
    setUsers((prev) =>
      prev.map((user) =>
        String(user.id) === String(userId) ? { ...user, is_blocked: isBlocked } : user
      )
    );
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
    users,
    loading,
    customers,
    editingRest,
    ownerRestaurant,

    setLoading,
    notifyError,
    notifySuccess,
    setEditingRest,
    onUsersLoaded,
    updateBlockedStatus,
  };
}

export default useManageUsers;
