const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const LocationAd = require('../models/LocationAd');
const User = require('../models/User');
const { isAdmin } = require('../middleware/auth');
const { CITIES } = require('../config/cities');

// Admin Dashboard
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const [totalAds, pendingAds, approvedAds, rejectedAds, totalUsers] = await Promise.all([
      Ad.countDocuments(),
      Ad.countDocuments({ status: 'pending' }),
      Ad.countDocuments({ status: 'approved' }),
      Ad.countDocuments({ status: 'rejected' }),
      User.countDocuments({ role: 'advertiser' })
    ]);

    const recentAds = await Ad.find()
      .populate('advertiser', 'name email company')
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: { totalAds, pendingAds, approvedAds, rejectedAds, totalUsers },
      recentAds
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
});

// Manage Ads
router.get('/ads', isAdmin, async (req, res) => {
  try {
    const statusFilter = req.query.status || '';
    const categoryFilter = req.query.category || '';
    const query = {};
    if (statusFilter) query.status = statusFilter;
    if (categoryFilter) query.category = categoryFilter;

    const ads = await Ad.find(query)
      .populate('advertiser', 'name email company')
      .sort({ createdAt: -1 });

    res.render('admin/ads', { title: 'Manage Ads', ads, statusFilter, categoryFilter });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading ads');
    res.redirect('/admin/dashboard');
  }
});

// Ad Detail
router.get('/ad/:id', isAdmin, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id).populate('advertiser', 'name email company phone');
    if (!ad) {
      req.flash('error', 'Ad not found');
      return res.redirect('/admin/ads');
    }
    res.render('admin/ad-detail', { title: 'Ad Detail', ad });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading ad');
    res.redirect('/admin/ads');
  }
});

// Approve Ad
router.post('/ad/:id/approve', isAdmin, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      req.flash('error', 'Ad not found');
      return res.redirect('/admin/ads');
    }
    ad.status = 'approved';
    ad.adminNotes = req.body.adminNotes || '';
    await ad.save();
    req.flash('success', 'Ad approved successfully');
    res.redirect('/admin/ads');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error approving ad');
    res.redirect('/admin/ads');
  }
});

// Reject Ad
router.post('/ad/:id/reject', isAdmin, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      req.flash('error', 'Ad not found');
      return res.redirect('/admin/ads');
    }
    ad.status = 'rejected';
    ad.adminNotes = req.body.adminNotes || '';
    await ad.save();
    req.flash('success', 'Ad rejected');
    res.redirect('/admin/ads');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error rejecting ad');
    res.redirect('/admin/ads');
  }
});

// Manage Users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'advertiser' }).sort({ createdAt: -1 });
    // Get ad counts per user
    const userIds = users.map(u => u._id);
    const adCounts = await Ad.aggregate([
      { $match: { advertiser: { $in: userIds } } },
      { $group: { _id: '$advertiser', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    adCounts.forEach(a => { countMap[a._id.toString()] = a.count; });
    const usersWithCounts = users.map(u => ({
      ...u.toObject(),
      adCount: countMap[u._id.toString()] || 0
    }));
    res.render('admin/users', { title: 'Manage Users', users: usersWithCounts });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading users');
    res.redirect('/admin/dashboard');
  }
});

// Toggle user active status
router.post('/user/:id/toggle', isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    user.isActive = !user.isActive;
    await user.save();
    req.flash('success', `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating user');
    res.redirect('/admin/users');
  }
});

// ─────────────────────────────────────────────────
// Location Ads Management
// ─────────────────────────────────────────────────

// List Location Ads
router.get('/location-ads', isAdmin, async (req, res) => {
  try {
    const locationAds = await LocationAd.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.render('admin/location-ads', { 
      title: 'Location Ads', 
      locationAds,
      cities: CITIES
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading location ads');
    res.redirect('/admin/dashboard');
  }
});

// Create Location Ad Form
router.get('/location-ads/create', isAdmin, (req, res) => {
  res.render('admin/location-ad-form', { 
    title: 'Create Location Ad',
    locationAd: null,
    cities: CITIES
  });
});

// Create Location Ad
router.post('/location-ads', isAdmin, async (req, res) => {
  try {
    const { title, description, image, link, targetCities, position, startDate, endDate } = req.body;
    
    if (!title || !image || !link || !startDate || !endDate) {
      req.flash('error', 'Please fill all required fields');
      return res.redirect('/admin/location-ads/create');
    }

    const newAd = new LocationAd({
      title,
      description,
      image,
      link,
      targetCities: targetCities || [],
      position: position || 1,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      createdBy: req.session.user._id,
      isActive: true
    });

    await newAd.save();
    req.flash('success', 'Location ad created successfully');
    res.redirect('/admin/location-ads');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error creating location ad');
    res.redirect('/admin/location-ads/create');
  }
});

// Edit Location Ad Form
router.get('/location-ads/:id/edit', isAdmin, async (req, res) => {
  try {
    const locationAd = await LocationAd.findById(req.params.id);
    if (!locationAd) {
      req.flash('error', 'Location ad not found');
      return res.redirect('/admin/location-ads');
    }

    res.render('admin/location-ad-form', { 
      title: 'Edit Location Ad',
      locationAd,
      cities: CITIES
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading location ad');
    res.redirect('/admin/location-ads');
  }
});

// Update Location Ad
router.post('/location-ads/:id', isAdmin, async (req, res) => {
  try {
    const { title, description, image, link, targetCities, position, startDate, endDate, isActive } = req.body;
    
    const locationAd = await LocationAd.findById(req.params.id);
    if (!locationAd) {
      req.flash('error', 'Location ad not found');
      return res.redirect('/admin/location-ads');
    }

    locationAd.title = title;
    locationAd.description = description;
    locationAd.image = image;
    locationAd.link = link;
    locationAd.targetCities = targetCities || [];
    locationAd.position = position || 1;
    locationAd.startDate = new Date(startDate);
    locationAd.endDate = new Date(endDate);
    locationAd.isActive = isActive === 'on' || isActive === true;

    await locationAd.save();
    req.flash('success', 'Location ad updated successfully');
    res.redirect('/admin/location-ads');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating location ad');
    res.redirect('/admin/location-ads');
  }
});

// Delete Location Ad
router.post('/location-ads/:id/delete', isAdmin, async (req, res) => {
  try {
    const locationAd = await LocationAd.findById(req.params.id);
    if (!locationAd) {
      req.flash('error', 'Location ad not found');
      return res.redirect('/admin/location-ads');
    }

    await LocationAd.findByIdAndDelete(req.params.id);
    req.flash('success', 'Location ad deleted successfully');
    res.redirect('/admin/location-ads');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error deleting location ad');
    res.redirect('/admin/location-ads');
  }
});

module.exports = router;
