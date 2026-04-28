const express = require('express');
const router = express.Router();
const { CITIES } = require('../config/cities');
const { AREAS } = require('../config/areas');
const Ad = require('../models/Ad');

const BASE = 'https://listtrusted.vercel.app';

function escXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Ensure image URL is always absolute
function absUrl(url) {
  if (!url) return `${BASE}/logo.png`;
  // Already absolute (http:// or https://)
  if (/^https?:\/\//i.test(url)) return url;
  // Relative path — prepend domain
  return `${BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

// Build a <url> block with optional <image:image> children
function urlBlock({ loc, priority = '0.8', changefreq = 'weekly', lastmod = null, images = [] }) {
  const today = lastmod || new Date().toISOString().split('T')[0];
  const imageXml = images.map(img => `    <image:image>
      <image:loc>${escXml(img.loc)}</image:loc>
      <image:title>${escXml(img.title)}</image:title>
      <image:caption>${escXml(img.caption)}</image:caption>
    </image:image>`).join('\n');
  return `  <url>
    <loc>${escXml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${imageXml ? imageXml + '\n' : ''}  </url>`;
}

// ─── Sitemap Index ────────────────────────────────────────────────────────────
router.get('/sitemap-index.xml', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE}/sitemap-profiles.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE}/sitemap-images.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  res.header('Content-Type', 'application/xml; charset=UTF-8');
  res.header('Cache-Control', 'public, max-age=86400, immutable');
  res.send(xml);
});

// ─── Main Sitemap (pages only, no profiles) ───────────────────────────────────
router.get('/sitemap.xml', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const blocks = [];

  // Homepage
  blocks.push(urlBlock({ loc: `${BASE}/`, priority: '1.0', changefreq: 'daily', lastmod: today,
    images: [{ loc: `${BASE}/logo.png`, title: 'Trusted Escort India', caption: 'India\'s most trusted escort service directory' }]
  }));

  // Escorts service index
  blocks.push(urlBlock({ loc: `${BASE}/escorts-service/`, priority: '0.9', changefreq: 'daily', lastmod: today }));

  // All city pages with OG image
  CITIES.forEach(city => {
    blocks.push(urlBlock({
      loc: `${BASE}/escorts-service/${city.slug}/`,
      priority: city.metro ? '0.8' : '0.7',
      changefreq: 'daily',
      lastmod: today,
      images: [{
        loc: `${BASE}/logo.png`,
        title: `Escort Service in ${city.name}, ${city.state}`,
        caption: `Verified escort service listings in ${city.name}. Admin-approved profiles — safe, discreet, 24/7.`
      }]
    }));
  });

  // All area pages — each shows only ads specifically targeting that area (unique content)
  Object.keys(AREAS).forEach(citySlug => {
    const city = CITIES.find(c => c.slug === citySlug);
    (AREAS[citySlug] || []).forEach(area => {
      blocks.push(urlBlock({
        loc: `${BASE}/escorts-service/${citySlug}/${area.slug}/`,
        priority: '0.6',
        changefreq: 'weekly',
        lastmod: today,
        images: [{
          loc: `${BASE}/logo.png`,
          title: `Escort Service in ${area.name}, ${city ? city.name : citySlug}`,
          caption: `Find verified escort service in ${area.name}. Admin-approved profiles only.`
        }]
      }));
    });
  });

  // Static pages
  [
    { path: '/about',            p: '0.5', freq: 'monthly' },
    { path: '/contact',          p: '0.5', freq: 'monthly' },
    { path: '/privacy-policy',   p: '0.4', freq: 'monthly' },
    { path: '/terms',            p: '0.4', freq: 'monthly' },
    { path: '/help-center',      p: '0.5', freq: 'monthly' },
  ].forEach(({ path, p, freq }) => {
    blocks.push(urlBlock({ loc: `${BASE}${path}`, priority: p, changefreq: freq, lastmod: today }));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${blocks.join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml; charset=UTF-8');
  res.header('Cache-Control', 'public, max-age=86400, immutable');
  res.clearCookie('connect.sid');
  res.send(xml);
});

// ─── Profiles Sitemap ─────────────────────────────────────────────────────────
router.get('/sitemap-profiles.xml', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const blocks = [];

  try {
    const ads = await Ad.find({ status: 'approved' }, '_id title city image updatedAt').lean();
    ads.forEach(ad => {
      const lastmod = ad.updatedAt ? ad.updatedAt.toISOString().split('T')[0] : today;
      const imgBlocks = [];
      if (ad.image) {
        imgBlocks.push({
          loc: absUrl(ad.image),
          title: escXml(`${ad.title || 'Escort Service'} — ${ad.city || 'India'}`),
          caption: escXml(`Verified escort service listing in ${ad.city || 'India'}. Admin-approved profile on Trusted Escort India.`)
        });
      }
      blocks.push(urlBlock({
        loc: `${BASE}/escorts-service/profile/${ad._id}/`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod,
        images: imgBlocks
      }));
    });
  } catch (e) {
    // DB unavailable — return empty but valid sitemap
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${blocks.join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml; charset=UTF-8');
  res.header('Cache-Control', 'public, max-age=3600, immutable');
  res.send(xml);
});

// ─── Dedicated Image Sitemap ──────────────────────────────────────────────────
// Submitted separately to Google Image Search
router.get('/sitemap-images.xml', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const blocks = [];

  try {
    const ads = await Ad.find({ status: 'approved' }, '_id title city citySlug image updatedAt').lean();
    ads.forEach(ad => {
      if (!ad.image) return;
      const lastmod = ad.updatedAt ? ad.updatedAt.toISOString().split('T')[0] : today;
      blocks.push(`  <url>
    <loc>${escXml(`${BASE}/escorts-service/profile/${ad._id}/`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <image:image>
      <image:loc>${escXml(absUrl(ad.image))}</image:loc>
      <image:title>${escXml(`${ad.title || 'Escort Service'} — ${ad.city || 'India'}`)}</image:title>
      <image:caption>${escXml(`Verified escort service in ${ad.city || 'India'}. Admin-approved listing on Trusted Escort India.`)}</image:caption>
      <image:geo_location>${escXml(`${ad.city || 'India'}`)}</image:geo_location>
    </image:image>
  </url>`);
    });
  } catch (e) {
    // DB unavailable — return empty but valid sitemap
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${blocks.join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml; charset=UTF-8');
  res.header('Cache-Control', 'public, max-age=3600, immutable');
  res.send(xml);
});

module.exports = router;
