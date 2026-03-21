require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// ── Models ────────────────────────────────────────────────────────────────────
const User = require('./models/User');
const Ad   = require('./models/Ad');

// ── Cities ────────────────────────────────────────────────────────────────────
const { CITIES } = require('./config/cities');

// ── Admin email ───────────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'trusted7061@gmail.com';
const ADMIN_PASS  = 'Trusted@7061';

// ── Get all available uploaded images ────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'public', 'uploads');
const allImages  = fs.readdirSync(uploadsDir)
  .filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'))
  .map(f => '/uploads/' + f);

// Helper: pick city-specific image or fall back to any area image for that city
function imagesForCity(citySlug) {
  // Exact city match: escorts-in-{slug}.webp
  const exact = allImages.find(f => f.includes(`escorts-in-${citySlug}.webp`));

  // Area images that contain the city slug as prefix (e.g. escorts-in-andheri for mumbai)
  // Just pick 5 varied images from the pool ensuring variety
  const cityPool = allImages.filter(f => !f.includes('.gitkeep'));

  // Build a deterministic set of 5 images for this city
  const set = [];
  if (exact) set.push(exact);

  // Fill up to 5 with images spread evenly across the full pool
  const step = Math.floor(cityPool.length / 6);
  const cityIndex = CITIES.findIndex(c => c.slug === citySlug);
  for (let i = 0; set.length < 5; i++) {
    const idx = (cityIndex * 7 + i * step + i * 3) % cityPool.length;
    const img = cityPool[Math.abs(idx)];
    if (img && !set.includes(img)) set.push(img);
    if (i > 1000) break; // safety
  }
  return set.slice(0, 5);
}

// ── Ad templates (5 variants, uses city name) ─────────────────────────────────
const adTemplates = (cityName, citySlug) => [
  {
    title:         `Premium Escort Service in ${cityName}`,
    description:   `Welcome to the most trusted premium escort service in ${cityName}. Our verified companions are available for social events, dinner dates, travel companionship and more. Discreet, professional and always punctual. Serving all major areas of ${cityName}. Call or WhatsApp now for availability.`,
    category:      'Banner',
    targetAudience:'Adults 21+',
    phoneNumber:   `98765${43000 + CITIES.findIndex(c=>c.slug===citySlug)}`,
    whatsappNumber:`98765${43000 + CITIES.findIndex(c=>c.slug===citySlug)}`,
    showPhoneNumber: true, showWhatsappNumber: true,
    budget: 5000, landingUrl: ''
  },
  {
    title:         `Verified Escort Companion in ${cityName}`,
    description:   `Fully verified and admin-approved escort companion available in ${cityName}. 100% genuine profile with real photos. Available for hotel visits, home visits and outstation trips. Safe, discreet and professional service. All areas of ${cityName} covered. Contact directly.`,
    category:      'Native',
    targetAudience:'Adults 21+',
    phoneNumber:   `87654${32000 + CITIES.findIndex(c=>c.slug===citySlug)}`,
    whatsappNumber:`87654${32000 + CITIES.findIndex(c=>c.slug===citySlug)}`,
    showPhoneNumber: true, showWhatsappNumber: true,
    budget: 3000, landingUrl: ''
  },
  {
    title:         `Elite Escort Model in ${cityName}`,
    description:   `Elite model offering premium escort services in ${cityName}. Educated, well-groomed and fluent in English and Hindi. Ideal companion for corporate events, parties, and private meetings. Available 24/7 in ${cityName}. Advance booking preferred. Genuine profile verified by admin.`,
    category:      'Social Media',
    targetAudience:'Adults 25+',
    phoneNumber:   `77654${21000 + CITIES.findIndex(c=>c.slug===citySlug)}`,
    whatsappNumber:`77654${21000 + CITIES.findIndex(c=>c.slug===citySlug)}`,
    showPhoneNumber: true, showWhatsappNumber: true,
    budget: 8000, landingUrl: ''
  },
  {
    title:         `Independent Escort in ${cityName} — Real Photos`,
    description:   `Independent escort service provider in ${cityName} with 100% real and verified photos. No agency fees, contact directly. Available for short and long meetings, hotel visits, and travel companionship across ${cityName}. Professional, punctual and discreet. WhatsApp for quick response.`,
    category:      'Native',
    targetAudience:'Adults 21+',
    phoneNumber:   `91234${56000 + CITIES.findIndex(c=>c.slug===citySlug)}`,
    whatsappNumber:`91234${56000 + CITIES.findIndex(c=>c.slug===citySlug)}`,
    showPhoneNumber: false, showWhatsappNumber: true,
    budget: 2500, landingUrl: ''
  },
  {
    title:         `VIP Escort Service ${cityName} — 24/7 Available`,
    description:   `VIP escort service available 24 hours a day in ${cityName}. Luxury companions for high-profile clients. Perfect for business meetings, airport pickup, hotel companionship and private gatherings. Verified by Trusted Escort India admin team. All areas in ${cityName} covered. Booking by WhatsApp only.`,
    category:      'Search',
    targetAudience:'Adults 21+ High Income',
    phoneNumber:   `99876${54000 + CITIES.findIndex(c=>c.slug===citySlug)}`,
    whatsappNumber:`99876${54000 + CITIES.findIndex(c=>c.slug===citySlug)}`,
    showPhoneNumber: false, showWhatsappNumber: true,
    budget: 10000, landingUrl: ''
  }
];

