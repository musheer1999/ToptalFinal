// ─────────────────────────────────────────────────────────────
// MEAL ROUTES
// Base URL: /api/restaurants/:restaurantId/meals
// Meals are nested under restaurants because they belong to a restaurant
// ─────────────────────────────────────────────────────────────

const express = require('express');
// mergeParams: true → allows access to :restaurantId from parent route
const router = express.Router({ mergeParams: true });

const {
  getMealsByRestaurant,
  createMeal,
  updateMeal,
  deleteMeal,
} = require('../controllers/mealController');

const { authMiddleware, ownerOnlyMiddleware } = require('../middleware/authMiddleware');

// GET /api/restaurants/:restaurantId/meals → Get all meals for a restaurant
router.get('/', authMiddleware, getMealsByRestaurant);

// POST /api/restaurants/:restaurantId/meals → Create a meal (owners only)
router.post('/', authMiddleware, ownerOnlyMiddleware, createMeal);

// PUT /api/restaurants/:restaurantId/meals/:mealId → Update a meal (owners only)
router.put('/:mealId', authMiddleware, ownerOnlyMiddleware, updateMeal);

// DELETE /api/restaurants/:restaurantId/meals/:mealId → Delete a meal (owners only)
router.delete('/:mealId', authMiddleware, ownerOnlyMiddleware, deleteMeal);

module.exports = router;
