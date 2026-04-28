const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/userRepository');
const { generateToken } = require('../utils/jwt');

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

async function register(email, password, role) {
  if (!email || !password || !role) fail('Email, password, and role are required', 400);
  if (role !== 'customer' && role !== 'owner') fail('Role must be either customer or owner', 400);
  if (password.length < 6) fail('Password must be at least 6 characters', 400);

  const existing = await userRepo.findByEmail(email);
  if (existing) fail('Email already registered. Please login instead.', 400);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userRepo.create(email, hashedPassword, role);
  const token = generateToken(user.id, user.role);

  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

async function login(email, password) {
  if (!email || !password) fail('Email and password are required', 400);

  const user = await userRepo.findByEmail(email);
  if (!user) fail('Invalid email or password', 401);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) fail('Invalid email or password', 401);

  const token = generateToken(user.id, user.role);
  return { token, user: { id: user.id, email: user.email, role: user.role } };
}

async function getMe(userId) {
  const user = await userRepo.findById(userId);
  if (!user) fail('User not found', 404);
  return user;
}

module.exports = { register, login, getMe };
