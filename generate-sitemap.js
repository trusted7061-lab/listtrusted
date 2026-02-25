// Sitemap Generator Script
// Run with: node generate-sitemap.js

import fs from 'fs';

const content = fs.readFileSync('src/services/locationsData.js', 'utf8');
const cityMatch = content.match(/cities:\s*\[([^\]]*)\]/g);
const cities = new Set();
if (cityMatch) {
  cityMatch.forEach(m => {
    const matches = m.match(/'([^']+)'/g);
    if (matches) {
      matches.forEach(c => cities.add(c.replace(/'/g, '')));
    }
  });
}

const SITE_URL = 'https://trustedescort.in';
const TODAY = new Date().toISOString().split('T')[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Main Pages -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${SITE_URL}/escorts</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${SITE_URL}/booking</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${SITE_URL}/about</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${SITE_URL}/contact</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${SITE_URL}/faq</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>${SITE_URL}/terms</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>${SITE_URL}/privacy-policy</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- City Escort Pages (${cities.size} locations) -->
`;

Array.from(cities).sort().forEach(city => {
  const slug = city.toLowerCase().replace(/[\s&]+/g, '-').replace(/[^a-z0-9-]/g, '');
  xml += `
  <url>
    <loc>${SITE_URL}/escorts/in/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>
`;
});

xml += `
  <!-- Location Info Pages -->
`;

Array.from(cities).sort().forEach(city => {
  const slug = city.toLowerCase().replace(/[\s&]+/g, '-').replace(/[^a-z0-9-]/g, '');
  xml += `
  <url>
    <loc>${SITE_URL}/escorts/in/${slug}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
});

xml += `
</urlset>
`;

fs.writeFileSync('public/sitemap.xml', xml);
console.log('Sitemap generated with', cities.size, 'cities');
console.log('Total URLs:', (cities.size * 2) + 8);

