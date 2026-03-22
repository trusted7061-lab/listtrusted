const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const Ad = require('../models/Ad');
const { isAdvertiser } = require('../middleware/auth');
const { CITIES, CITY_BY_SLUG } = require('../config/cities');

// Upload a buffer to Cloudinary. Config is applied fresh on every call so
// env vars are always read at request time (safe on Vercel serverless).
async function uploadToCloudinary(buffer) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'trustedescort/ads', resource_type: 'auto', transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }] },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

const fileFilter = (req, file, cb) => {
  // Accept any image MIME type. Also allow octet-stream because iOS/macOS Safari
  // sends HEIC files with that MIME type instead of image/heic.
  const ok = file.mimetype.startsWith('image/') || file.mimetype === 'application/octet-stream';
  if (ok) return cb(null, true);
  cb(new Error('Only image files are allowed. Please choose a JPG, PNG, HEIC, WEBP or similar image file.'));
};

// Use memory storage — cloudinary upload is done manually in the route handlers
const upload = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

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
  res.render('advertiser/create-ad', { title: 'Create New Ad', cities: CITIES, formData: {}, uploadedImage: null, errorMsg: null });
});

// Create Ad - submit
function renderCreateAdForm(res, { formData = {}, uploadedImage = null, errorMsg = null } = {}) {
  return res.render('advertiser/create-ad', {
    title: 'Create New Ad',
    cities: CITIES,
    formData,
    uploadedImage,
    errorMsg
  });
}

router.post('/create-ad', isAdvertiser, (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      console.error('[upload error]', err);
      const msg = err.message
        || (err.error && err.error.message)
        || (typeof err === 'string' ? err : null)
        || 'File upload failed. Please try a JPG, PNG or WEBP image under 5 MB.';
      return renderCreateAdForm(res, { formData: req.body || {}, errorMsg: msg });
    }
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        req.file.path = result.secure_url;
        req.file.filename = result.public_id;
      } catch (cloudErr) {
        console.error('[cloudinary upload error]', cloudErr);
        const msg = (cloudErr.error && cloudErr.error.message) || cloudErr.message || 'Image upload failed. Please try again.';
        return renderCreateAdForm(res, { formData: req.body || {}, errorMsg: msg });
      }
    }
    next();
  });
}, async (req, res) => {
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

    // Accept new upload OR previously uploaded image (when form re-renders after validation error)
    const imageUrl = (req.file && req.file.path) || (req.body && req.body.existingImage) || null;

    if (!imageUrl) {
      return renderCreateAdForm(res, { formData: req.body, errorMsg: 'Ad image is required. Please choose an image file.' });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return renderCreateAdForm(res, { formData: req.body, uploadedImage: imageUrl, errorMsg: 'End date must be after start date.' });
    }

    if (!isValidContactNumber(phoneNumber)) {
      return renderCreateAdForm(res, { formData: req.body, uploadedImage: imageUrl, errorMsg: 'Please enter a valid phone number.' });
    }

    if (!isValidContactNumber(whatsappNumber)) {
      return renderCreateAdForm(res, { formData: req.body, uploadedImage: imageUrl, errorMsg: 'Please enter a valid WhatsApp number.' });
    }

    if (showPhoneNumber && !phoneNumber) {
      return renderCreateAdForm(res, { formData: req.body, uploadedImage: imageUrl, errorMsg: 'Add a phone number before enabling the public phone option.' });
    }

    if (showWhatsappNumber && !whatsappNumber) {
      return renderCreateAdForm(res, { formData: req.body, uploadedImage: imageUrl, errorMsg: 'Add a WhatsApp number before enabling the public WhatsApp option.' });
    }

    await Ad.create({
      title: title.trim(),
      description: description.trim(),
      category,
      targetAudience: targetAudience.trim(),
      image: imageUrl,
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
    renderCreateAdForm(res, {
      formData: req.body || {},
      uploadedImage: (req.file && req.file.path) || (req.body && req.body.existingImage) || null,
      errorMsg: 'An error occurred saving your ad. Please check all fields and try again.'
    });
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
router.post('/edit-ad/:id', isAdvertiser, (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      req.flash('error', err.message || 'File upload failed. Use JPG, PNG, GIF or WebP under 5MB.');
      return res.redirect('back');
    }
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        req.file.path = result.secure_url;
        req.file.filename = result.public_id;
      } catch (cloudErr) {
        console.error('[cloudinary upload error]', cloudErr);
        req.flash('error', (cloudErr.error && cloudErr.error.message) || cloudErr.message || 'Image upload failed. Please try again.');
        return res.redirect('back');
      }
    }
    next();
  });
}, async (req, res) => {
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
      // Delete old image from Cloudinary if it was a Cloudinary URL
      if (ad.image && ad.image.includes('cloudinary.com')) {
        const publicId = ad.image.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '');
        cloudinary.uploader.destroy(publicId).catch(() => {});
      }
      ad.image = req.file.path;
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
