const mealService = require('../services/mealService');

async function getMealsByRestaurant(req, res) {
  try {
    const meals = await mealService.getMealsByRestaurant(req.params.restaurantId);
    res.json({ meals });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch meals' });
  }
}

async function createMeal(req, res) {
  try {
    const meal = await mealService.createMeal(req.params.restaurantId, req.user.userId, req.body);
    res.status(201).json({ message: 'Meal created successfully', meal });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to create meal' });
  }
}

async function updateMeal(req, res) {
  try {
    const meal = await mealService.updateMeal(req.params.restaurantId, req.params.mealId, req.user.userId, req.body);
    res.json({ message: 'Meal updated successfully', meal });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to update meal' });
  }
}

async function deleteMeal(req, res) {
  try {
    await mealService.deleteMeal(req.params.restaurantId, req.params.mealId, req.user.userId);
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to delete meal' });
  }
}

module.exports = { getMealsByRestaurant, createMeal, updateMeal, deleteMeal };
