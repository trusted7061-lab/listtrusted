/**
 * Seed: create minimum 5 approved ads per city from the admin account.
 * Safe to call on every startup — skips cities that already have 5+ admin ads.
 */
const path = require('path');
const fs   = require('fs');
const User = require('../models/User');
const Ad   = require('../models/Ad');
const { CITIES } = require('../config/cities');

const ADMIN_EMAIL = 'trusted7061@gmail.com';
const ADMIN_PASS  = 'Trusted@7061';

// ── collect available images ───────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
const allImages = fs.readdirSync(uploadsDir)
  .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f) && f !== '.gitkeep')
  .map(f => '/uploads/' + f);

function imagesForCity(citySlug, cityIndex) {
  const exact = allImages.find(f => f === `/uploads/escorts-in-${citySlug}.webp`);
  const pool  = allImages;
  const set   = [];
  if (exact) set.push(exact);
  const step = Math.max(1, Math.floor(pool.length / 6));
  for (let i = 0; set.length < 5 && i < pool.length * 2; i++) {
    const img = pool[Math.abs((cityIndex * 7 + i * step + i * 3) % pool.length)];
    if (img && !set.includes(img)) set.push(img);
  }
  return set.slice(0, 5);
}

// ── 5 ad templates per city ────────────────────────────────────────────────────
function templates(cityName, cityIndex) {
  const base = 9000000000 + cityIndex * 10;
  return [
    {
      title:         `Premium Escort Service in ${cityName}`,
      description:   `Welcome to the most trusted premium escort service in ${cityName}. Our verified companions are available for social events, dinner dates, travel companionship and more. Discreet, professional and always punctual. Serving all major areas of ${cityName}. Call or WhatsApp now for availability.`,
      category:      'Banner',
      targetAudience:'Adults 21+',
      phone: String(base + 1), wp: String(base + 1),
      showPhone: true, showWp: true, budget: 5000
    },
    {
      title:         `Verified Escort Companion in ${cityName}`,
      description:   `Fully verified and admin-approved escort companion available in ${cityName}. 100% genuine profile with real photos. Available for hotel visits, home visits and outstation trips. Safe, discreet and professional service. All areas of ${cityName} covered. Contact directly.`,
      category:      'Native',
      targetAudience:'Adults 21+',
      phone: String(base + 2), wp: String(base + 2),
      showPhone: true, showWp: true, budget: 3000
    },
    {
      title:         `Elite Escort Model in ${cityName}`,
      description:   `Elite model offering premium escort services in ${cityName}. Educated, well-groomed and fluent in English and Hindi. Ideal companion for corporate events, parties and private meetings. Available 24/7 in ${cityName}. Advance booking preferred. Genuine profile verified by admin.`,
      category:      'Social Media',
      targetAudience:'Adults 25+',
      phone: String(base + 3), wp: String(base + 3),
      showPhone: true, showWp: true, budget: 8000
    },
    {
      title:         `Independent Escort in ${cityName} — Real Photos`,
      description:   `Independent escort service provider in ${cityName} with 100% real and verified photos. No agency fees — contact directly. Available for short and long meetings, hotel visits and travel companionship across ${cityName}. Professional, punctual and discreet. WhatsApp for quick response.`,
      category:      'Native',
      targetAudience:'Adults 21+',
      phone: String(base + 4), wp: String(base + 4),
      showPhone: false, showWp: true, budget: 2500
    },
    {
      title:         `VIP Escort Service ${cityName} — 24/7 Available`,
      description:   `VIP escort service available 24 hours a day in ${cityName}. Luxury companions for high-profile clients. Perfect for business meetings, airport pickup, hotel companionship and private gatherings. Verified by Trusted Escort India admin team. All areas in ${cityName} covered. Booking by WhatsApp only.`,
      category:      'Search',
      targetAudience:'Adults 21+ High Income',
      phone: String(base + 5), wp: String(base + 5),
      showPhone: false, showWp: true, budget: 10000
    }
  ];
}

// ── main export ────────────────────────────────────────────────────────────────
async function seedCityAds() {
  try {
    // Find or create the advertiser/admin user
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });
    if (!adminUser) {
      adminUser = await User.create({
        name:     'Trusted Escort Admin',
        email:    ADMIN_EMAIL,
        password: ADMIN_PASS,
        role:     'admin',
        phone:    '9999900000',
        company:  'Trusted Escort India',
        isActive: true
      });
      console.log(`[seed] Created admin user: ${ADMIN_EMAIL}`);
    }

    const adminId   = adminUser._id;
    const startDate = new Date('2026-01-01');
    const endDate   = new Date('2027-12-31');
    let created     = 0;

    for (let ci = 0; ci < CITIES.length; ci++) {
      const city = CITIES[ci];

      const existing = await Ad.countDocuments({
        advertiser: adminId,
        citySlug:   city.slug,
        status:     'approved'
      });

      const needed = Math.max(0, 5 - existing);
      if (needed === 0) continue;

      const cityImgs = imagesForCity(city.slug, ci);
      const tmpls    = templates(city.name, ci);
      const docs     = [];

      for (let i = 0; i < needed; i++) {
        const idx = (existing + i) % 5;
        const t   = tmpls[idx];
        const img = cityImgs[idx % cityImgs.length];

        docs.push({
          title:              t.title,
          description:        t.description,
          category:           t.category,
          targetAudience:     t.targetAudience,
          image:              img,
          startDate,
          endDate,
          budget:             t.budget,
          landingUrl:         '',
          phoneNumber:        t.phone,
          whatsappNumber:     t.wp,
          showPhoneNumber:    t.showPhone,
          showWhatsappNumber: t.showWp,
          city:               city.name,
          citySlug:           city.slug,
          status:             'approved',
          adminNotes:         'Auto-seeded by admin',
          advertiser:         adminId
        });
      }

      await Ad.insertMany(docs);
      created += docs.length;
    }

    if (created > 0) {
      console.log(`[seed] Created ${created} admin ads across ${CITIES.length} cities`);
    } else {
      console.log(`[seed] All cities already have 5+ admin ads — nothing to seed`);
    }
  } catch (err) {
    console.error('[seed] City ads seed error:', err.message);
  }
}

module.exports = seedCityAds;
