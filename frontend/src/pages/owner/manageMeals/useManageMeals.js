import { useCallback, useState } from 'react';
import { useStore } from '../../../context/StoreContext';

function useManageMeals() {
  const { ownerRestaurant, showToast } = useStore();
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', type: 'Main' });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRest, setEditingRest] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [deletingMeal, setDeletingMeal] = useState(null);

  const setFormField = useCallback((field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const onMealsLoaded = useCallback((loadedMeals) => {
    setMeals(loadedMeals);
  }, []);

  const addMeal = useCallback((meal) => {
    setMeals((prev) => [...prev, meal]);
  }, []);

  const replaceMeal = useCallback((mealId, changes) => {
    setMeals((prev) => prev.map((meal) => (meal.id === mealId ? { ...meal, ...changes } : meal)));
  }, []);

  const removeMeal = useCallback((mealId) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== mealId));
  }, []);

  const notifySuccess = useCallback((title, body) => {
    showToast({ kind: 'success', title, body });
  }, [showToast]);

  const notifyError = useCallback((title) => {
    showToast({ kind: 'error', title });
  }, [showToast]);

  return {
    form,
    meals,
    loading,
    showForm,
    editingRest,
    editingMeal,
    deletingMeal,
    ownerRestaurant,

    setForm,
    setLoading,
    setShowForm,
    setEditingRest,
    setEditingMeal,
    setDeletingMeal,
    notifyError,
    notifySuccess,
    setFormField,
    onMealsLoaded,
    removeMeal,
    replaceMeal,
    addMeal,
  };
}

export default useManageMeals;
