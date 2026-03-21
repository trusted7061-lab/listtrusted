const fs = require('fs');
const { CITIES } = require('./config/cities');

const BASE = 'https://trustedescort.in';
const TODAY = new Date().toISOString().split('T')[0];

// ── sitemap.xml ───────────────────────────────────────────────────────────────
const staticUrls = [
  { loc: BASE + '/',                    priority: '1.0', freq: 'daily' },
  { loc: BASE + '/escorts-service/',    priority: '0.9', freq: 'daily' },
  { loc: BASE + '/auth/login',          priority: '0.5', freq: 'monthly' },
  { loc: BASE + '/auth/register',       priority: '0.6', freq: 'monthly' },
];

const cityUrls = CITIES.map(c => ({
  loc: `${BASE}/escorts-service/${c.slug}/`,
  priority: c.metro ? '0.8' : '0.7',
  freq: 'weekly'
}));

const allUrls = [...staticUrls, ...cityUrls];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync('public/sitemap.xml', sitemap);
console.log(`sitemap.xml — ${allUrls.length} URLs`);

// ── robots.txt ────────────────────────────────────────────────────────────────
const robots = `User-agent: *
Allow: /

# Block admin and private areas
Disallow: /admin/
Disallow: /admin
Disallow: /advertiser/dashboard
Disallow: /advertiser/post-ad
Disallow: /auth/reset-password
Disallow: /auth/verify-email

# Allow all crawlers on public content
Allow: /escorts-service/
Allow: /auth/login
Allow: /auth/register

Sitemap: ${BASE}/sitemap.xml
`;

fs.writeFileSync('public/robots.txt', robots);
console.log('robots.txt written');

// ── llms.txt ──────────────────────────────────────────────────────────────────
const cityList = CITIES.map(c => `- [Escorts Service in ${c.name}](${BASE}/escorts-service/${c.slug}/)`).join('\n');

const llms = `# Trusted Escort India — ${BASE}

> India's most trusted platform for verified escort service listings. Browse admin-approved escort profiles across 79+ cities. Safe, discreet, and premium quality guaranteed.

## About

Trusted Escort India is a classified advertising platform where adult service providers can post verified ads. All listings are manually reviewed and approved by our admin team before going live.

## Key Pages

- [Home](${BASE}/)
- [All Cities — Escorts Service India](${BASE}/escorts-service/)
- [Post an Ad](${BASE}/auth/register)
- [Advertiser Login](${BASE}/auth/login)

## City Pages (79 cities)

${cityList}

## Platform Details

- **Category:** Adult classified advertising
- **Coverage:** 79+ cities across India
- **Verification:** All profiles manually reviewed
- **Language:** English
- **Country:** India

## Sitemap

${BASE}/sitemap.xml
`;

fs.writeFileSync('public/llms.txt', llms);
console.log('llms.txt written');
