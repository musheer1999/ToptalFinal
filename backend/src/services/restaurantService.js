const restaurantRepo = require('../repositories/restaurantRepository');

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

async function assertOwnership(restaurantId, userId) {
  const restaurant = await restaurantRepo.findById(restaurantId);
  if (!restaurant) fail('Restaurant not found', 404);
  if (restaurant.owner_id !== userId) fail('You can only modify your own restaurant', 403);
  return restaurant;
}

async function getAllRestaurants() {
  return restaurantRepo.findAll();
}

async function getRestaurantById(id) {
  const restaurant = await restaurantRepo.findById(id);
  if (!restaurant) fail('Restaurant not found', 404);
  return restaurant;
}

async function getMyRestaurants(ownerId) {
  return restaurantRepo.findByOwnerId(ownerId);
}

async function createRestaurant(ownerId, data) {
  if (!data.name) fail('Restaurant name is required', 400);
  return restaurantRepo.create({ ...data, ownerId });
}

async function updateRestaurant(id, userId, data) {
  await assertOwnership(id, userId);
  return restaurantRepo.update(id, data);
}

async function deleteRestaurant(id, userId) {
  await assertOwnership(id, userId);
  await restaurantRepo.remove(id);
}

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
