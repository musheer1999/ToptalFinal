// ─────────────────────────────────────────────────────────────
// ORDER ROUTES
// Base URL: /api/orders
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  reorder,
} = require('../controllers/orderController');

const {
  authMiddleware,
  customerOnlyMiddleware,
  ownerOnlyMiddleware,
} = require('../middleware/authMiddleware');

// POST /api/orders → Place a new order (customers only)
router.post('/', authMiddleware, customerOnlyMiddleware, placeOrder);

// GET /api/orders/my → Get my order history (customers only)
router.get('/my', authMiddleware, customerOnlyMiddleware, getMyOrders);

// GET /api/orders/restaurant/:restaurantId → Get restaurant's orders (owners only)
router.get('/restaurant/:restaurantId', authMiddleware, ownerOnlyMiddleware, getRestaurantOrders);

// GET /api/orders/:orderId → Get single order detail (customer or owner)
router.get('/:orderId', authMiddleware, getOrderById);

// PATCH /api/orders/:orderId/status → Update order status
router.patch('/:orderId/status', authMiddleware, updateOrderStatus);

// POST /api/orders/:orderId/reorder → Reorder (customers only)
router.post('/:orderId/reorder', authMiddleware, customerOnlyMiddleware, reorder);

module.exports = router;
