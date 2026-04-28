const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { email, password, role } = req.body;
    const result = await authService.register(email, password, role);
    res.status(201).json({ message: 'Account created successfully', ...result });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Something went wrong. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({ message: 'Login successful', ...result });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Something went wrong. Please try again.' });
  }
}

async function getMe(req, res) {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json({ user });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Something went wrong' });
  }
}

module.exports = { register, login, getMe };
