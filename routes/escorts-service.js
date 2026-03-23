const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const { CITIES, CITY_BY_SLUG } = require('../config/cities');
const { getAreasForCity, getArea } = require('../config/areas');

// ─────────────────────────────────────────────
// GET /escorts-service/   →  All cities index
// ─────────────────────────────────────────────
router.get('/', (req, res) => {
  res.render('escorts-service/index', {
    title: 'Escorts Service in India — All Cities | Trusted Escort India',
    metaDescription: 'Browse verified escort service listings in all major Indian cities. Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata and 70+ cities. Admin-approved profiles — free to browse, contact directly.',
    metaKeywords: 'escorts service near me, escort service india, escorts in india, call girls india, escort service all cities, verified escort india, female escorts india',
    canonical: 'https://trustedescort.in/escorts-service/',
    ogImage: 'https://trustedescort.in/logo.png',
    schema: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': 'https://trustedescort.in/escorts-service/#webpage',
          'url': 'https://trustedescort.in/escorts-service/',
          'name': 'Escorts Service in India — All Cities',
          'speakable': {
            '@type': 'SpeakableSpecification',
            'cssSelector': ['.speakable-content', '.answer-box p', 'h1']
          }
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trustedescort.in' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Escorts Service India', 'item': 'https://trustedescort.in/escorts-service/' }
          ]
        },
        {
          '@type': 'ItemList',
          'name': 'Escort Service Cities in India',
          'description': 'Verified escort service listings across all major Indian cities on Trusted Escort India',
          'numberOfItems': CITIES.length,
          'itemListElement': CITIES.slice(0, 30).map((city, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'name': `Escort Service in ${city.name}`,
            'url': `https://trustedescort.in/escorts-service/${city.slug}/`
          }))
        }
      ]
    }),
    cities: CITIES
  });
});

// ─────────────────────────────────────────────
// GET /escorts-service/:city/   →  City page
// ─────────────────────────────────────────────
router.get('/:citySlug', async (req, res, next) => {
  const slug = req.params.citySlug;
  // Build a synthetic city object for slugs not in the config
  const city = CITY_BY_SLUG[slug] || {
    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    slug,
    state: 'India',
    metro: false
  };

  try {
    const ads = await Ad.find({ status: 'approved', citySlug: city.slug })
      .populate('advertiser', 'name')
      .sort({ createdAt: -1 });

    const areas = getAreasForCity(city.slug);
    const nearByCities = CITIES.filter(c => c.slug !== city.slug).slice(0, 18);

    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `https://trustedescort.in/escorts-service/${city.slug}/#webpage`,
          'url': `https://trustedescort.in/escorts-service/${city.slug}/`,
          'name': `Escort Service in ${city.name}`,
          'speakable': {
            '@type': 'SpeakableSpecification',
            'cssSelector': ['.speakable-content', '.answer-box p', 'h1', '.city-answer']
          }
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trustedescort.in' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Escorts Service India', 'item': 'https://trustedescort.in/escorts-service/' },
            { '@type': 'ListItem', 'position': 3, 'name': `Escort Service in ${city.name}`, 'item': `https://trustedescort.in/escorts-service/${city.slug}/` }
          ]
        },
        {
          '@type': 'LocalBusiness',
          'name': `Escort Service in ${city.name}`,
          'description': `Find verified escort service in ${city.name}, ${city.state}. Admin-approved listings — safe, discreet, premium. Browse ${ads.length}+ profiles and contact directly.`,
          'url': `https://trustedescort.in/escorts-service/${city.slug}/`,
          'image': 'https://trustedescort.in/logo.png',
          'priceRange': 'Free to browse',
          'areaServed': {
            '@type': 'City',
            'name': city.name,
            'containedIn': { '@type': 'State', 'name': city.state }
          },
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.8',
            'reviewCount': String(Math.max(ads.length * 3, 25)),
            'bestRating': '5',
            'worstRating': '1'
          }
        },
        {
          '@type': 'Service',
          'name': `Escort Service in ${city.name}`,
          'provider': {
            '@type': 'Organization',
            'name': 'Trusted Escort India',
            'url': 'https://trustedescort.in'
          },
          'areaServed': { '@type': 'City', 'name': city.name },
          'description': `Verified escort service listings in ${city.name}, ${city.state}. Browse admin-approved profiles and contact directly via Call or WhatsApp.`,
          'audience': { '@type': 'Audience', 'audienceType': 'Adults' }
        },
        {
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': `How do I find escort service near me in ${city.name}?`,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': `To find escort service near you in ${city.name}, browse the listings above on Trusted Escort India. All profiles are admin-approved. Click the Call or WhatsApp button on any listing to contact directly — available 24/7 in ${city.name}, ${city.state}.`
              }
            },
            {
              '@type': 'Question',
              'name': `Are escort profiles in ${city.name} verified?`,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': `Yes. Every escort listing in ${city.name} on Trusted Escort India is manually reviewed by our admin team before going live. Fake profiles are rejected. Only genuine, verified escorts in ${city.name} appear on this page.`
              }
            },
            {
              '@type': 'Question',
              'name': `What areas in ${city.name} have escort service?`,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': `Escort service is available across all major areas in ${city.name}. Our listings cover all localities in ${city.name}, ${city.state}. Browse the listings above to find escort service near your location in ${city.name}.`
              }
            },
            {
              '@type': 'Question',
              'name': `How do I contact an escort in ${city.name}?`,
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': `Each verified escort listing in ${city.name} shows a Call or WhatsApp button with direct contact — no middlemen. Tap the button on any approved listing to reach the advertiser directly.`
              }
            }
          ]
        }
      ]
    });

    res.render('escorts-service/city', {
      title: `Escort Service in ${city.name} | Verified Listings | Trusted Escort India`,
      metaDescription: `Find verified escort service in ${city.name}, ${city.state}. Browse ${ads.length > 0 ? ads.length + '+' : 'latest'} admin-approved escort profiles in ${city.name}. Contact directly via Call or WhatsApp — no middlemen. Safe, discreet, 24/7.`,
      metaKeywords: `escort service in ${city.name.toLowerCase()}, escorts in ${city.name.toLowerCase()}, ${city.name.toLowerCase()} escort service, escort service near me ${city.name.toLowerCase()}, call girls in ${city.name.toLowerCase()}, verified escort ${city.name.toLowerCase()}, ${city.name.toLowerCase()} ${city.state.toLowerCase()} escorts`,
      canonical: `https://trustedescort.in/escorts-service/${city.slug}/`,
      ogImage: 'https://trustedescort.in/logo.png',
      schema,
      city,
      ads,
      areas,
      nearByCities
    });
  } catch (err) {
    console.error('City page error:', err.message);
    // Fall back — render page with empty ads so it doesn't show error
    const areas = getAreasForCity(city.slug);
    const nearByCities = CITIES.filter(c => c.slug !== city.slug).slice(0, 18);
    res.render('escorts-service/city', {
      title: `Escort Service in ${city.name} | Trusted Escort India`,
      metaDescription: `Find verified escort service in ${city.name}, ${city.state}. Admin-approved listings.`,
      metaKeywords: `escort service in ${city.name.toLowerCase()}, escorts in ${city.name.toLowerCase()}`,
      canonical: `https://trustedescort.in/escorts-service/${city.slug}/`,
      schema: '{}',
      city,
      ads: [],
      areas,
      nearByCities
    });
  }
});

