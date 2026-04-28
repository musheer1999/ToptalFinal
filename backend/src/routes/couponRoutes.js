// ─────────────────────────────────────────────────────────────
// COUPON ROUTES
// Base URL: /api/restaurants/:restaurantId/coupons
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams to access restaurantId

const {
  getCouponsByRestaurant,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} = require('../controllers/couponController');

const { authMiddleware, ownerOnlyMiddleware } = require('../middleware/authMiddleware');

// POST /api/restaurants/:restaurantId/coupons/validate → Validate a coupon (customers)
// IMPORTANT: This route must come BEFORE /:couponId routes
router.post('/validate', authMiddleware, validateCoupon);

// GET /api/restaurants/:restaurantId/coupons → Get all coupons
router.get('/', authMiddleware, ownerOnlyMiddleware, getCouponsByRestaurant);

// POST /api/restaurants/:restaurantId/coupons → Create coupon (owners only)
router.post('/', authMiddleware, ownerOnlyMiddleware, createCoupon);

// PUT /api/restaurants/:restaurantId/coupons/:couponId → Update coupon (owners only)
router.put('/:couponId', authMiddleware, ownerOnlyMiddleware, updateCoupon);

// DELETE /api/restaurants/:restaurantId/coupons/:couponId → Delete coupon (owners only)
router.delete('/:couponId', authMiddleware, ownerOnlyMiddleware, deleteCoupon);

module.exports = router;
