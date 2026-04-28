const express = require('express');
const router = express.Router();
const { CITIES } = require('../config/cities');
const { AREAS } = require('../config/areas');
const Ad = require('../models/Ad');
const connectDB = require('../config/db');

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
  res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  res.end(xml);
});

// ─── Main Sitemap (pages only — no images, no profiles) ─────────────────────
router.get('/sitemap.xml', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const lines = [];

  const u = (loc, priority, changefreq) =>
    `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;

  lines.push(u(`${BASE}/`, '1.0', 'daily'));
  lines.push(u(`${BASE}/escorts-service/`, '0.9', 'daily'));

  CITIES.forEach(city => {
    lines.push(u(`${BASE}/escorts-service/${city.slug}/`, city.metro ? '0.8' : '0.7', 'daily'));
  });

  Object.keys(AREAS).forEach(citySlug => {
    (AREAS[citySlug] || []).forEach(area => {
      lines.push(u(`${BASE}/escorts-service/${citySlug}/${area.slug}/`, '0.6', 'weekly'));
    });
  });

  ['/about', '/contact', '/privacy-policy', '/terms', '/help-center'].forEach(path => {
    lines.push(u(`${BASE}${path}`, '0.5', 'monthly'));
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join('\n')}\n</urlset>`;

  res.header('Content-Type', 'application/xml; charset=UTF-8');
  res.header('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.end(xml);
});

// ─── Profiles Sitemap ─────────────────────────────────────────────────────────
router.get('/sitemap-profiles.xml', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const blocks = [];

  try {    await connectDB();    const ads = await Ad.find({ status: 'approved' }, '_id title city image updatedAt').lean();
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
  res.header('Cache-Control', 'public, max-age=1800, s-maxage=1800');
  res.end(xml);
});

// ─── Dedicated Image Sitemap ──────────────────────────────────────────────────
// Submitted separately to Google Image Search
router.get('/sitemap-images.xml', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const blocks = [];

  try {
    await connectDB();
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
  res.header('Cache-Control', 'public, max-age=1800, s-maxage=1800');
  res.end(xml);
});

module.exports = router;