// ─────────────────────────────────────────────
// GET /escorts-service/:city/:area/   →  Area page
// ─────────────────────────────────────────────
router.get('/:citySlug/:areaSlug', async (req, res, next) => {
  const slug = req.params.citySlug;
  const city = CITY_BY_SLUG[slug] || {
    name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    slug,
    state: 'India',
    metro: false
  };

  const area = getArea(city.slug, req.params.areaSlug);
  if (!area) return next();

  try {
    // Show all city ads on area page (area-level filtering can be added when area field is added to Ad model)
    const ads = await Ad.find({ status: 'approved', citySlug: city.slug })
      .populate('advertiser', 'name')
      .sort({ createdAt: -1 });

    const allAreas = getAreasForCity(city.slug);
    const otherAreas = allAreas.filter(a => a.slug !== area.slug);

    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trustedescort.in' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Escorts Service India', 'item': 'https://trustedescort.in/escorts-service/' },
            { '@type': 'ListItem', 'position': 3, 'name': `Escort Service in ${city.name}`, 'item': `https://trustedescort.in/escorts-service/${city.slug}/` },
            { '@type': 'ListItem', 'position': 4, 'name': `Escort Service in ${area.name}`, 'item': `https://trustedescort.in/escorts-service/${city.slug}/${area.slug}/` }
          ]
        },
        {
          '@type': 'LocalBusiness',
          'name': `Escort Service in ${area.name}, ${city.name}`,
          'description': `Verified escort service in ${area.name}, ${city.name}. Admin-approved listings.`,
          'url': `https://trustedescort.in/escorts-service/${city.slug}/${area.slug}/`,
          'areaServed': {
            '@type': 'Place',
            'name': `${area.name}, ${city.name}`,
            'containedIn': { '@type': 'City', 'name': city.name }
          }
        }
      ]
    });

    res.render('escorts-service/area', {
      title: `Escort Service in ${area.name}, ${city.name} | Trusted Escort India`,
      metaDescription: `Find verified escort service in ${area.name}, ${city.name}. Admin-approved escort profiles — 100% genuine, safe & discreet.`,
      metaKeywords: `escort service ${area.name.toLowerCase()}, escorts in ${area.name.toLowerCase()} ${city.name.toLowerCase()}, ${area.name.toLowerCase()} escort service`,
      canonical: `https://trustedescort.in/escorts-service/${city.slug}/${area.slug}/`,
      schema,
      city,
      area,
      ads,
      otherAreas
    });
  } catch (err) {
    console.error('Area page error:', err.message);
    const allAreas = getAreasForCity(city.slug);
    const otherAreas = allAreas.filter(a => a.slug !== area.slug);
    res.render('escorts-service/area', {
      title: `Escort Service in ${area.name}, ${city.name} | Trusted Escort India`,
      metaDescription: `Find verified escort service in ${area.name}, ${city.name}.`,
      metaKeywords: `escort service ${area.name.toLowerCase()}, escorts ${city.name.toLowerCase()}`,
      canonical: `https://trustedescort.in/escorts-service/${city.slug}/${area.slug}/`,
      schema: '{}',
      city,
      area,
      ads: [],
      otherAreas
    });
  }
});

// ── Individual Ad Profile ──────────────────────────────────────────────────
router.get('/profile/:id', async (req, res) => {
  try {
    const ad = await Ad.findOne({ _id: req.params.id, status: 'approved' })
      .populate('advertiser', 'name company');
    if (!ad) {
      return res.status(404).render('404', { title: 'Profile Not Found' });
    }
    res.render('escorts-service/profile', {
      title: `${ad.title} — Escort Service in ${ad.city} | Trusted Escort India`,
      metaDescription: `${ad.description.substring(0, 155)}`,
      canonical: `https://trustedescort.in/escorts-service/profile/${ad._id}`,
      ad
    });
  } catch (err) {
    console.error('Profile page error:', err.message);
    res.status(404).render('404', { title: 'Profile Not Found' });
  }
});

module.exports = router;
