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
    metaDescription: 'Browse verified escort service listings in all major Indian cities. Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata and 70+ cities. Admin-approved profiles only.',
    metaKeywords: 'escorts service near me, escort service india, escorts in india, call girls india, escort service all cities',
    canonical: 'https://trustedesco.com/escorts-service/',
    schema: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trustedesco.com' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Escorts Service India', 'item': 'https://trustedesco.com/escorts-service/' }
          ]
        },
        {
          '@type': 'ItemList',
          'name': 'Escort Service Cities in India',
          'description': 'Verified escort service listings across all major Indian cities',
          'numberOfItems': CITIES.length,
          'itemListElement': CITIES.slice(0, 30).map((city, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'name': `Escort Service in ${city.name}`,
            'url': `https://trustedesco.com/escorts-service/${city.slug}/`
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
router.get('/:citySlug{/}', async (req, res, next) => {
  const city = CITY_BY_SLUG[req.params.citySlug];
  if (!city) return next(); // fall through to 404

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
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trustedesco.com' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Escorts Service India', 'item': 'https://trustedesco.com/escorts-service/' },
            { '@type': 'ListItem', 'position': 3, 'name': `Escort Service in ${city.name}`, 'item': `https://trustedesco.com/escorts-service/${city.slug}/` }
          ]
        },
        {
          '@type': 'LocalBusiness',
          'name': `Escort Service in ${city.name}`,
          'description': `Find verified escort service in ${city.name}, ${city.state}. Admin-approved listings — safe, discreet, premium.`,
          'url': `https://trustedesco.com/escorts-service/${city.slug}/`,
          'areaServed': {
            '@type': 'City',
            'name': city.name,
            'containedIn': { '@type': 'State', 'name': city.state }
          }
        }
      ]
    });

    res.render('escorts-service/city', {
      title: `Escort Service in ${city.name} | Trusted Escort India`,
      metaDescription: `Find trusted escort service in ${city.name}, ${city.state}. Browse ${ads.length > 0 ? ads.length + '+' : ''} verified escort profiles — admin approved, safe & discreet.`,
      metaKeywords: `escort service in ${city.name.toLowerCase()}, escorts in ${city.name.toLowerCase()}, ${city.name.toLowerCase()} escort service, call girls in ${city.name.toLowerCase()}, escort near me ${city.name.toLowerCase()}`,
      canonical: `https://trustedesco.com/escorts-service/${city.slug}/`,
      schema,
      city,
      ads,
      areas,
      nearByCities
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('404', { title: 'Server Error' });
  }
});

// ─────────────────────────────────────────────
// GET /escorts-service/:city/:area/   →  Area page
// ─────────────────────────────────────────────
router.get('/:citySlug/:areaSlug{/}', async (req, res, next) => {
  const city = CITY_BY_SLUG[req.params.citySlug];
  if (!city) return next();

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
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trustedesco.com' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Escorts Service India', 'item': 'https://trustedesco.com/escorts-service/' },
            { '@type': 'ListItem', 'position': 3, 'name': `Escort Service in ${city.name}`, 'item': `https://trustedesco.com/escorts-service/${city.slug}/` },
            { '@type': 'ListItem', 'position': 4, 'name': `Escort Service in ${area.name}`, 'item': `https://trustedesco.com/escorts-service/${city.slug}/${area.slug}/` }
          ]
        },
        {
          '@type': 'LocalBusiness',
          'name': `Escort Service in ${area.name}, ${city.name}`,
          'description': `Verified escort service in ${area.name}, ${city.name}. Admin-approved listings.`,
          'url': `https://trustedesco.com/escorts-service/${city.slug}/${area.slug}/`,
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
      canonical: `https://trustedesco.com/escorts-service/${city.slug}/${area.slug}/`,
      schema,
      city,
      area,
      ads,
      otherAreas
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('404', { title: 'Server Error' });
  }
});

module.exports = router;
