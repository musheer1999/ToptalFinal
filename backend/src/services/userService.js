const userRepo = require('../repositories/userRepository');
const restaurantRepo = require('../repositories/restaurantRepository');

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

async function assertRestaurantOwnership(restaurantId, ownerId) {
  if (!restaurantId) fail('restaurant_id is required', 400);
  const restaurant = await restaurantRepo.findById(restaurantId);
  if (!restaurant || restaurant.owner_id !== ownerId) {
    fail('You can only manage users for your own restaurant', 403);
  }
}

async function getAllUsers(ownerId) {
  return userRepo.findAllCustomers(ownerId);
}

async function blockUser(targetUserId, restaurantId, ownerId) {
  await assertRestaurantOwnership(restaurantId, ownerId);

  const targetUser = await userRepo.findById(targetUserId);
  if (!targetUser) fail('User not found', 404);
  if (targetUser.role === 'owner') fail('Cannot block restaurant owners', 400);
  if (parseInt(targetUserId) === ownerId) fail('Cannot block yourself', 400);

  await userRepo.blockUser(targetUserId, restaurantId);
}

async function unblockUser(targetUserId, restaurantId, ownerId) {
  await assertRestaurantOwnership(restaurantId, ownerId);
  await userRepo.unblockUser(targetUserId, restaurantId);
}

module.exports = { getAllUsers, blockUser, unblockUser };
