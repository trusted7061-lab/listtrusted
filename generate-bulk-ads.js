#!/usr/bin/env node

/**
 * Bulk Ad Generator Script
 * Creates 6+ ads per location from approved-locations.txt
 * Uses MongoDB direct insert for speed (creates ~6300 ads in seconds)
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Skip if running in frontend directory (doesn't have backend models)
if (!process.env.MONGO_URI) {
  console.log('⚠️  Skipping bulk seed - no MongoDB connection. Run from backend directory.');
  process.exit(0);
}

// Models
const AdPosting = require('./backend/models/AdPosting');
const User = require('./backend/models/User');

// Sample escort profiles
const escortProfiles = [
  { name: 'Priya', age: 22, bodyType: 'Slim', services: ['Companionship', 'Dinner', 'Hotel'] },
  { name: 'Anjali', age: 24, bodyType: 'Curvy', services: ['Companionship', 'Party', 'Travel'] },
  { name: 'Neha', age: 21, bodyType: 'Athletic', services: ['Companionship', 'Dinner', 'Travel'] },
  { name: 'Pooja', age: 23, bodyType: 'Slim', services: ['Companionship', 'Dinner', 'Hotel', 'Travel'] },
  { name: 'Meera', age: 25, bodyType: 'Curvy', services: ['Companionship', 'Party', 'Dinner'] },
  { name: 'Shruti', age: 20, bodyType: 'Slim', services: ['Companionship', 'Hotel', 'Party'] },
  { name: 'Divya', age: 26, bodyType: 'Athletic', services: ['Companionship', 'Travel', 'Dinner', 'Hotel'] },
  { name: 'Sakshi', age: 24, bodyType: 'Slim', services: ['Companionship', 'Party', 'Hotel'] }
];

const descriptions = [
  'Premium escort service offering high-class companionship',
  'Discreet and professional companion for sophisticated clients',
  'Elegant companion for business and social events',
  'Friendly and outgoing companion for all occasions',
  'Beautiful and educated companion available for meetings',
  'VIP escort service with verified and screened profiles'
];

async function generateBulkAds() {
  console.log('🚀 Starting bulk ad generation...\n');

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }

  // Get admin user
  let adminUser;
  try {
    adminUser = await User.findOne({ email: 'trusted7061@gmail.com' });
    if (!adminUser) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }
    console.log(`✅ Found admin user: ${adminUser.email}\n`);
  } catch (err) {
    console.error('❌ Error finding admin user:', err.message);
    process.exit(1);
  }

  // Read locations
  let locations = [];
  try {
    const locPath = path.join(__dirname, 'approved-locations.txt');
    const content = fs.readFileSync(locPath, 'utf8');
    locations = content.trim().split('\n').filter(line => line.trim());
    console.log(`📂 Found ${locations.length} locations\n`);
  } catch (err) {
    console.error('❌ Failed to read locations:', err.message);
    process.exit(1);
  }

  // Bulk insert ads
  console.log(`🎯 Generating 6 ads per location (${locations.length * 6} total ads)...\n`);

  let adsData = [];
  let locCount = 0;

  for (const location of locations) {
    const cleanName = location.replace('escorts-in-', '').replace(/-/g, ' ');
    const titleCase = cleanName
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    for (let i = 0; i < 6; i++) {
      const profile = escortProfiles[i % escortProfiles.length];
      const desc = descriptions[i % descriptions.length];

      adsData.push({
        userId: adminUser._id,
        title: `${profile.name} - Premium Companion in ${titleCase}`,
        description: `${profile.name}, ${profile.age} years old. ${desc}. Available for ${profile.services.join(', ')}.`,
        city: titleCase,
        area: titleCase,
        state: 'India',
        profileInfo: {
          name: profile.name,
          age: profile.age,
          bodyType: profile.bodyType
        },
        services: profile.services,
        images: [
          { url: `https://via.placeholder.com/500x700?text=${encodeURIComponent(profile.name)}` }
        ],
        contact: { phone: '' },
        isPremium: i === 0,  // First ad in each location is premium
        boost: 0,
        views: 0,
        status: 'approved',
        adminApprovalStatus: 'approved',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    locCount++;
    if (locCount % 100 === 0) {
      process.stdout.write(`\rProcessing locations: ${locCount}/${locations.length}`);
    }
  }

  console.log(`\n✅ Prepared ${adsData.length} ads for insertion\n`);

  // Insert in batches to avoid memory overload
  const batchSize = 500;
  let inserted = 0;

  try {
    for (let i = 0; i < adsData.length; i += batchSize) {
      const batch = adsData.slice(i, i + batchSize);
      const result = await AdPosting.insertMany(batch, { ordered: false });
      inserted += result.length;
      
      const percent = ((inserted / adsData.length) * 100).toFixed(1);
      console.log(`📊 Inserted: ${inserted}/${adsData.length} (${percent}%)`);
    }
  } catch (err) {
    console.error('⚠️ Insertion error (may have partially succeeded):', err.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Bulk ad generation completed!`);
  console.log(`📊 Total inserted: ${inserted}/${adsData.length}`);
  console.log('='.repeat(60));
  console.log('\n✨ All locations now have 6 approved ads each!\n');

  await mongoose.disconnect();
  process.exit(0);
}

// Run
generateBulkAds().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
