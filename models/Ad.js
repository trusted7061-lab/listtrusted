const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Banner', 'Video', 'Popup', 'Native', 'Social Media', 'Search', 'Email']
  },
  targetAudience: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    default: 0
  },
  landingUrl: {
    type: String,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: ''
  },
  whatsappNumber: {
    type: String,
    trim: true,
    default: ''
  },
  showPhoneNumber: {
    type: Boolean,
    default: false
  },
  showWhatsappNumber: {
    type: Boolean,
    default: false
  },
  city: {
    type: String,
    trim: true,
    default: ''
  },
  citySlug: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  advertiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
