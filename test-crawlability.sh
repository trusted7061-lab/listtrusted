#!/bin/bash

# Quick Crawlability Test - Run this immediately
# Tests if your React SPA pages are being served with proper meta tags

echo "🔍 QUICK CRAWLABILITY TEST"
echo "========================================\n"

DOMAIN="https://trustedescort.in"

echo "Testing if meta tags are visible to crawlers..."
echo "Domain: $DOMAIN\n"

# Test 1: Check main page
echo "Test 1: Homepage (/)"
echo "---"
title=$(curl -s "$DOMAIN/" | grep -oP '(?<=<title>)[^<]+' | head -1)
desc=$(curl -s "$DOMAIN/" | grep -oP 'name="description" content="\K[^"]+' | head -1)

if [ -n "$title" ] && [ -n "$desc" ]; then
  echo "✅ Title found: $title"
  echo "✅ Description found: ${desc:0:60}..."
  echo "✅ Homepage is CRAWLABLE"
else
  echo "⚠️  Meta tags not in initial HTML (client-side rendering)"
fi
echo ""

# Test 2: Check a location page
echo "Test 2: Location Page (/escorts/in/mumbai)"
echo "---"
title=$(curl -s "$DOMAIN/escorts/in/mumbai" | grep -oP '(?<=<title>)[^<]+' | head -1)
desc=$(curl -s "$DOMAIN/escorts/in/mumbai" | grep -oP 'name="description" content="\K[^"]+' | head -1)

if [ -n "$title" ] && [ -n "$desc" ]; then
  echo "✅ Title found: $title"
  echo "✅ Description found: ${desc:0:60}..."
  echo "✅ Location page is CRAWLABLE"
else
  echo "⚠️  Meta tags not in initial HTML (client-side rendering)"
fi
echo ""

# Test 3: Check robots.txt
echo "Test 3: robots.txt Configuration"
echo "---"
crawl_delay=$(curl -s "$DOMAIN/robots.txt" | grep "Crawl-delay" | grep -o "[0-9]" | head -1)
echo "Crawl-delay: $crawl_delay (0 is best for Semrush)"

if [ "$crawl_delay" = "0" ]; then
  echo "✅ Crawl-delay is optimal"
else
  echo "⚠️  Crawl-delay could be faster"
fi
echo ""

# Test 4: Check HTTP headers
echo "Test 4: HTTP Headers"
echo "---"
x_robots=$(curl -s -I "$DOMAIN/" | grep -i "x-robots-tag")
if [ -n "$x_robots" ]; then
  echo "✅ Found: $x_robots"
else
  echo "⚠️  X-Robots-Tag header not found"
fi
echo ""

# Test 5: Verify sitemap
echo "Test 5: Sitemap"
echo "---"
url_count=$(curl -s "$DOMAIN/sitemap.xml" | grep -c "<loc>")
echo "URLs in sitemap: $url_count"

if [ "$url_count" -gt 900 ]; then
  echo "✅ Sitemap is comprehensive"
else
  echo "⚠️  Sitemap may be incomplete"
fi
echo ""

echo "📋 INTERPRETATION"
echo "========================================\n"
echo "If you see✅ marks above:"
echo "- Meta tags ARE visible to crawlers"
echo "- Your static HTML has proper SEO content"
echo "- Problem might be Semrush settings"
echo ""
echo "If you see ⚠️  marks above:"
echo "- Meta tags are NOT in initial HTML"
echo "- React is rendering them client-side"
echo "- Semrush can't see them without JavaScript rendering"
echo ""
echo "💡 NEXT STEPS:"
echo "---"
echo "1. Go to Semrush Site Audit → Settings → Crawler"
echo "2. Enable 'Render JavaScript' ✅"
echo "3. Run crawl again"
echo ""
echo "If crawl still fails after enabling JS rendering,"
echo "you'll need to implement prerendering (see CRAWLABILITY_ACTION_PLAN.md)"
