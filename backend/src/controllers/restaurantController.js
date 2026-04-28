const restaurantService = require('../services/restaurantService');

async function getAllRestaurants(req, res) {
  try {
    const restaurants = await restaurantService.getAllRestaurants();
    res.json({ restaurants });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch restaurants' });
  }
}

async function getRestaurantById(req, res) {
  try {
    const restaurant = await restaurantService.getRestaurantById(req.params.id);
    res.json({ restaurant });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch restaurant' });
  }
}

async function getMyRestaurants(req, res) {
  try {
    const restaurants = await restaurantService.getMyRestaurants(req.user.userId);
    res.json({ restaurants });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch your restaurants' });
  }
}

async function createRestaurant(req, res) {
  try {
    const restaurant = await restaurantService.createRestaurant(req.user.userId, req.body);
    res.status(201).json({ message: 'Restaurant created successfully', restaurant });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to create restaurant' });
  }
}

async function updateRestaurant(req, res) {
  try {
    const restaurant = await restaurantService.updateRestaurant(req.params.id, req.user.userId, req.body);
    res.json({ message: 'Restaurant updated successfully', restaurant });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to update restaurant' });
  }
}

async function deleteRestaurant(req, res) {
  try {
    await restaurantService.deleteRestaurant(req.params.id, req.user.userId);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to delete restaurant' });
  }
}

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
