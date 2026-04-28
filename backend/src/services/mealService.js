const mealRepo = require('../repositories/mealRepository');
const restaurantRepo = require('../repositories/restaurantRepository');

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

async function assertRestaurantOwnership(restaurantId, userId) {
  const restaurant = await restaurantRepo.findById(restaurantId);
  if (!restaurant) fail('Restaurant not found', 404);
  if (restaurant.owner_id !== userId) fail('You can only modify meals in your own restaurant', 403);
}

async function getMealsByRestaurant(restaurantId) {
  const restaurant = await restaurantRepo.findById(restaurantId);
  if (!restaurant) fail('Restaurant not found', 404);
  return mealRepo.findByRestaurantId(restaurantId);
}

async function createMeal(restaurantId, userId, { name, description, price, type }) {
  if (!name || !price) fail('Meal name and price are required', 400);
  if (isNaN(price) || parseFloat(price) <= 0) fail('Price must be a positive number', 400);
  await assertRestaurantOwnership(restaurantId, userId);
  return mealRepo.create({ name, description, price: parseFloat(price), type, restaurantId });
}

async function updateMeal(restaurantId, mealId, userId, data) {
  await assertRestaurantOwnership(restaurantId, userId);
  const meal = await mealRepo.findById(mealId, restaurantId);
  if (!meal) fail('Meal not found in this restaurant', 404);
  return mealRepo.update(mealId, data);
}

async function deleteMeal(restaurantId, mealId, userId) {
  await assertRestaurantOwnership(restaurantId, userId);
  const meal = await mealRepo.findById(mealId, restaurantId);
  if (!meal) fail('Meal not found in this restaurant', 404);
  await mealRepo.remove(mealId);
}

module.exports = { getMealsByRestaurant, createMeal, updateMeal, deleteMeal };
