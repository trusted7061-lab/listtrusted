const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Ad = require('../models/Ad');
const { isAdvertiser } = require('../middleware/auth');
const { CITIES, CITY_BY_SLUG } = require('../config/cities');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'public', 'uploads', 'ads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files (jpg, png, gif, webp) are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

function parseCheckbox(value) {
  return value === 'on' || value === 'true' || value === true;
}

function normalizeContactNumber(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidContactNumber(value) {
  return !value || /^[\d\s()+-]{7,20}$/.test(value);
}

// Dashboard
router.get('/dashboard', isAdvertiser, async (req, res) => {
  try {
    const ads = await Ad.find({ advertiser: req.session.userId }).sort({ createdAt: -1 });
    const stats = {
      total: ads.length,
      pending: ads.filter(a => a.status === 'pending').length,
      approved: ads.filter(a => a.status === 'approved').length,
      rejected: ads.filter(a => a.status === 'rejected').length
    };
    res.render('advertiser/dashboard', { title: 'Advertiser Dashboard', ads: ads.slice(0, 5), stats });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
});

// My Ads
router.get('/my-ads', isAdvertiser, async (req, res) => {
  try {
    const statusFilter = req.query.status || '';
    const query = { advertiser: req.session.userId };
    if (statusFilter) query.status = statusFilter;
    const ads = await Ad.find(query).sort({ createdAt: -1 });
    res.render('advertiser/my-ads', { title: 'My Ads', ads, statusFilter });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading ads');
    res.redirect('/advertiser/dashboard');
  }
});

// Create Ad - form
router.get('/create-ad', isAdvertiser, (req, res) => {
  res.render('advertiser/create-ad', { title: 'Create New Ad', cities: CITIES });
});

// Create Ad - submit
router.post('/create-ad', isAdvertiser, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      targetAudience,
      startDate,
      endDate,
      budget,
      phoneNumber: rawPhoneNumber,
      whatsappNumber: rawWhatsappNumber,
      showPhoneNumber: rawShowPhoneNumber,
      showWhatsappNumber: rawShowWhatsappNumber,
      citySlug: rawCitySlug,
      services: rawServices,
      aboutMe: rawAboutMe
    } = req.body;
    const phoneNumber = normalizeContactNumber(rawPhoneNumber);
    const whatsappNumber = normalizeContactNumber(rawWhatsappNumber);
    const showPhoneNumber = parseCheckbox(rawShowPhoneNumber);
    const showWhatsappNumber = parseCheckbox(rawShowWhatsappNumber);
    const cityObj = CITY_BY_SLUG[(rawCitySlug || '').trim()] || null;

    if (!req.file) {
      req.flash('error', 'Ad image is required');
      return res.redirect('/advertiser/create-ad');
    }

    if (new Date(endDate) <= new Date(startDate)) {
      req.flash('error', 'End date must be after start date');
      return res.redirect('/advertiser/create-ad');
    }

    if (!isValidContactNumber(phoneNumber)) {
      req.flash('error', 'Please enter a valid phone number');
      return res.redirect('/advertiser/create-ad');
    }

    if (!isValidContactNumber(whatsappNumber)) {
      req.flash('error', 'Please enter a valid WhatsApp number');
      return res.redirect('/advertiser/create-ad');
    }

    if (showPhoneNumber && !phoneNumber) {
      req.flash('error', 'Add a phone number before enabling the public phone option');
      return res.redirect('/advertiser/create-ad');
    }

    if (showWhatsappNumber && !whatsappNumber) {
      req.flash('error', 'Add a WhatsApp number before enabling the public WhatsApp option');
      return res.redirect('/advertiser/create-ad');
    }

    await Ad.create({
      title: title.trim(),
      description: description.trim(),
      category,
      targetAudience: targetAudience.trim(),
      image: '/uploads/ads/' + req.file.filename,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget: budget ? Number(budget) : 0,
      services: Array.isArray(rawServices) ? rawServices : (rawServices ? [rawServices] : []),
      aboutMe: {
        gender:      rawAboutMe?.gender || '',
        orientation: rawAboutMe?.orientation || '',
        ethnicity:   rawAboutMe?.ethnicity || '',
        height:      rawAboutMe?.height || '',
        age:         rawAboutMe?.age || '',
        bust:        rawAboutMe?.bust || '',
        hairColor:   rawAboutMe?.hairColor || '',
        nationality: rawAboutMe?.nationality || '',
        languages:   Array.isArray(rawAboutMe?.languages) ? rawAboutMe.languages : (rawAboutMe?.languages ? [rawAboutMe.languages] : []),
        shaved:      rawAboutMe?.shaved || '',
        smoke:       rawAboutMe?.smoke === '1'
      },
      phoneNumber,
      whatsappNumber,
      showPhoneNumber,
      showWhatsappNumber,
      city: cityObj ? cityObj.name : '',
      citySlug: cityObj ? cityObj.slug : '',
      advertiser: req.session.userId
    });

    req.flash('success', 'Ad submitted successfully! Awaiting admin approval.');
    res.redirect('/advertiser/my-ads');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error creating ad. Please check all fields.');
    res.redirect('/advertiser/create-ad');
  }
});

