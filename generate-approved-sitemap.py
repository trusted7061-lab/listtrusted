#!/usr/bin/env python3
import os

# Read approved locations and clean them (remove escorts-in- prefix)
with open('approved-locations.txt', 'r') as f:
    locations = []
    for line in f:
        loc = line.strip()
        if loc:
            # Remove 'escorts-in-' prefix if present
            if loc.startswith('escorts-in-'):
                loc = loc.replace('escorts-in-', '', 1)
            locations.append(loc)

print(f"✅ Loaded {len(locations)} approved locations")

# Start XML
xml_content = "<?xml version='1.0' encoding='UTF-8'?>\n"
xml_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsiSchemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n'

# Add homepage
xml_content += '  <url>\n    <loc>https://trustedescort.in/</loc>\n    <lastmod>2026-03-01</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n'

# Add escorts page
xml_content += '  <url>\n    <loc>https://trustedescort.in/escorts</loc>\n    <lastmod>2026-03-01</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n'

# Add static pages
static_pages = [
    ('about', 0.7),
    ('contact', 0.7),
    ('faq', 0.7),
    ('privacy-policy', 0.5),
    ('terms', 0.5),
    ('booking', 0.8),
]

for page, priority in static_pages:
    xml_content += f'  <url>\n    <loc>https://trustedescort.in/{page}</loc>\n    <lastmod>2026-03-01</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>{priority}</priority>\n  </url>\n'

# Add location pages
for location in locations:
    xml_content += f'  <url>\n    <loc>https://trustedescort.in/escorts/in/{location}</loc>\n    <lastmod>2026-03-01</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'

# Close XML
xml_content += '</urlset>'

# Write to file
output_path = 'public/sitemap.xml'
with open(output_path, 'w') as f:
    f.write(xml_content)

print(f"✅ Generated sitemap with {len(locations) + len(static_pages) + 2} URLs")
print(f"✅ Saved to {output_path}")
