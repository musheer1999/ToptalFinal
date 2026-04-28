// ─────────────────────────────────────────────────────────────
// RESTAURANT ROUTES
// Defines URL endpoints for restaurant operations.
// Base URL: /api/restaurants (defined in server.js)
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');

// Import middleware
const { authMiddleware, ownerOnlyMiddleware } = require('../middleware/authMiddleware');

// ─── ROUTES ───────────────────────────────────────────────────

// GET /api/restaurants/my — Get owner's own restaurants
// Note: This route MUST come BEFORE /:id route
// Otherwise Express would think "my" is an ID
router.get('/my', authMiddleware, ownerOnlyMiddleware, getMyRestaurants);

// GET /api/restaurants — Get all restaurants (for customers to browse)
router.get('/', authMiddleware, getAllRestaurants);

// GET /api/restaurants/:id — Get one restaurant by ID
router.get('/:id', authMiddleware, getRestaurantById);

// POST /api/restaurants — Create a new restaurant (owner only)
router.post('/', authMiddleware, ownerOnlyMiddleware, createRestaurant);

// PUT /api/restaurants/:id — Update a restaurant (owner only)
router.put('/:id', authMiddleware, ownerOnlyMiddleware, updateRestaurant);

// DELETE /api/restaurants/:id — Delete a restaurant (owner only)
router.delete('/:id', authMiddleware, ownerOnlyMiddleware, deleteRestaurant);

module.exports = router;
