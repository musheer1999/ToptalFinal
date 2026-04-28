const couponRepo = require('../repositories/couponRepository');
const restaurantRepo = require('../repositories/restaurantRepository');

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

async function assertRestaurantOwnership(restaurantId, userId) {
  const restaurant = await restaurantRepo.findById(restaurantId);
  if (!restaurant) fail('Restaurant not found', 404);
  if (restaurant.owner_id !== userId) fail('You can only manage coupons for your own restaurant', 403);
}

async function getCouponsByRestaurant(restaurantId) {
  return couponRepo.findByRestaurantId(restaurantId);
}

async function createCoupon(restaurantId, userId, { code, discount_percentage }) {
  if (!code || !discount_percentage) fail('Coupon code and discount percentage are required', 400);
  const discount = parseInt(discount_percentage);
  if (isNaN(discount) || discount < 1 || discount > 100) {
    fail('Discount percentage must be between 1 and 100', 400);
  }
  await assertRestaurantOwnership(restaurantId, userId);
  return couponRepo.create({ code, discountPercentage: discount, restaurantId });
}

async function updateCoupon(restaurantId, couponId, userId, { code, discount_percentage }) {
  await assertRestaurantOwnership(restaurantId, userId);
  const coupon = await couponRepo.findById(couponId, restaurantId);
  if (!coupon) fail('Coupon not found', 404);
  const discountPercentage = discount_percentage ? parseInt(discount_percentage) : null;
  return couponRepo.update(couponId, { code, discountPercentage });
}

async function deleteCoupon(restaurantId, couponId, userId) {
  await assertRestaurantOwnership(restaurantId, userId);
  const coupon = await couponRepo.findById(couponId, restaurantId);
  if (!coupon) fail('Coupon not found', 404);
  await couponRepo.remove(couponId);
}

async function validateCoupon(restaurantId, code) {
  if (!code) fail('Coupon code is required', 400);
  const coupon = await couponRepo.findByCode(code, restaurantId);
  if (!coupon) fail('Invalid coupon code', 404);
  return { id: coupon.id, code: coupon.code, discount_percentage: coupon.discount_percentage };
}

module.exports = {
  getCouponsByRestaurant,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
