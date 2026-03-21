const express = require('express');
const router = express.Router();
const { CITIES } = require('../config/cities');
const { AREAS } = require('../config/areas');

const BASE = 'https://trustedesco.com';

function escXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function url(loc, priority = '0.8', changefreq = 'weekly', lastmod = null) {
  const today = lastmod || new Date().toISOString().split('T')[0];
  return `  <url>\n    <loc>${escXml(loc)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

router.get('/sitemap.xml', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const urls = [];

  // Homepage
  urls.push(url(`${BASE}/`, '1.0', 'daily', today));

  // Escorts service index
  urls.push(url(`${BASE}/escorts-service/`, '0.9', 'daily', today));

  // All city pages
  CITIES.forEach(city => {
    const priority = city.metro ? '0.8' : '0.7';
    urls.push(url(`${BASE}/escorts-service/${city.slug}/`, priority, 'weekly', today));
  });

  // All area pages (for cities that have areas)
  Object.keys(AREAS).forEach(citySlug => {
    (AREAS[citySlug] || []).forEach(area => {
      urls.push(url(`${BASE}/escorts-service/${citySlug}/${area.slug}/`, '0.6', 'weekly', today));
    });
  });

  // Static pages
  urls.push(url(`${BASE}/auth/login`, '0.4', 'monthly', today));
  urls.push(url(`${BASE}/auth/register`, '0.5', 'monthly', today));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml; charset=UTF-8');
  res.header('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

module.exports = router;
