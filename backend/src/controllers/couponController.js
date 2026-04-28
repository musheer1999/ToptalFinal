const couponService = require('../services/couponService');

async function getCouponsByRestaurant(req, res) {
  try {
    const coupons = await couponService.getCouponsByRestaurant(req.params.restaurantId);
    res.json({ coupons });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch coupons' });
  }
}

async function createCoupon(req, res) {
  try {
    const coupon = await couponService.createCoupon(req.params.restaurantId, req.user.userId, req.body);
    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A coupon with this code already exists for this restaurant' });
    }
    res.status(error.status || 500).json({ error: error.message || 'Failed to create coupon' });
  }
}

async function updateCoupon(req, res) {
  try {
    const coupon = await couponService.updateCoupon(
      req.params.restaurantId, req.params.couponId, req.user.userId, req.body
    );
    res.json({ message: 'Coupon updated successfully', coupon });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A coupon with this code already exists' });
    }
    res.status(error.status || 500).json({ error: error.message || 'Failed to update coupon' });
  }
}

async function deleteCoupon(req, res) {
  try {
    await couponService.deleteCoupon(req.params.restaurantId, req.params.couponId, req.user.userId);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to delete coupon' });
  }
}

async function validateCoupon(req, res) {
  try {
    const coupon = await couponService.validateCoupon(req.params.restaurantId, req.body.code);
    res.json({ valid: true, coupon });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to validate coupon' });
  }
}

module.exports = { getCouponsByRestaurant, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
