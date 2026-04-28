const userService = require('../services/userService');

async function getAllUsers(req, res) {
  try {
    const users = await userService.getAllUsers(req.user.userId);
    res.json({ users });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to fetch users' });
  }
}

async function blockUser(req, res) {
  try {
    await userService.blockUser(req.params.userId, req.body.restaurant_id, req.user.userId);
    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to block user' });
  }
}

async function unblockUser(req, res) {
  try {
    await userService.unblockUser(req.params.userId, req.body.restaurant_id, req.user.userId);
    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Failed to unblock user' });
  }
}

module.exports = { getAllUsers, blockUser, unblockUser };
