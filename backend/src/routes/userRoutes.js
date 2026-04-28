// ─────────────────────────────────────────────────────────────
// USER ROUTES
// Base URL: /api/users
// These routes are for restaurant owners to manage users
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const { getAllUsers, blockUser, unblockUser } = require('../controllers/userController');
const { authMiddleware, ownerOnlyMiddleware } = require('../middleware/authMiddleware');

// GET /api/users → Get all customers (owners only)
router.get('/', authMiddleware, ownerOnlyMiddleware, getAllUsers);

// POST /api/users/:userId/block → Block a user (owners only)
router.post('/:userId/block', authMiddleware, ownerOnlyMiddleware, blockUser);

// DELETE /api/users/:userId/block → Unblock a user (owners only)
router.delete('/:userId/block', authMiddleware, ownerOnlyMiddleware, unblockUser);

module.exports = router;
