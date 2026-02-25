#!/usr/bin/env python3
"""Generate comprehensive sitemap.xml and robots.txt for SEO"""

import re
from datetime import datetime

# Extract cities from locationsData.js
with open('src/services/locationsData.js', 'r') as f:
    content = f.read()

# Find all city arrays
cities = set()
for match in re.findall(r"cities:\s*\[([^\]]*)\]", content):
    for city in re.findall(r"'([^']+)'", match):
        cities.add(city)

SITE_URL = 'https://www.trustedescort.com'
TODAY = datetime.now().strftime('%Y-%m-%d')

# Generate sitemap.xml
sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Main Pages -->
  <url>
    <loc>{SITE_URL}/</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>{SITE_URL}/escorts</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>{SITE_URL}/booking</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>{SITE_URL}/about</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>{SITE_URL}/contact</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>{SITE_URL}/faq</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <url>
    <loc>{SITE_URL}/terms</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>{SITE_URL}/privacy-policy</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- City Escort Pages ({len(cities)} locations) -->
'''

# Add escort pages for each city
for city in sorted(cities):
    slug = city.lower().replace(' ', '-').replace('&', '-')
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    sitemap += f'''
  <url>
    <loc>{SITE_URL}/escorts/in/{slug}</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>
'''

sitemap += '''
  <!-- Location Info Pages -->
'''

# Add location pages for each city
for city in sorted(cities):
    slug = city.lower().replace(' ', '-').replace('&', '-')
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    sitemap += f'''
  <url>
    <loc>{SITE_URL}/escorts/in/{slug}</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
'''

sitemap += '''
</urlset>
'''

# Write sitemap
with open('public/sitemap.xml', 'w') as f:
    f.write(sitemap)

print(f'✓ Sitemap generated with {len(cities)} cities')
print(f'  Total URLs: {len(cities) * 2 + 8}')

# Generate robots.txt
robots = f'''# robots.txt for Trusted Escort
# Last updated: {TODAY}

# Allow all search engines
User-agent: *
Allow: /

# Main content pages (high priority)
Allow: /escorts
Allow: /escorts/in/*
Allow: /booking
Allow: /about
Allow: /contact
Allow: /faq

# Disallow authentication & private pages
Disallow: /signin
Disallow: /register
Disallow: /forgot-password
Disallow: /resend-confirmation
Disallow: /account
Disallow: /advertiser-dashboard
Disallow: /advertiser-signup
Disallow: /post-requirement
Disallow: /profile
Disallow: /admin/
Disallow: /api/

# Crawl-delay for polite crawling
Crawl-delay: 1

# Sitemap location
Sitemap: {SITE_URL}/sitemap.xml

# For AI crawlers
# llms.txt: {SITE_URL}/llms.txt

# Google specific
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Bing
User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Yandex
User-agent: Yandex
Allow: /
Crawl-delay: 2
'''

# Write robots.txt
with open('public/robots.txt', 'w') as f:
    f.write(robots)

print('✓ robots.txt generated')
