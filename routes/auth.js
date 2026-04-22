const express = require('express');
const router = express.Router();
const User = require('../models/User');
const connectDB = require('../config/db');

router.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect(req.session.role === 'admin' ? '/admin/dashboard' : '/advertiser/dashboard');
  }

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://trustedescort.in/auth/login#webpage',
    'url': 'https://trustedescort.in/auth/login',
    'name': 'Login — Trusted Escort India',
    'description': 'Log in to your Trusted Escort India account.'
  });

  res.render('auth/login', {
    title: 'Login | Trusted Escort India',
    metaDescription: 'Log in to your Trusted Escort India account.',
    canonical: 'https://trustedescort.in/auth/login',
    noindex: true,
    schema
  });
});

router.post('/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }

    if (!user.isActive) {
      req.flash('error', 'Your account has been deactivated');
      return res.redirect('/auth/login');
    }

    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.role = user.role;

    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      req.flash('success', `Welcome back, ${user.name}!`);
      res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/advertiser/dashboard');
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong');
    res.redirect('/auth/login');
  }
});

router.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect(req.session.role === 'admin' ? '/admin/dashboard' : '/advertiser/dashboard');
  }

  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://trustedescort.in/auth/register#webpage',
    'url': 'https://trustedescort.in/auth/register',
    'name': 'Register — Post a Free Ad',
    'description': 'Create a free advertiser account on Trusted Escort India and post your escort service listing today.'
  });

  res.render('auth/register', {
    title: 'Register | Post a Free Ad | Trusted Escort India',
    metaDescription: 'Create a free advertiser account on Trusted Escort India and post your escort service listing today.',
    canonical: 'https://trustedescort.in/auth/register',
    noindex: true,
    schema
  });
});

router.post('/register', async (req, res) => {
  try {
    await connectDB();
    const { name, email, password, confirmPassword, company, phone } = req.body;

    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/auth/register');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters');
      return res.redirect('/auth/register');
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      req.flash('error', 'Email is already registered');
      return res.redirect('/auth/register');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'advertiser',
      company: company ? company.trim() : '',
      phone: phone ? phone.trim() : ''
    });

    req.session.userId = user._id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;
    req.session.role = user.role;

    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      req.flash('success', 'Registration successful! Welcome to TrustedAds.');
      res.redirect('/advertiser/dashboard');
    });
  } catch (err) {
    console.error('Register error:', err.message);
    const isDBError = err.message && (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED') || err.message.includes('timed out') || err.message.includes('not set'));
    const msg = err.message && err.message.includes('E11000')
      ? 'Email is already registered'
      : isDBError
        ? 'Database connection failed. Please try again in a moment.'
        : `Registration failed: ${err.message}`;
    req.flash('error', msg);
    res.redirect('/auth/register');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

module.exports = router;
