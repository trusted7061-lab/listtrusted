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
const cleanPhone = (phone) => phone.replace(/[\s\-\+]/g, '').replace(/^91/, '')

// Helper: Get or create wallet, return coin balance
// For new advertisers this also grants the 500-coin welcome bonus
const getOrCreateWallet = async (userId, isNewAdvertiser = false) => {
  let wallet = await Wallet.findOne({ userId })
  if (!wallet) {
    const startCoins = isNewAdvertiser ? 500 : 0
    wallet = new Wallet({
      userId,
      coins: startCoins,
      totalCoinsEarned: startCoins,
      transactions: isNewAdvertiser ? [{
        type: 'admin-add',
        coins: 500,
        description: 'Welcome bonus for new advertiser',
        reference: 'manual',
        status: 'completed',
        paymentMethod: 'system',
        createdAt: new Date()
      }] : []
    })
    await wallet.save()
  }
  return wallet
};

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

    // Grant 500 coins to advertiser on first verification
    let walletCoins = 0
    if (user.userType === 'advertiser') {
      const existingWallet = await Wallet.findOne({ userId: user._id })
      const isNew = !existingWallet
      const wallet = await getOrCreateWallet(user._id, isNew)
      walletCoins = wallet.coins
    }

    // Generate token
    const accessToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
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
        isPhoneVerified: user.isPhoneVerified,
        coins: walletCoins
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

    // Grant 500 coins to advertiser on first verification (same as /verify)
    let walletCoins = 0;
    if (user.userType === 'advertiser') {
      const existingWallet = await Wallet.findOne({ userId: user._id });
      const isNew = !existingWallet;
      const wallet = await getOrCreateWallet(user._id, isNew);
      walletCoins = wallet.coins;
    }

    const accessToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
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
        isPhoneVerified: user.isPhoneVerified,
        coins: walletCoins
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

      return res.status(200).json({
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
      { expiresIn: '30d' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    // Fetch wallet balance to include in login response
    const wallet = user.userType === 'advertiser'
      ? await getOrCreateWallet(user._id, false)
      : await Wallet.findOne({ userId: user._id })
    const walletCoins = wallet?.coins || 0

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
        isPhoneVerified: user.isPhoneVerified,
        coins: walletCoins
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
    const { credential, userType: requestedUserType } = req.body;
    console.log(`🔐 Google auth request. Requested userType: ${requestedUserType || 'not specified'}`);

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

    let isNewAdvertiser = false;
    if (user) {
      // User exists - update Google info if needed
      if (!user.googleId) {
        // User registered with email, now linking Google account
        user.googleId = googleId;
        user.profilePicture = picture;
        user.isEmailVerified = true; // Google emails are verified
      }
      // Upgrade to advertiser if signing up from advertiser page and currently a regular user
      if (requestedUserType === 'advertiser' && user.userType !== 'advertiser') {
        user.userType = 'advertiser';
        isNewAdvertiser = true;
      }
      await user.save();

      // Grant 500 welcome coins if just upgraded to advertiser
      if (isNewAdvertiser) {
        const existingWallet = await Wallet.findOne({ userId: user._id });
        if (!existingWallet || existingWallet.coins === 0) {
          const wallet = existingWallet || new Wallet({ userId: user._id, coins: 0, totalCoinsEarned: 0 });
          wallet.coins += 500;
          wallet.totalCoinsEarned += 500;
          wallet.transactions.push({
            type: 'admin-add',
            coins: 500,
            description: 'Welcome bonus for new advertiser',
            reference: 'manual',
            status: 'completed',
            paymentMethod: 'system',
            createdAt: new Date()
          });
          await wallet.save();
        }
      }
    } else {
      // Create new user with Google
      // Use advertiser type if signing up from advertiser page
      const finalUserType = (requestedUserType === 'advertiser') ? 'advertiser' : 'user';
      user = new User({
        email: email.toLowerCase(),
        googleId,
        authProvider: 'google',
        displayName: name,
        profilePicture: picture,
        isEmailVerified: true, // Google emails are verified
        isVerified: true,
        userType: finalUserType
      });
      await user.save();

      // Grant 500 coins if registering as advertiser
      if (finalUserType === 'advertiser') {
        const wallet = new Wallet({
          userId: user._id,
          coins: 500,
          totalCoinsEarned: 500,
          transactions: [{
            type: 'admin-add',
            coins: 500,
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
      { expiresIn: '30d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Fetch wallet coins for response — grant bonus if new advertiser
    const wallet = await getOrCreateWallet(user._id, isNewAdvertiser || (user.userType === 'advertiser'))
    const walletCoins = wallet?.coins || 0
    console.log(`  ✅ Google auth complete: ${user.email}, type: ${user.userType}, coins: ${walletCoins}, isNewAdvertiser: ${isNewAdvertiser}`);

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
        isEmailVerified: user.isEmailVerified,
        coins: walletCoins
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
// REFRESH TOKEN
// ==========================================
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token — include role if user is admin
    const tokenPayload = { userId: user._id };
    if (user.role === 'admin') {
      tokenPayload.email = user.email;
      tokenPayload.role = user.role;
    }
    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token: accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
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
      { expiresIn: '30d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_here',
      { expiresIn: '90d' }
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

// ==========================================
// PROFILE UPDATE
// ==========================================
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { displayName, businessName, phone, location, description } = req.body;

    if (displayName !== undefined) user.displayName = displayName;
    if (businessName !== undefined) user.businessName = businessName;
    if (location !== undefined) user.location = location;
    if (description !== undefined) user.description = description;

    // Only update phone if provided and not already taken
    if (phone && phone !== user.phone) {
      const cleanedPhone = phone.replace(/[\s\-\+]/g, '').replace(/^91/, '');
      const existingPhone = await User.findOne({ phone: cleanedPhone, _id: { $ne: user._id } });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone number already in use' });
      }
      user.phone = cleanedPhone;
    }

    await user.save();

    // Update localStorage-compatible response
    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;
    delete updatedUser.otp;
    delete updatedUser.otpExpires;
    delete updatedUser.refreshToken;

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and save new password
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Failed to change password', error: err.message });
  }
});

module.exports = router;


