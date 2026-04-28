import { useState } from 'react';
import { useStore } from '../../../context/StoreContext';

function useManageRestaurants() {
  const { ownerRestaurant } = useStore();
  const [editing, setEditing] = useState(false);

  return {
    editing,
    ownerRestaurant,

    setEditing,
  };
}

export default useManageRestaurants;
