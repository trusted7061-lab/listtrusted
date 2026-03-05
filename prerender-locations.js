#!/usr/bin/env node

/**
 * Post-build Prerender Script for Location Pages
 * 
 * Generates static HTML files for each city/area location page so that
 * search engine crawlers (which don't execute JavaScript) see proper:
 *   - <title>, meta description, canonical URL
 *   - H1, H2, H3 headings
 *   - 250+ words of content
 *   - Internal links to other city pages & areas
 *   - Correct language & hreflang tags
 *   - JSON-LD structured data (LocalBusiness, FAQPage, BreadcrumbList)
 *
 * Run after `vite build`:  node prerender-locations.js
 * Output: dist/escorts/in/{city-slug}/index.html
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ────────────────────────────────────────────────────────
// 1. Inline the locations data (copied from locationsData.js)
// We only need the essential parts: state → district → cities
// ────────────────────────────────────────────────────────

// Import the locationsData source & extract cities dynamically
const locationsFilePath = path.join(__dirname, 'src', 'services', 'locationsData.js')
const locationsSource = fs.readFileSync(locationsFilePath, 'utf-8')

// Parse all cities from locationsData file
function extractCitiesFromSource(source) {
  const cities = []
  // Match city arrays: cities: ['City1', 'City2', ...]
  const cityArrayRegex = /cities:\s*\[([^\]]*)\]/g
  let match
  while ((match = cityArrayRegex.exec(source)) !== null) {
    const inner = match[1]
    const nameRegex = /'([^']+)'/g
    let nameMatch
    while ((nameMatch = nameRegex.exec(inner)) !== null) {
      if (!cities.includes(nameMatch[1])) {
        cities.push(nameMatch[1])
      }
    }
  }
  return cities.sort()
}

// Parse state info for each city (for geo tags)
function extractCityStateMap(source) {
  const map = {}
  // Find each state block
  const stateRegex = /name:\s*'([^']+)',\s*\n\s*type:\s*'(?:state|ut)'/g
  let currentState = null
  const lines = source.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const stateMatch = lines[i].match(/name:\s*'([^']+)'/)
    const typeMatch = lines[i + 1]?.match(/type:\s*'(?:state|ut)'/)
    if (stateMatch && typeMatch) {
      currentState = stateMatch[1]
    }
    
    // Find cities in this state context
    const citiesMatch = lines[i].match(/cities:\s*\[([^\]]*)\]/)
    if (citiesMatch && currentState) {
      const inner = citiesMatch[1]
      const nameRegex = /'([^']+)'/g
      let nm
      while ((nm = nameRegex.exec(inner)) !== null) {
        map[nm[1]] = currentState
      }
    }
  }
  return map
}

const allCities = extractCitiesFromSource(locationsSource)
const cityStateMap = extractCityStateMap(locationsSource)

// Major cities for internal linking
const majorCities = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Goa',
  'Chennai', 'Kolkata', 'Chandigarh', 'Jaipur', 'Indore', 'Ahmedabad',
  'Surat', 'Lucknow', 'Nagpur', 'Visakhapatnam', 'Bhopal', 'Patna',
  'Vadodara', 'Agra', 'Nashik', 'Kochi', 'Coimbatore', 'Thane'
]

// ────────────────────────────────────────────────────────
// 2. HTML generator
// ────────────────────────────────────────────────────────

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')
}

function generateFAQs(cityName) {
  return [
    {
      q: `How do I book an escort in ${cityName}?`,
      a: `Booking an escort in ${cityName} is simple. Contact us via WhatsApp or our contact form with your preferred date, time, and requests. Our team matches you with available escorts in ${cityName} and handles all arrangements professionally.`
    },
    {
      q: `What areas of ${cityName} do you cover?`,
      a: `We provide escort services across all major areas of ${cityName}, including premium hotels, business districts, residential areas, and airports. Our escorts travel to your preferred location within ${cityName} and surrounding areas.`
    },
    {
      q: `Are your ${cityName} escorts available 24/7?`,
      a: `Yes, our elite escort services in ${cityName} are available 24 hours a day, 7 days a week. Whether you need daytime companionship, evening escorts, or overnight bookings, we accommodate your schedule.`
    },
    {
      q: `What makes your ${cityName} escort service premium?`,
      a: `Our ${cityName} escorts are carefully selected for sophistication, elegance, and professionalism. They provide exceptional companionship for business events, social gatherings, and private occasions.`
    },
    {
      q: `How is discretion maintained in ${cityName}?`,
      a: `We maintain the highest privacy and confidentiality standards. All bookings are handled discreetly, client information is never shared, and our escorts are trained professionals who understand the importance of discretion.`
    },
    {
      q: `What payment methods do you accept in ${cityName}?`,
      a: `We accept multiple secure payment methods in ${cityName} including cash, bank transfers, and digital payments. Complete payment details are provided during booking confirmation.`
    }
  ]
}

function generateLocationHTML(cityName) {
  const slug = slugify(cityName)
  const state = cityStateMap[cityName] || 'India'
  const pageUrl = `https://trustedescort.in/escorts/in/${slug}`
  const title = `Escorts in ${cityName} | Trusted Escort`
  const description = `Verified escorts in ${cityName}. Discreet, professional companions for events and private occasions. Book now at Trusted Escort.`
  const faqs = generateFAQs(cityName)

  // Pick 8 nearby / other cities for internal linking (different from current)
  const otherCities = majorCities.filter(c => c.toLowerCase() !== cityName.toLowerCase()).slice(0, 12)

  // JSON-LD: LocalBusiness
  const localBusinessLD = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": pageUrl,
    "name": `Trusted Escort - ${cityName}`,
    "description": description,
    "url": pageUrl,
    "telephone": "+91-XXXXXXXXXX",
    "email": "contact@trustedescort.in",
    "areaServed": { "@type": "City", "name": cityName, "addressCountry": "IN", "addressRegion": state },
    "address": { "@type": "PostalAddress", "addressLocality": cityName, "addressCountry": "IN", "addressRegion": state },
    "priceRange": "₹₹₹"
  })

  // JSON-LD: FAQPage
  const faqLD = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  })

  // JSON-LD: BreadcrumbList
  const breadcrumbLD = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://trustedescort.in" },
      { "@type": "ListItem", "position": 2, "name": "Escorts", "item": "https://trustedescort.in/escorts" },
      { "@type": "ListItem", "position": 3, "name": cityName, "item": pageUrl }
    ]
  })

  // Build internal links HTML
  const majorCityLinks = otherCities.map(c =>
    `<a href="/escorts/in/${slugify(c)}" title="Escorts in ${c}">${c}</a>`
  ).join(' · ')

  // FAQ HTML
  const faqHTML = faqs.map(f => `
          <div class="faq-item">
            <h3>${f.q}</h3>
            <p>${f.a}</p>
          </div>`).join('\n')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="Content-Language" content="en-IN" />

    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${cityName} escorts, escort service ${cityName}, premium escorts ${cityName}, verified escorts ${cityName}, companions ${cityName}, trusted escort" />
    <meta name="author" content="Trusted Escort Services" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <meta name="language" content="en" />
    <meta name="revisit-after" content="7 days" />

    <!-- Canonical URL -->
    <link rel="canonical" href="${pageUrl}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:site_name" content="Trusted Escort" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${pageUrl}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />

    <!-- Hreflang (self-referential) -->
    <link rel="alternate" hreflang="en-IN" href="${pageUrl}" />
    <link rel="alternate" hreflang="en" href="${pageUrl}" />
    <link rel="alternate" hreflang="x-default" href="${pageUrl}" />

    <!-- Geo Tags -->
    <meta name="geo.region" content="IN" />
    <meta name="geo.placename" content="${cityName}" />
    <meta name="geo.position" content="20.5937;78.9629" />
    <meta name="ICBM" content="20.5937, 78.9629" />

    <!-- Theme Color -->
    <meta name="theme-color" content="#D4AF37" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="Trusted Escort" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">${localBusinessLD}</script>
    <script type="application/ld+json">${faqLD}</script>
    <script type="application/ld+json">${breadcrumbLD}</script>

    <style>
      /* Minimal inline styles for SSR content — replaced by React once hydrated */
      body{margin:0;font-family:'Inter',sans-serif;background:#111;color:#e5e5e5}
      .ssr-wrap{max-width:960px;margin:0 auto;padding:2rem 1rem}
      .ssr-wrap h1{font-family:'Playfair Display',serif;color:#D4AF37;font-size:2.4rem;margin-bottom:.5rem}
      .ssr-wrap h2{font-family:'Playfair Display',serif;color:#D4AF37;font-size:1.6rem;margin-top:2rem}
      .ssr-wrap h3{color:#ccc;font-size:1.1rem;margin-top:1rem}
      .ssr-wrap p,.ssr-wrap li{line-height:1.7;color:#bbb;font-size:1rem}
      .ssr-wrap a{color:#D4AF37;text-decoration:none}
      .ssr-wrap a:hover{text-decoration:underline}
      .ssr-links{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem}
      .faq-item{border-top:1px solid #333;padding:.75rem 0}
      .breadcrumb{color:#999;font-size:.85rem;margin-bottom:1.5rem}
      .breadcrumb a{color:#D4AF37}
    </style>
  </head>
  <body class="bg-dark-bg text-white">
    <!-- SSR content for crawlers — React app replaces this on hydration -->
    <div id="root">
      <div class="ssr-wrap">
        <!-- Breadcrumb -->
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a> &rsaquo;
          <a href="/escorts">Escorts</a> &rsaquo;
          <span>${cityName}</span>
        </nav>

        <!-- H1 -->
        <h1>Premium Escorts in ${cityName}</h1>
        <p>${cityName}'s trusted escort service offering sophisticated companionship for business and personal occasions in ${state}. Our elite escorts provide discreet, professional services across the city.</p>

        <!-- Content Block 1 — 100+ words -->
        <h2>Escorts in ${cityName} — Find Verified Companions Near You</h2>
        <p>
          Looking for escorts in ${cityName}? Trusted Escort is ${state}'s most reliable platform to discover
          genuine, verified companion profiles right here in ${cityName}. Every individual listed on our
          platform goes through a thorough identity and profile verification process, so what you see is
          exactly what you get. ${cityName} is a vibrant city where professionals, travellers, and locals
          alike look for quality companionship. Whether it is a high-profile business dinner, a social
          evening out, a weekend getaway, or simply someone to share a meaningful conversation with, our
          escort service in ${cityName} is available 24 hours a day, 7 days a week.
        </p>

        <!-- Content Block 2 — Why Us -->
        <h2>Why Trusted Escort is the Top Choice for Escorts in ${cityName}</h2>
        <ul>
          <li><strong>Identity-Verified Profiles:</strong> Every escort in ${cityName} on our platform is personally verified with a photo-ID check. No fake profiles.</li>
          <li><strong>100% Confidential Booking:</strong> Your name, number, and booking details are never shared. Complete privacy is our standard.</li>
          <li><strong>Rated &amp; Reviewed Companions:</strong> Read real client reviews for ${cityName} escorts before you book.</li>
          <li><strong>Hyper-Local Coverage:</strong> We list companions from every major locality in ${cityName} — hotels, residential areas, and business hubs.</li>
          <li><strong>Instant WhatsApp Bookings:</strong> Skip lengthy forms. Message us on WhatsApp and get confirmed within minutes.</li>
          <li><strong>Transparent, Fixed Pricing:</strong> No hidden charges. Rates are clearly listed on each profile.</li>
        </ul>

        <!-- Content Block 3 — Services -->
        <h2>Types of Escort Services Available in ${cityName}</h2>
        <p>
          Our escort service in ${cityName} is not one-size-fits-all. Clients have different needs, and our
          companions are hand-picked to serve all of them professionally:
        </p>
        <ul>
          <li><strong>Corporate &amp; Business Companions:</strong> Polished professionals for client meetings, conferences, and product launches in ${cityName}.</li>
          <li><strong>Dinner Date &amp; Social Escort:</strong> Charming companions for fine dining, cocktail evenings, and private parties across ${cityName}.</li>
          <li><strong>Outcall Hotel Escort:</strong> Escorts who visit premium hotels and resorts directly in ${cityName}. Discreet, punctual, and professional.</li>
          <li><strong>Travel Companion:</strong> Engaging company for business trips, leisure tours, or weekend getaways from ${cityName}.</li>
          <li><strong>Overnight Bookings:</strong> Premium companions available for extended bookings in ${cityName}.</li>
        </ul>

        <!-- Content Block 4 — How to Book -->
        <h2>How to Book an Escort in ${cityName}</h2>
        <ol>
          <li><strong>Browse Profiles:</strong> Visit our ${cityName} escort gallery. Filter by availability, area, or service type.</li>
          <li><strong>Choose Your Match:</strong> Read verified reviews, check photo galleries, and shortlist your ideal companion.</li>
          <li><strong>Confirm via WhatsApp:</strong> Share your preferred date, time, and location within ${cityName}.</li>
          <li><strong>Enjoy with Confidence:</strong> Your escort arrives on time. Every booking is fully confidential.</li>
        </ol>

        <!-- FAQs -->
        <h2>Frequently Asked Questions — Escorts in ${cityName}</h2>
${faqHTML}

        <!-- Internal Links: Major Cities -->
        <h2>Escorts in Other Major Cities</h2>
        <p>Travelling or planning ahead? Find premium escorts across India:</p>
        <div class="ssr-links">
          ${majorCityLinks}
        </div>

        <!-- Footer nav links -->
        <h2>Quick Links</h2>
        <p>
          <a href="/">Home</a> · 
          <a href="/escorts">Browse Escorts</a> · 
          <a href="/about">About Us</a> · 
          <a href="/contact">Contact</a> · 
          <a href="/faq">FAQs</a> · 
          <a href="/blog">Blog</a> · 
          <a href="/privacy-policy">Privacy Policy</a> · 
          <a href="/terms">Terms</a>
        </p>

        <p style="margin-top:2rem;color:#666;font-size:.85rem;">
          &copy; ${new Date().getFullYear()} Trusted Escort. All rights reserved. Premium escort services in ${cityName}, ${state}, India.
        </p>
      </div>
    </div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`
}

// ────────────────────────────────────────────────────────
// 3. Build
// ────────────────────────────────────────────────────────

const DIST = path.join(__dirname, 'dist')
const distIndexPath = path.join(DIST, 'index.html')

// Check if dist exists (should run after vite build)
if (!fs.existsSync(DIST)) {
  console.error('❌  dist/ folder not found. Run "vite build" first.')
  process.exit(1)
}

// Read the built index.html to extract the hashed JS/CSS asset references
let builtIndex = ''
if (fs.existsSync(distIndexPath)) {
  builtIndex = fs.readFileSync(distIndexPath, 'utf-8')
}

// Extract <script> and <link rel="stylesheet"> from built index.html
const scriptTags = [...builtIndex.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g)]
  .map(m => m[0])
  .join('\n    ')

const cssTags = [...builtIndex.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="[^"]*"[^>]*\/?>/g)]
  .map(m => m[0])
  .join('\n    ')

console.log(`\n🔨 Prerendering ${allCities.length} location pages...\n`)

let count = 0
for (const cityName of allCities) {
  const slug = slugify(cityName)
  const dir = path.join(DIST, 'escorts', 'in', slug)
  fs.mkdirSync(dir, { recursive: true })

  let html = generateLocationHTML(cityName)

  // Replace the dev script tag with production asset tags
  html = html.replace(
    '<script type="module" src="/src/main.jsx"></script>',
    `${cssTags}\n    ${scriptTags}`
  )

  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf-8')
  count++
}

console.log(`✅ Prerendered ${count} location pages in dist/escorts/in/`)
console.log('   Each page has: correct title, canonical, hreflang, H1, 250+ words, internal links, JSON-LD')

// ────────────────────────────────────────────────────────
// 4. Generate redirect pages for old /location/:city URLs
//    These return HTTP-equiv meta refresh + canonical pointing
//    to the correct /escorts/in/:city URL (belt-and-suspenders
//    on top of the Vercel 301 redirects)
// ────────────────────────────────────────────────────────

function generateRedirectHTML(cityName) {
  const slug = slugify(cityName)
  const correctUrl = `https://trustedescort.in/escorts/in/${slug}`
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Redirecting to Escorts in ${cityName} | Trusted Escort</title>
  <meta name="robots" content="noindex, follow" />
  <link rel="canonical" href="${correctUrl}" />
  <meta http-equiv="refresh" content="0;url=${correctUrl}" />
  <meta property="og:url" content="${correctUrl}" />
</head>
<body>
  <p>This page has moved. If you are not redirected automatically, <a href="${correctUrl}">click here to view Escorts in ${cityName}</a>.</p>
</body>
</html>
`
}

console.log(`\n🔀 Generating redirect pages for /location/ URLs...`)

let redirectCount = 0
const oldPrefixes = ['location', 'locations', 'escort']

for (const prefix of oldPrefixes) {
  for (const cityName of allCities) {
    const slug = slugify(cityName)
    const dir = path.join(DIST, prefix, slug)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), generateRedirectHTML(cityName), 'utf-8')
    redirectCount++
  }
}

console.log(`✅ Generated ${redirectCount} redirect pages across /${oldPrefixes.join('/, /')}/ prefixes`)
console.log('   Each redirects to the correct /escorts/in/:city URL with canonical + meta refresh\n')