// Edit Ad - form
router.get('/edit-ad/:id', isAdvertiser, async (req, res) => {
  try {
    const ad = await Ad.findOne({ _id: req.params.id, advertiser: req.session.userId });
    if (!ad) {
      req.flash('error', 'Ad not found');
      return res.redirect('/advertiser/my-ads');
    }
    if (ad.status !== 'pending') {
      req.flash('error', 'Only pending ads can be edited');
      return res.redirect('/advertiser/my-ads');
    }
    res.render('advertiser/edit-ad', { title: 'Edit Ad', ad });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading ad');
    res.redirect('/advertiser/my-ads');
  }
});

// Edit Ad - submit
router.post('/edit-ad/:id', isAdvertiser, upload.single('image'), async (req, res) => {
  try {
    const ad = await Ad.findOne({ _id: req.params.id, advertiser: req.session.userId });
    if (!ad || ad.status !== 'pending') {
      req.flash('error', 'Cannot edit this ad');
      return res.redirect('/advertiser/my-ads');
    }

    const {
      title,
      description,
      category,
      targetAudience,
      startDate,
      endDate,
      budget,
      landingUrl,
      phoneNumber: rawPhoneNumber,
      whatsappNumber: rawWhatsappNumber,
      showPhoneNumber: rawShowPhoneNumber,
      showWhatsappNumber: rawShowWhatsappNumber
    } = req.body;
    const phoneNumber = normalizeContactNumber(rawPhoneNumber);
    const whatsappNumber = normalizeContactNumber(rawWhatsappNumber);
    const showPhoneNumber = parseCheckbox(rawShowPhoneNumber);
    const showWhatsappNumber = parseCheckbox(rawShowWhatsappNumber);

    if (new Date(endDate) <= new Date(startDate)) {
      req.flash('error', 'End date must be after start date');
      return res.redirect('/advertiser/edit-ad/' + ad._id);
    }

    if (!isValidContactNumber(phoneNumber)) {
      req.flash('error', 'Please enter a valid phone number');
      return res.redirect('/advertiser/edit-ad/' + ad._id);
    }

    if (!isValidContactNumber(whatsappNumber)) {
      req.flash('error', 'Please enter a valid WhatsApp number');
      return res.redirect('/advertiser/edit-ad/' + ad._id);
    }

    if (showPhoneNumber && !phoneNumber) {
      req.flash('error', 'Add a phone number before enabling the public phone option');
      return res.redirect('/advertiser/edit-ad/' + ad._id);
    }

    if (showWhatsappNumber && !whatsappNumber) {
      req.flash('error', 'Add a WhatsApp number before enabling the public WhatsApp option');
      return res.redirect('/advertiser/edit-ad/' + ad._id);
    }

    ad.title = title.trim();
    ad.description = description.trim();
    ad.category = category;
    ad.targetAudience = targetAudience.trim();
    ad.startDate = new Date(startDate);
    ad.endDate = new Date(endDate);
    ad.budget = budget ? Number(budget) : 0;
    ad.landingUrl = landingUrl ? landingUrl.trim() : '';
    ad.phoneNumber = phoneNumber;
    ad.whatsappNumber = whatsappNumber;
    ad.showPhoneNumber = showPhoneNumber;
    ad.showWhatsappNumber = showWhatsappNumber;

    if (req.file) {
      // Remove old image
      const oldPath = path.join(__dirname, '..', 'public', ad.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      ad.image = '/uploads/ads/' + req.file.filename;
    }

    await ad.save();
    req.flash('success', 'Ad updated successfully');
    res.redirect('/advertiser/my-ads');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating ad');
    res.redirect('/advertiser/my-ads');
  }
});

// Delete Ad
router.post('/delete-ad/:id', isAdvertiser, async (req, res) => {
  try {
    const ad = await Ad.findOne({ _id: req.params.id, advertiser: req.session.userId });
    if (!ad) {
      req.flash('error', 'Ad not found');
      return res.redirect('/advertiser/my-ads');
    }
    // Remove image file
    const imgPath = path.join(__dirname, '..', 'public', ad.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    await Ad.deleteOne({ _id: ad._id });
    req.flash('success', 'Ad deleted successfully');
    res.redirect('/advertiser/my-ads');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error deleting ad');
    res.redirect('/advertiser/my-ads');
  }
});

module.exports = router;
