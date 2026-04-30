const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { phone, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user — patients are auto-verified, vendors need approval
    const user = await User.create({
      phone,
      name,
      role,
      isVerified: role === 'patient', // patients are always verified
      verificationStatus: role === 'vendor' ? 'none' : 'approved',
    });

    res.status(201).json({
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        licenseUrl: user.licenseUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user with phone + OTP
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Hardcoded OTP for development
    if (otp !== '123456') {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    res.status(200).json({
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        licenseUrl: user.licenseUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
