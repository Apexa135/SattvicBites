import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper: Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, city, pincode, isAdmin } = req.body;

    // Validation
    if (!name || !email || !password || !city || !pincode) {
      return res.status(400).json({ message: 'Please fulfill all registry input parameters' });
    }

    // Geofencing verification at request boundary
    const allowedAreas = {
      'Vallabh Vidyanagar': '388120',
      'Karamsad': '388325'
    };

    if (!allowedAreas[city]) {
      return res.status(400).json({ message: 'Delivery is only available in Vallabh Vidyanagar or Karamsad' });
    }

    if (allowedAreas[city] !== pincode) {
      return res.status(400).json({ 
        message: `Mismatched boundary parameters: Pincode for ${city} must be ${allowedAreas[city]}` 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email is already registered' });
    }

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      city,
      pincode,
      isAdmin: isAdmin || false // Admin status can be set during development testing
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        pincode: user.pincode,
        isAdmin: user.isAdmin,
        streetAddress: user.streetAddress || '',
        token: generateToken(user._id)
      });
    } else {
      return res.status(400).json({ message: 'Invalid registration payload' });
    }
  } catch (error) {
    console.error(`[Reg Error] ${error.message}`);
    return res.status(500).json({ message: `Server error during registration: ${error.message}` });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // Find User
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        pincode: user.pincode,
        isAdmin: user.isAdmin,
        streetAddress: user.streetAddress || '',
        token: generateToken(user._id)
      });
    } else {
      return res.status(401).json({ message: 'Invalid authentication credentials' });
    }
  } catch (error) {
    console.error(`[Login Error] ${error.message}`);
    return res.status(500).json({ message: `Server error during login: ${error.message}` });
  }
};

// @desc    Get user profile data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ message: 'User profile not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
