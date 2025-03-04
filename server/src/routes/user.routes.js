const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user.model');

// Auth middleware
const auth = passport.authenticate('jwt', { session: false });

// @route   GET api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in get profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, profilePicture } = req.body;
    
    // Build profile object
    const profileFields = {};
    if (name) profileFields.name = name;
    if (email) profileFields.email = email;
    if (profilePicture) profileFields.profilePicture = profilePicture;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Error in update profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/user/password
// @desc    Update user password
// @access  Private
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in update password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/user/notification-settings
// @desc    Update notification settings
// @access  Private
router.put('/notification-settings', auth, async (req, res) => {
  try {
    const { notificationSettings } = req.body;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { notificationSettings } },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    console.error('Error in update notification settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/user/social-accounts
// @desc    Get user social accounts
// @access  Private
router.get('/social-accounts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('socialAccounts');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.socialAccounts);
  } catch (error) {
    console.error('Error in get social accounts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/user/social-accounts
// @desc    Add social account
// @access  Private
router.post('/social-accounts', auth, async (req, res) => {
  try {
    const { platform, accountId, username, accessToken, refreshToken, tokenExpiry } = req.body;
    
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if account already exists
    const accountExists = user.socialAccounts.find(
      account => account.platform === platform && account.accountId === accountId
    );
    
    if (accountExists) {
      return res.status(400).json({ message: 'Social account already exists' });
    }
    
    // Add social account
    user.socialAccounts.push({
      platform,
      accountId,
      username,
      accessToken,
      refreshToken,
      tokenExpiry,
      connected: true,
    });
    
    await user.save();
    
    res.json(user.socialAccounts);
  } catch (error) {
    console.error('Error in add social account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/user/social-accounts/:id
// @desc    Update social account
// @access  Private
router.put('/social-accounts/:id', auth, async (req, res) => {
  try {
    const { accessToken, refreshToken, tokenExpiry, connected } = req.body;
    
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find social account
    const accountIndex = user.socialAccounts.findIndex(
      account => account._id.toString() === req.params.id
    );
    
    if (accountIndex === -1) {
      return res.status(404).json({ message: 'Social account not found' });
    }
    
    // Update social account
    if (accessToken) user.socialAccounts[accountIndex].accessToken = accessToken;
    if (refreshToken) user.socialAccounts[accountIndex].refreshToken = refreshToken;
    if (tokenExpiry) user.socialAccounts[accountIndex].tokenExpiry = tokenExpiry;
    if (connected !== undefined) user.socialAccounts[accountIndex].connected = connected;
    
    await user.save();
    
    res.json(user.socialAccounts);
  } catch (error) {
    console.error('Error in update social account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/user/social-accounts/:id
// @desc    Delete social account
// @access  Private
router.delete('/social-accounts/:id', auth, async (req, res) => {
  try {
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Find social account
    const accountIndex = user.socialAccounts.findIndex(
      account => account._id.toString() === req.params.id
    );
    
    if (accountIndex === -1) {
      return res.status(404).json({ message: 'Social account not found' });
    }
    
    // Remove social account
    user.socialAccounts.splice(accountIndex, 1);
    
    await user.save();
    
    res.json(user.socialAccounts);
  } catch (error) {
    console.error('Error in delete social account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/user
// @desc    Delete user account
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // Delete user
    await User.findByIdAndDelete(req.user.id);
    
    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error in delete user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 