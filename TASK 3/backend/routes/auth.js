const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   POST api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Simple validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  if (username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters long' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check for existing user by email
    let userByEmail = await User.findOne({ email: email.toLowerCase() });
    if (userByEmail) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Check for existing user by username
    let userByUsername = await User.findOne({ username });
    if (userByUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Create user instance
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // Save to database
    await newUser.save();

    // Create JWT Payload
    const payload = {
      user: {
        id: newUser.id
      }
    };

    // Sign JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
          }
        });
      }
    );
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT Payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user details
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
});

module.exports = router;
