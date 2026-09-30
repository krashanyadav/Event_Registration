const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Cookie set karne ka helper
const sendTokenCookie = (res, userId) => {
  const token = generateToken(userId);

  res.cookie('token', token, {
    httpOnly: true,                                   // JS se access nahi hogi
    secure: false,    // production mein sirf HTTPS
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,                  // 7 days
  });
};

// POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashCode = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, hashCode);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    sendTokenCookie(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    sendTokenCookie(res, user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0), // cookie turant expire
  });
  res.json({ message: 'Logged out successfully' });
};

// GET /api/auth/me  (current logged-in user)
const getMe = (req, res) => {
  res.json(req.user);
};

module.exports = { signup, login, logout, getMe };