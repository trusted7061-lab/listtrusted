const mongoose = require('mongoose');

const locationAdSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  targetCities: {
    type: [String], // Array of city slugs like ['delhi', 'mumbai', 'bangalore']
    required: true,
    default: [] // Empty array means show on all cities
  },
  targetAreas: {
    type: [String], // Array of area slugs
    default: []
  },
  isPinned: {
    type: Boolean,
    default: false // If true, this ad appears at the top
  },
  position: {
    type: Number,
    default: 1 // 1 or 2 for which slot (2 ads per page)
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('LocationAd', locationAdSchema);
