#!/bin/bash

# Crawlability Audit & Fix Script for Semrush Issues
# This script helps diagnose and fix crawler accessibility issues

echo "🔍 Trusted Escort - Crawlability Audit"
echo "======================================\n"

# Check if robots.txt is accessible
echo "1️⃣ Testing robots.txt..."
response=$(curl -s -o /dev/null -w "%{http_code}" https://trustedescort.in/robots.txt)
if [ $response -eq 200 ]; then
    echo "✅ robots.txt is accessible (HTTP $response)\n"
else
    echo "❌ robots.txt not accessible (HTTP $response)\n"
fi

# Check if sitemap.xml is accessible
echo "2️⃣ Testing sitemap.xml..."
response=$(curl -s -o /dev/null -w "%{http_code}" https://trustedescort.in/sitemap.xml)
if [ $response -eq 200 ]; then
    echo "✅ sitemap.xml is accessible (HTTP $response)\n"
else
    echo "❌ sitemap.xml not accessible (HTTP $response)\n"
fi

# Test homepage
echo "3️⃣ Testing homepage..."
response=$(curl -s -o /dev/null -w "%{http_code}" https://trustedescort.in/)
if [ $response -eq 200 ]; then
    echo "✅ Homepage is accessible (HTTP $response)\n"
else
    echo "❌ Homepage not accessible (HTTP $response)\n"
fi

# Check page title in HTML
echo "4️⃣ Checking if page has title tag..."
title=$(curl -s https://trustedescort.in/ | grep -o '<title>.*</title>' | head -1)
if [ -n "$title" ]; then
    echo "✅ Title tag found: $title\n"
else
    echo "❌ No title tag found\n"
fi

# Check meta description
echo "5️⃣ Checking meta description..."
description=$(curl -s https://trustedescort.in/ | grep 'name="description"' | head -1)
if [ -n "$description" ]; then
    echo "✅ Meta description found\n"
else
    echo "❌ No meta description found\n"
fi

echo "\n📊 Summary & Next Steps:"
echo "========================\n"

echo "⚠️  Current Issue: React SPA not fully crawlable by basic crawlers"
echo "\nSolutions to implement:\n"

echo "1️⃣ IMMEDIATE FIX - Improve robots.txt:"
echo "   - Reduce Crawl-delay: 1 → 0 for faster crawling"
echo "   - Allow all public pages"
echo "   - Submit to Search Console\n"

echo "2️⃣ SHORT TERM - Test with different crawlers:"
echo "   - Google Mobile-Friendly Test: https://search.google.com/test/mobile-friendly"
echo "   - Bing Render Tool: https://www.bing.com/webmaster/tools/browserrender"
echo "   - Semrush Site Crawl with 'Render JavaScript' enabled\n"

echo "3️⃣ MEDIUM TERM - Enable Prerendering:"
echo "   - Install: npm install prerender-spa-plugin --save-dev"
echo "   - Configure in vite.config.js"
echo "   - Pre-render key pages (Home, Location pages, About, Contact)\n"

echo "4️⃣ LONG TERM - Consider SSR:"
echo "   - Migrate to Next.js with SSR"
echo "   - Or use Vite with @vite-plugin-ssr"
echo "   - Enables full crawlability without pre-rendering\n"

echo "🔧 Vercel Configuration:"
echo "   - ✅ Rewrites configured for SPA routing"
echo "   - ✅ Headers optimized for crawlers"
echo "   - ✅ Caching properly set for index.html\n"

echo "📋 Checklist:"
echo "   - [ ] Verify robots.txt via search console"
echo "   - [ ] Submit sitemap.xml to Google"
echo "   - [ ] Test with Semrush Site Crawl"
echo "   - [ ] Enable JavaScript rendering in Semrush"
echo "   - [ ] Set up prerendering for critical pages"
echo "   - [ ] Monitor crawl errors in Search Console"
echo "   - [ ] Test with Bing Render Tool"
echo "   - [ ] Check Core Web Vitals\n"

echo "✅ To run this audit:"
echo "   bash crawlability-audit.sh\n"
