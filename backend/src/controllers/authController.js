const authService = require('../services/authService');

const COOKIE_OPTIONS = {
  httpOnly: true,   // JS cannot read this cookie — blocks XSS token theft
  sameSite: 'lax',  // Sent on same-site navigations, blocks CSRF from other origins
  secure: process.env.NODE_ENV === 'production', // HTTPS-only in prod, HTTP ok in dev
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

function setAuthCookie(res, token) {
  res.cookie('fd_token', token, COOKIE_OPTIONS);
}

async function register(req, res) {
  try {
    const { email, password, role } = req.body;
    const result = await authService.register(email, password, role);
    setAuthCookie(res, result.token);
    res.status(201).json({ message: 'Account created successfully', user: result.user });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Something went wrong. Please try again.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    setAuthCookie(res, result.token);
    res.status(200).json({ message: 'Login successful', user: result.user });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Something went wrong. Please try again.' });
  }
}

async function logout(req, res) {
  res.clearCookie('fd_token', COOKIE_OPTIONS);
  res.json({ message: 'Logged out successfully' });
}

async function getMe(req, res) {
  try {
    const user = await authService.getMe(req.user.userId);
    res.json({ user });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Something went wrong' });
  }
}

module.exports = { register, login, logout, getMe };
