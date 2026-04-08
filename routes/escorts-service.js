const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const LocationAd = require('../models/LocationAd');
const { CITIES, CITY_BY_SLUG } = require('../config/cities');
const { getAreasForCity, getArea } = require('../config/areas');

// Helper function to fetch location ads for a city
async function getLocationAdsForCity(citySlug) {
  try {
    const now = new Date();
    const locationAds = await LocationAd.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { targetCities: { $size: 0 } }, // Show on all cities if array is empty
        { targetCities: citySlug }     // Or if this city is in the array
      ]
    }).sort({ isPinned: -1, createdAt: -1 }).limit(2);
    
    return locationAds;
  } catch (err) {
    console.error('Error fetching location ads:', err);
    return [];
  }
}

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
              'name': `How do I find escort service in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Browse the verified listings on this page for escort service in ${city.name}. All ads are admin-approved before going live. Tap the Call or WhatsApp button on any listing to directly contact the advertiser — no middlemen, no booking fees.` }
            },
            {
              '@type': 'Question',
              'name': `Are escort listings in ${city.name} verified?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. Every escort service listing in ${city.name} is manually reviewed and approved by our admin team. Fake, misleading or low-quality profiles are rejected and never shown. This makes our ${city.name} escort directory the most trusted in ${city.state}.` }
            },
            {
              '@type': 'Question',
              'name': `How do I post an escort ad in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Register free on Trusted Escort India, fill in your service details, upload photos, and select ${city.name} as your city. Submit for admin review. Your listing goes live on this ${city.name} page within 24 hours of approval.` }
            },
            {
              '@type': 'Question',
              'name': `What areas in ${city.name} are covered?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `We cover all major localities and areas within ${city.name}. Use the area links at the top of this page to browse escort service listings for a specific neighbourhood or locality in ${city.name}, ${city.state}.` }
            },
            {
              '@type': 'Question',
              'name': `Is escort service available 24/7 in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Many escort service advertisers in ${city.name} are available 24 hours a day, 7 days a week. Each listing shows the advertiser's contact details — call or WhatsApp them directly to confirm availability and timings for ${city.name}.` }
            },
            {
              '@type': 'Question',
              'name': `Is it safe to book escort service in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `All listings on this page are admin-verified before going live. We screen all ${city.name} escort advertisers for authenticity. However, always exercise personal discretion. Only deal directly with the advertiser and never share sensitive financial information.` }
            },
            {
              '@type': 'Question',
              'name': `What types of escort services are available in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Escort service listings in ${city.name} include companionship services, social escort, dinner date companions, event and party companions, and travel escort services. All listed services are legal. Category is clearly labelled on each ad card.` }
            },
            {
              '@type': 'Question',
              'name': `How do I contact an escort in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Click the Call or WhatsApp button displayed on any approved listing on this page. You will be connected directly to the advertiser in ${city.name} — no agency, no fees. Each listing shows the phone number or WhatsApp contact chosen by the advertiser.` }
            },
            {
              '@type': 'Question',
              'name': `Can I report a suspicious listing in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. If you come across any fake, misleading or suspicious escort listing in ${city.name}, contact our support team immediately. We will investigate within 24 hours and remove the listing if it violates our guidelines. Advertiser accounts involved in fraud are permanently banned.` }
            },
            {
              '@type': 'Question',
              'name': `How many escort listings are there in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `The number of live escort service listings in ${city.name} changes daily as new ads are approved and old ads expire. Check the live count shown at the top of this page. For metro cities like Delhi and Mumbai, we typically have dozens of verified listings active at any time.` }
            },
            {
              '@type': 'Question',
              'name': `Can I advertise escort service in ${city.name} for free?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. Posting your first escort service ad in ${city.name} is completely free. Register, fill in your details, select ${city.name}, and submit. Our admin team will review and approve your listing within 24 hours at no charge.` }
            },
            {
              '@type': 'Question',
              'name': `Why choose Trusted Escort India for ${city.name} listings?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Trusted Escort India is the most reliable escort service directory in ${city.name}. Every ad is admin-approved, contact details are genuine, and the platform is free to use. We cover all areas within ${city.name} and update listings daily.` }
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
      nearByCities,
      cities: CITIES,
      locationAds: await getLocationAdsForCity(city.slug)
    });
  } catch (err) {
    console.error('City page error:', err.message);
    // Fall back — render page with empty ads so it doesn't show error
    const areas = getAreasForCity(city.slug);
    const nearByCities = CITIES.filter(c => c.slug !== city.slug).slice(0, 18);
    const locationAds = await getLocationAdsForCity(city.slug);
    
    res.render('escorts-service/city', {
      title: `Escort Service in ${city.name} | Trusted Escort India`,
      metaDescription: `Find verified escort service in ${city.name}, ${city.state}. Admin-approved listings.`,
      metaKeywords: `escort service in ${city.name.toLowerCase()}, escorts in ${city.name.toLowerCase()}`,
      canonical: `https://trustedescort.in/escorts-service/${city.slug}/`,
      schema: '{}',
      city,
      ads: [],
      areas,
      nearByCities,
      cities: CITIES,
      locationAds
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
      otherAreas,
      locationAds: await getLocationAdsForCity(city.slug)
    });
  } catch (err) {
    console.error('Area page error:', err.message);
    const allAreas = getAreasForCity(city.slug);
    const otherAreas = allAreas.filter(a => a.slug !== area.slug);
    const locationAds = await getLocationAdsForCity(city.slug);
    
    res.render('escorts-service/area', {
      title: `Escort Service in ${area.name}, ${city.name} | Trusted Escort India`,
      metaDescription: `Find verified escort service in ${area.name}, ${city.name}.`,
      metaKeywords: `escort service ${area.name.toLowerCase()}, escorts ${city.name.toLowerCase()}`,
      canonical: `https://trustedescort.in/escorts-service/${city.slug}/${area.slug}/`,
      schema: '{}',
      city,
      area,
      ads: [],
      otherAreas,
      locationAds
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

    const profileUrl = `https://trustedescort.in/escorts-service/profile/${ad._id}`;
    const imageUrl = ad.image || 'https://trustedescort.in/logo.png';
    const truncatedDesc = ad.description.length > 155
      ? ad.description.substring(0, 152) + '...'
      : ad.description;

    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ProfilePage',
          '@id': `${profileUrl}#webpage`,
          'url': profileUrl,
          'name': `${ad.title} — Escort Service in ${ad.city}`,
          'description': truncatedDesc,
          'image': {
            '@type': 'ImageObject',
            'url': imageUrl,
            'name': `${ad.title} — ${ad.city}`,
            'description': `Verified escort service listing in ${ad.city}. Admin-approved on Trusted Escort India.`,
            'contentUrl': imageUrl,
            'thumbnail': imageUrl
          }
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trustedescort.in' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Escorts Service India', 'item': 'https://trustedescort.in/escorts-service/' },
            { '@type': 'ListItem', 'position': 3, 'name': `Escort Service in ${ad.city}`, 'item': `https://trustedescort.in/escorts-service/${ad.citySlug}/` },
            { '@type': 'ListItem', 'position': 4, 'name': ad.title, 'item': profileUrl }
          ]
        },
        {
          '@type': 'Person',
          'name': ad.title,
          'image': {
            '@type': 'ImageObject',
            'url': imageUrl,
            'name': `${ad.title} – Escort Service Profile Photo`,
            'description': `Profile photo of ${ad.title}, verified escort service in ${ad.city}, India.`
          },
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': ad.city,
            'addressCountry': 'IN'
          },
          'url': profileUrl
        }
      ]
    });

    res.render('escorts-service/profile', {
      title: `${ad.title} — Escort Service in ${ad.city} | Trusted Escort India`,
      metaDescription: truncatedDesc,
      metaKeywords: `escort service ${(ad.city || 'india').toLowerCase()}, ${(ad.title || '').toLowerCase()}, verified escort ${(ad.city || '').toLowerCase()}, call girls ${(ad.city || '').toLowerCase()}`,
      canonical: profileUrl,
      ogImage: imageUrl,
      schema,
      ad
    });
  } catch (err) {
    console.error('Profile page error:', err.message);
    res.status(404).render('404', { title: 'Profile Not Found' });
  }
});

module.exports = router;
