const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const sendEmail = require('../services/emailService');
const { sendSMS } = require('../services/smsService');
const otpGenerator = require('otp-generator');

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// Helper: Generate OTP
const generateOTP = () => {
  return otpGenerator.generate(6, { 
    upperCaseAlphabets: false, 
    specialChars: false,
    lowerCaseAlphabets: false 
  });
};

// Helper: Check if identifier is email or phone
const isEmail = (identifier) => identifier && identifier.includes('@');
const isPhone = (identifier) => identifier && /^[6-9]\d{9}$/.test(identifier.replace(/[\s\-\+]/g, '').replace(/^91/, ''));

// Helper: Clean phone number
const cleanPhone = (phone) => phone.replace(/[\s\-\+]/g, '').replace(/^91/, '');

// ==========================================
// REGISTER - Support email or phone
// ==========================================
router.post('/register', [
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().custom((value) => {
    if (value && !isPhone(value)) {
      throw new Error('Invalid phone number (10 digits starting with 6-9)');
    }
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('businessName').optional().trim(),
  body('displayName').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, phone, password, businessName, displayName, userType } = req.body;

  // Ensure at least one contact method
  if (!email && !phone) {
    return res.status(400).json({ message: 'Either email or phone is required' });
  }

  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, simulating registration');
      const otp = generateOTP();
      const method = email ? 'email' : 'phone';
      
      console.log(`\n=== REGISTRATION SIMULATION ===`);
      console.log(`Method: ${method}`);
      console.log(`${method === 'email' ? 'Email' : 'Phone'}: ${email || phone}`);
      console.log(`OTP: ${otp}`);
      console.log(`================================\n`);
      
      return res.status(201).json({
        message: `Please verify your ${method}`,
        verificationMethod: method,
        identifier: email || phone,
        emailSent: method === 'email',
        smsSent: method === 'phone',
        // Include OTP for testing (remove in production)
        ...(process.env.NODE_ENV !== 'production' && { otp })
      });
    }

    // Check for existing user
    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }
    
    if (phone) {
      const existingPhone = await User.findOne({ phone: cleanPhone(phone) });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const primaryMethod = email ? 'email' : 'phone';

    const user = new User({
      email: email ? email.toLowerCase() : undefined,
      phone: phone ? cleanPhone(phone) : undefined,
      passwordHash,
      otp,
      otpExpires,
      otpType: primaryMethod,
      primaryLoginMethod: primaryMethod,
      businessName,
      displayName,
      userType: userType || 'user'
    });
    
    await user.save();

    // Send verification
    let verificationSent = false;
    
    if (primaryMethod === 'email') {
      try {
        await sendEmail(
          email, 
          'Verify Your Email - Trusted Escort',
          `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
        );
        verificationSent = true;
      } catch (err) {
        console.error('Email sending failed:', err);
      }
    } else {
      try {
        const smsResult = await sendSMS(phone, otp);
        verificationSent = smsResult.success;
      } catch (err) {
        console.error('SMS sending failed:', err);
      }
    }

    res.status(201).json({
      message: `Please verify your ${primaryMethod}`,
      verificationMethod: primaryMethod,
      identifier: email || cleanPhone(phone),
      emailSent: primaryMethod === 'email' ? verificationSent : false,
      smsSent: primaryMethod === 'phone' ? verificationSent : false
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// ==========================================
// VERIFY - Support email or phone
// ==========================================
router.post('/verify', [
  body('identifier').notEmpty().withMessage('Email or phone is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid verification code')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { identifier, code } = req.body;
  const identifierType = isEmail(identifier) ? 'email' : 'phone';

  try {
    const user = await User.findByEmailOrPhone(identifier);
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.otp !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    // Update verification status
    if (identifierType === 'email') {
      user.isEmailVerified = true;
    } else {
      user.isPhoneVerified = true;
    }
    user.isVerified = true; // Legacy compatibility
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Grant 300 coins to advertiser on first verification
    if (user.userType === 'advertiser') {
      const existingWallet = await Wallet.findOne({ userId: user._id });
      if (!existingWallet) {
        // First time advertiser - grant 300 coins
        const wallet = new Wallet({
          userId: user._id,
          coins: 300,
          totalCoinsEarned: 300,
          transactions: [{
            type: 'admin-add',
            coins: 300,
            description: 'Welcome bonus for new advertiser',
            reference: 'manual',
            status: 'completed',
            paymentMethod: 'system',
            createdAt: new Date()
          }]
        });
        await wallet.save();
      }
    }

    // Generate token
    const accessToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Verification successful',
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        displayName: user.displayName,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Legacy verify-email endpoint (for backward compatibility)
router.post('/verify-email', [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 })
], async (req, res) => {
  // Redirect to unified verify endpoint
  req.body.identifier = req.body.email;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, code } = req.body;

  try {
    const user = await User.findByEmailOrPhone(email);
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.otp !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    user.isEmailVerified = true;
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const accessToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    res.json({
      token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        userType: user.userType
      }
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// LOGIN - Support email or phone
// ==========================================
router.post('/login', [
  body('identifier').optional(),
  body('email').optional().isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Support both 'identifier' (new) and 'email' (legacy) fields
  const identifier = req.body.identifier || req.body.email;
  const { password } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: 'Email or phone is required' });
  }

  try {
    // Find user by email or phone
    const user = await User.findByEmailOrPhone(identifier);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check verification status
    if (!user.isVerified && !user.isEmailVerified && !user.isPhoneVerified) {
      // Need verification - send new OTP
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.otpType = user.primaryLoginMethod;
      await user.save();

      // Send OTP
      let sent = false;
      if (user.primaryLoginMethod === 'email' && user.email) {
        try {
          await sendEmail(user.email, 'Verify Your Email', `Your verification code is: ${otp}`);
          sent = true;
        } catch (err) {
          console.error('Email failed:', err);
        }
      } else if (user.phone) {
        const result = await sendSMS(user.phone, otp);
        sent = result.success;
      }

      return res.status(403).json({
        requiresVerification: true,
        verificationMethod: user.primaryLoginMethod,
        identifier: user.email || user.phone,
        verificationSent: sent,
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          businessName: user.businessName
        }
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        displayName: user.displayName,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// FORGOT PASSWORD - Support email or phone
// ==========================================
router.post('/forgot-password', [
  body('identifier').optional(),
  body('email').optional().isEmail().normalizeEmail()
], async (req, res) => {
  // Support both 'identifier' (new) and 'email' (legacy) fields
  const identifier = req.body.identifier || req.body.email;

  if (!identifier) {
    return res.status(400).json({ message: 'Email or phone is required' });
  }

  const method = isEmail(identifier) ? 'email' : 'phone';

  try {
    const user = await User.findByEmailOrPhone(identifier);
    
    if (!user) {
      // Don't reveal if user exists
      return res.json({ 
        message: 'If an account exists, a reset code has been sent',
        method 
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpType = 'reset';
    await user.save();

    let sent = false;
    if (method === 'email') {
      try {
        await sendEmail(
          user.email, 
          'Reset Your Password - Trusted Escort',
          `Your password reset code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
        );
        sent = true;
      } catch (err) {
        console.error('Email failed:', err);
      }
    } else {
      const result = await sendSMS(user.phone, otp);
      sent = result.success;
    }

    res.json({
      message: 'Reset code sent',
      method,
      sent
    });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// RESET PASSWORD
// ==========================================
router.post('/reset-password', [
  body('identifier').optional(),
  body('email').optional(),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid reset code'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const identifier = req.body.identifier || req.body.email;
  const { code, newPassword } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: 'Email or phone is required' });
  }

  try {
    const user = await User.findByEmailOrPhone(identifier);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    if (user.otp !== code || user.otpType !== 'reset') {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Reset code expired' });
    }

    // Update password
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpType = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// RESEND VERIFICATION CODE
// ==========================================
router.post('/resend-verification', [
  body('identifier').optional(),
  body('email').optional()
], async (req, res) => {
  const identifier = req.body.identifier || req.body.email;
  const { method } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: 'Email or phone is required' });
  }

  const verifyMethod = method || (isEmail(identifier) ? 'email' : 'phone');

  try {
    const user = await User.findByEmailOrPhone(identifier);
    
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if already verified
    if ((verifyMethod === 'email' && user.isEmailVerified) ||
        (verifyMethod === 'phone' && user.isPhoneVerified)) {
      return res.status(400).json({ message: 'Already verified' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpType = verifyMethod;
    await user.save();

    let sent = false;
    if (verifyMethod === 'email' && user.email) {
      try {
        await sendEmail(user.email, 'Verification Code', `Your code is: ${otp}`);
        sent = true;
      } catch (err) {
        console.error('Email failed:', err);
      }
    } else if (user.phone) {
      const result = await sendSMS(user.phone, otp);
      sent = result.success;
    }

    res.json({
      message: 'Verification code sent',
      method: verifyMethod,
      sent,
      emailSent: verifyMethod === 'email' ? sent : false,
      smsSent: verifyMethod === 'phone' ? sent : false
    });

  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// GOOGLE OAUTH - Sign in/up with Google
// ==========================================
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, email_verified, name, picture } = payload;

    if (!email_verified) {
      return res.status(400).json({ message: 'Google email not verified' });
    }

    // Check if user exists by Google ID or email
    let user = await User.findOne({ 
      $or: [
        { googleId },
        { email: email.toLowerCase() }
      ]
    });

    if (user) {
      // User exists - update Google info if needed
      if (!user.googleId) {
        // User registered with email, now linking Google account
        user.googleId = googleId;
        user.profilePicture = picture;
        user.isEmailVerified = true; // Google emails are verified
        await user.save();
      }
    } else {
      // Create new user with Google
      user = new User({
        email: email.toLowerCase(),
        googleId,
        authProvider: 'google',
        displayName: name,
        profilePicture: picture,
        isEmailVerified: true, // Google emails are verified
        isVerified: true,
        userType: 'user'
      });
      await user.save();

      // Grant 300 coins if registering as advertiser
      if (user.userType === 'advertiser') {
        const wallet = new Wallet({
          userId: user._id,
          coins: 300,
          totalCoinsEarned: 300,
          transactions: [{
            type: 'admin-add',
            coins: 300,
            description: 'Welcome bonus for new advertiser',
            reference: 'manual',
            status: 'completed',
            paymentMethod: 'system',
            createdAt: new Date()
          }]
        });
        await wallet.save();
      }
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        userType: user.userType,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (err) {
    console.error('Google auth error:', err);
    if (err.message?.includes('Token used too late') || err.message?.includes('Invalid token')) {
      return res.status(401).json({ message: 'Invalid or expired Google token' });
    }
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// ==========================================
// GET PROFILE (Protected)
// ==========================================
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-passwordHash -otp -otpExpires -refreshToken');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// SUPER ADMIN ROUTES
// ==========================================

// Admin Login
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate tokens
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_here',
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_here',
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      },
      message: 'Admin login successful'
    });
  } catch (error) {
    res.status(500).json({ message: 'Admin login failed', error: error.message });
  }
});

// Create Initial Super Admin (Restricted - Only for first setup)
router.post('/admin/setup', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('setupKey').notEmpty().withMessage('Setup key required') // Use environment variable
], async (req, res) => {
  try {
    const { email, password, setupKey } = req.body;

    // Verify setup key (should match environment variable)
    const validSetupKey = process.env.ADMIN_SETUP_KEY || 'TRUSTED_ESCORT_SETUP_KEY_2024';
    if (setupKey !== validSetupKey) {
      return res.status(403).json({ message: 'Invalid setup key' });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin account already exists' });
    }

    // Check if user with this email exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Update existing user to admin
      user.role = 'admin';
      user.adminCreatedAt = new Date();
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      user = new User({
        email: email.toLowerCase(),
        passwordHash,
        displayName: 'Super Admin',
        role: 'admin',
        adminCreatedAt: new Date(),
        isEmailVerified: true,
        authProvider: 'local'
      });
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Super admin account created/updated successfully',
      admin: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to setup admin', error: error.message });
  }
});

// Get Admin Info (Protected)
router.get('/admin/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No authorization token' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret_here'
    );

    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;