// ── Connect (Atlas → in-memory fallback) ──────────────────────────────────────
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('Connected to MongoDB Atlas.\n');
  } catch (e) {
    console.log('Atlas unreachable, falling back to in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
    console.log('Connected to in-memory MongoDB.\n');
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Connecting to MongoDB...');
  await connectDB();

  // ── Find or create admin user ──────────────────────────────────────────────
  let adminUser = await User.findOne({ email: ADMIN_EMAIL });
  if (!adminUser) {
    console.log(`Creating admin user: ${ADMIN_EMAIL}`);
    adminUser = await User.create({
      name:     'Trusted Escort Admin',
      email:    ADMIN_EMAIL,
      password: ADMIN_PASS,     // will be hashed by pre-save hook
      role:     'admin',
      phone:    '9999900000',
      company:  'Trusted Escort India',
      isActive: true
    });
    console.log(`Admin user created with ID: ${adminUser._id}\n`);
  } else {
    console.log(`Found existing admin user: ${ADMIN_EMAIL} (ID: ${adminUser._id})\n`);
  }

  const adminId = adminUser._id;
  const startDate = new Date('2026-01-01');
  const endDate   = new Date('2027-12-31');

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const city of CITIES) {
    // Check how many approved ads already exist for this city from admin
    const existing = await Ad.countDocuments({
      advertiser: adminId,
      citySlug: city.slug,
      status: 'approved'
    });

    const needed = Math.max(0, 5 - existing);
    if (needed === 0) {
      console.log(`✓ ${city.name}: already has ${existing} admin ads — skipping`);
      totalSkipped += 5;
      continue;
    }

    const cityImages = imagesForCity(city.slug);
    const templates  = adTemplates(city.name, city.slug);

    const adsToCreate = [];
    for (let i = 0; i < needed; i++) {
      // Pick from the templates we haven't created yet
      const templateIndex = existing + i; // continue from where we left off
      const tpl = templates[templateIndex % templates.length];
      const img = cityImages[templateIndex % cityImages.length];

      adsToCreate.push({
        title:             tpl.title,
        description:       tpl.description,
        category:          tpl.category,
        targetAudience:    tpl.targetAudience,
        image:             img,
        startDate,
        endDate,
        budget:            tpl.budget,
        landingUrl:        tpl.landingUrl,
        phoneNumber:       tpl.phoneNumber,
        whatsappNumber:    tpl.whatsappNumber,
        showPhoneNumber:   tpl.showPhoneNumber,
        showWhatsappNumber:tpl.showWhatsappNumber,
        city:              city.name,
        citySlug:          city.slug,
        status:            'approved',
        adminNotes:        'Created by admin seed script',
        advertiser:        adminId
      });
    }

    await Ad.insertMany(adsToCreate);
    console.log(`✓ ${city.name}: created ${needed} ads (had ${existing})`);
    totalCreated += needed;
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`  Done! Created ${totalCreated} new ads`);
  console.log(`  Skipped ${totalSkipped} (already existed)`);
  console.log(`  Total cities: ${CITIES.length}`);
  console.log(`═══════════════════════════════════════`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
