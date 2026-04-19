const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const LocationAd = require('../models/LocationAd');
const { CITIES, CITY_BY_SLUG } = require('../config/cities');
const { getAreasForCity, getArea } = require('../config/areas');
const { CITY_CONTENT } = require('../config/cityContent');
const { getAreaContent } = require('../config/areaContent');

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
          'dateModified': new Date().toISOString().split('T')[0],
          'datePublished': '2024-01-01',
          'inLanguage': 'en-IN',
          'speakable': {
            '@type': 'SpeakableSpecification',
            'cssSelector': ['.speakable-content', '.answer-box p', 'h1', '.city-answer', '.seo-content-box p', '.definition-box p']
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
          'openingHours': 'Mo-Su 00:00-23:59',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': city.name,
            'addressRegion': city.state,
            'addressCountry': 'IN'
          },
          ...(city.lat && city.lon ? { 'geo': { '@type': 'GeoCoordinates', 'latitude': city.lat, 'longitude': city.lon } } : {}),
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
            },
            {
              '@type': 'Question',
              'name': `What is the difference between incall and outcall escort service in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Incall escort service means you visit the advertiser at their location in ${city.name}. Outcall escort service means the advertiser comes to your location — hotel room, residence, or another agreed venue in ${city.name}. Each listing specifies the service type available. Contact the advertiser directly to confirm.` }
            },
            {
              '@type': 'Question',
              'name': `Is my personal information private when I contact an escort in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. Contacting an advertiser via Call or WhatsApp does not require you to register or share any personal details with Trusted Escort India. Your contact is direct and private between you and the advertiser in ${city.name}. We do not record or share contact interactions.` }
            },
            {
              '@type': 'Question',
              'name': `Can I book escort service in ${city.name} for a hotel room?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. Many escort service advertisers in ${city.name} offer outcall service to hotels across the city. Contact the advertiser directly via WhatsApp or Call to confirm hotel outcall availability, the areas of ${city.name} they cover, and timing. Always check hotel policies independently.` }
            },
            {
              '@type': 'Question',
              'name': `What should I do if an escort advertiser in ${city.name} asks for advance payment?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Never send advance payment to any escort advertiser in ${city.name} without meeting them in person first. Legitimate advertisers on Trusted Escort India do not require prepayment through digital wallets or unknown links. If any advertiser demands upfront payment, report them immediately using our contact form.` }
            },
            {
              '@type': 'Question',
              'name': `Are foreign or international escorts available in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Some escort advertisers in ${city.name} may be of foreign or international origin. Check each listing's profile details — nationality and ethnicity information is provided by advertisers who choose to share it. Use the category filters to search for specific escort types in ${city.name}.` }
            },
            {
              '@type': 'Question',
              'name': `What is the minimum age for escort advertisers on this platform in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `All escort service advertisers on Trusted Escort India, including in ${city.name}, must be 18 years of age or older. Our admin team verifies this during the listing approval process. Any listing suspected of involving a minor is immediately rejected and reported.` }
            },
            {
              '@type': 'Question',
              'name': `How quickly are new escort listings updated in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `New escort listings in ${city.name} are reviewed and approved by our admin team typically within 24 hours of submission. The ${city.name} page is updated in real time once a listing is approved — you will see the live count on this page reflect the current number of active, approved listings.` }
            },
            {
              '@type': 'Question',
              'name': `How do I choose the best escort service in ${city.name} for my requirements?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Read each listing's full profile — including photos, description, services offered, and contact method. Use the area filter to find escort service in a specific part of ${city.name}. Look for listings with a detailed description and clear contact information, as these are typically more reliable and professional.` }
            },
            {
              '@type': 'Question',
              'name': `What languages do escort service advertisers in ${city.name} speak?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Most escort service advertisers in ${city.name} speak Hindi and English. Depending on the city's demographics, some may speak regional languages — for example, Tamil in Chennai, Bengali in Kolkata, Kannada in Bangalore, or Gujarati in Ahmedabad. Language is indicated on profiles where advertisers have shared this information.` }
            },
            {
              '@type': 'Question',
              'name': `Is VIP or premium escort service available in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. Many advertisers in ${city.name} offer premium and VIP escort service — often featuring professional model escorts, high-discretion outcall service, and availability for corporate events, business dinners, and private parties. Use the category filter on the main ${city.name} listing page to find premium listings.` }
            },
            {
              '@type': 'Question',
              'name': `Can I see photos of the escort before contacting them in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. Every approved escort service listing in ${city.name} on Trusted Escort India includes at least one admin-verified photo. All profile images are checked during the admin approval process. Click any listing to view the full profile photo before making contact.` }
            },
            {
              '@type': 'Question',
              'name': `How is Trusted Escort India different from other escort directories in ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Unlike unmoderated directories, every single listing on Trusted Escort India for ${city.name} is manually admin-approved before going live. We reject fake, misleading, and low-quality ads. We also provide dedicated area-level pages for every locality within ${city.name}, making it easy to find verified escort service exactly where you need it.` }
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
      cityData: CITY_CONTENT[city.slug] || null,
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
      cityData: CITY_CONTENT[city.slug] || null,
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
    // Only show ads that specifically target this area (unique content per area page)
    const ads = await Ad.find({ status: 'approved', citySlug: city.slug, areaSlug: area.slug })
      .populate('advertiser', 'name')
      .sort({ createdAt: -1 });

    const allAreas = getAreasForCity(city.slug);
    const otherAreas = allAreas.filter(a => a.slug !== area.slug);

    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `https://trustedescort.in/escorts-service/${city.slug}/${area.slug}/#webpage`,
          'url': `https://trustedescort.in/escorts-service/${city.slug}/${area.slug}/`,
          'name': `Escort Service in ${area.name}, ${city.name}`,
          'description': `Find verified escort service in ${area.name}, ${city.name}. Admin-approved escort profiles — 100% genuine, safe & discreet.`,
          'speakable': {
            '@type': 'SpeakableSpecification',
            'cssSelector': ['.speakable-content', '.answer-box p', 'h1', '.seo-content-box p']
          }
        },
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
          'image': 'https://trustedescort.in/logo.png',
          'areaServed': {
            '@type': 'Place',
            'name': `${area.name}, ${city.name}`,
            'containedIn': { '@type': 'City', 'name': city.name }
          }
        },
        {
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': `How do I find escort service in ${area.name}, ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Browse the verified listings on this page for escort service in ${area.name}, ${city.name}. All ads are admin-approved. Tap the Call or WhatsApp button on any listing to contact the advertiser directly. No middlemen, no booking fees.` }
            },
            {
              '@type': 'Question',
              'name': `Are escort listings in ${area.name} verified and genuine?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. Every escort listing in ${area.name}, ${city.name} is manually reviewed by our admin team before going live. We reject fake, misleading or low-quality profiles. Only verified, genuine advertisers appear on this page.` }
            },
            {
              '@type': 'Question',
              'name': `How do I post an escort ad for ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Register free on Trusted Escort India, complete your profile, upload photos, select ${city.name} as your city, and submit for admin review. Your ad will appear on the ${city.name} page, including this ${area.name} sub-area page, within 24 hours.` }
            },
            {
              '@type': 'Question',
              'name': `Is escort service available 24/7 in ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Many escort service advertisers listed for ${area.name}, ${city.name} are available 24/7. Check each listing and contact the advertiser directly via Call or WhatsApp to confirm their availability and timing for your preferred date.` }
            },
            {
              '@type': 'Question',
              'name': `What types of escort services are available in ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Escort service listings in ${area.name}, ${city.name} include companionship, social escort, dinner date escort, event companion, and travel escort services. All services are legal. The category is clearly labelled on every listing card.` }
            },
            {
              '@type': 'Question',
              'name': `Is it safe to use escort service in ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `All listings shown here are admin-verified. We screen every advertiser before their listing goes live in ${area.name}, ${city.name}. Always exercise personal care, meet in public places initially, and never share financial information with unknown parties.` }
            },
            {
              '@type': 'Question',
              'name': `How do I contact an escort in ${area.name}, ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Click the Call or WhatsApp button on any approved listing on this page to connect directly with the escort advertiser in ${area.name}. There are no agents or intermediaries — you contact the advertiser at their number directly.` }
            },
            {
              '@type': 'Question',
              'name': `Can I post an escort ad specifically for ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. When posting your ad, select ${city.name} as your city. Your listing will appear on the main ${city.name} page and also on the ${area.name} sub-area page, maximising your visibility to users searching specifically in ${area.name}.` }
            },
            {
              '@type': 'Question',
              'name': `How much does escort service cost in ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Pricing for escort services in ${area.name}, ${city.name} is set individually by each advertiser. Contact the advertiser directly via the Call or WhatsApp button to discuss rates, availability, and terms. Our platform does not charge service users any fees.` }
            },
            {
              '@type': 'Question',
              'name': `How do I report a fake escort listing in ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Contact our support team and provide the listing details. We will investigate within 24 hours and remove it if it violates our guidelines. Helping us maintain quality in ${area.name}, ${city.name} benefits all genuine users on the platform.` }
            },
            {
              '@type': 'Question',
              'name': `Are there escort services in other areas of ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. Use the "Other Areas in ${city.name}" links at the top of this page to browse escort service in other localities of ${city.name}. You can also visit the main Escort Service in ${city.name} page for the full city listing.` }
            },
            {
              '@type': 'Question',
              'name': `Why is Trusted Escort India best for ${area.name} listings?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Trusted Escort India is the only escort service platform with dedicated area-level pages like this one for ${area.name}. Every listing is admin-approved, contact details are genuine, and the platform is free for users. We update ${area.name} listings regularly.` }
            },
            {
              '@type': 'Question',
              'name': `What is the difference between incall and outcall escort service in ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Incall escort service means you visit the advertiser at their location in ${area.name}. Outcall escort service means the advertiser comes to your location in ${area.name} — hotel room, residence, or another agreed venue. Each listing specifies which options are available. Contact the advertiser directly to confirm.` }
            },
            {
              '@type': 'Question',
              'name': `Can I get hotel room escort service in ${area.name}, ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. Many escort advertisers in ${area.name}, ${city.name} offer outcall service including delivery to hotels in the area. Contact the advertiser via Call or WhatsApp to confirm hotel outcall availability and the specific locations they cover within ${area.name}.` }
            },
            {
              '@type': 'Question',
              'name': `Is my identity protected when contacting an escort in ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. You contact advertisers in ${area.name} directly via Call or WhatsApp without creating an account or sharing personal details with Trusted Escort India. Your interaction is completely private between you and the advertiser.` }
            },
            {
              '@type': 'Question',
              'name': `What if an escort advertiser in ${area.name} asks for advance payment?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Never send advance payment to any escort advertiser in ${area.name} without meeting them first. Genuine advertisers on our platform do not demand prepayment via digital wallets or unknown links. Report any such request to our support team immediately.` }
            },
            {
              '@type': 'Question',
              'name': `Are international or foreign escorts available in ${area.name}, ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Some escort advertisers in ${area.name}, ${city.name} may be of foreign or international origin. Check each listing's profile for details on nationality and ethnicity, where the advertiser has chosen to share this information.` }
            },
            {
              '@type': 'Question',
              'name': `How do I choose the right escort service in ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Read the full profile for each listing in ${area.name} — photos, description, service type (incall/outcall), and contact method. Listings with detailed descriptions and clear photos are typically more reliable. Contact the advertiser with any specific questions before meeting.` }
            },
            {
              '@type': 'Question',
              'name': `What languages are spoken by escort advertisers in ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Most escort service advertisers in ${area.name}, ${city.name} communicate in Hindi and English. Some may speak additional regional languages depending on their background. Language details are shown on profiles where advertisers have chosen to include them.` }
            },
            {
              '@type': 'Question',
              'name': `How quickly are new escort listings updated for ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `New escort listings for ${area.name} are admin-reviewed and approved typically within 24 hours of submission. Once approved, listings appear live on this ${area.name} page immediately. The active listings count shown on this page is always up to date.` }
            },
            {
              '@type': 'Question',
              'name': `Is VIP escort service available in ${area.name}, ${city.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. Several advertisers in ${area.name}, ${city.name} offer VIP and premium escort services including model escorts, high-discretion outcall, and companion services for private events and corporate occasions. Check listing descriptions for premium service indicators.` }
            },
            {
              '@type': 'Question',
              'name': `Can I see photos before contacting an escort in ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Yes. Every approved listing in ${area.name} on Trusted Escort India includes at least one admin-verified photo. All images are reviewed during the approval process. Click any listing on this page to view the full profile including photos before contacting the advertiser.` }
            },
            {
              '@type': 'Question',
              'name': `What is the minimum age for escort advertisers in ${area.name}?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `All escort service advertisers listed for ${area.name}, ${city.name} must be 18 years or older. This is verified by our admin team during the listing approval process. Any listing suspected of involving a minor is immediately rejected and reported.` }
            },
            {
              '@type': 'Question',
              'name': `How is Trusted Escort India's ${area.name} page different from other escort sites?`,
              'acceptedAnswer': { '@type': 'Answer', 'text': `Trusted Escort India provides dedicated area-level pages like this one specifically for ${area.name}, ${city.name} — something most escort directories do not offer. Every listing is manually approved, photos are verified, and the platform is free for both users and advertisers. We focus on quality over quantity.` }
            }
          ]
        }
      ]
    });

    res.render('escorts-service/area', {
      title: `Escort Service in ${area.name}, ${city.name} | Trusted Escort India`,
      metaDescription: `Find verified escort service in ${area.name}, ${city.name}. Admin-approved escort profiles — 100% genuine, safe & discreet.`,
      metaKeywords: `escort service ${area.name.toLowerCase()}, escorts in ${area.name.toLowerCase()} ${city.name.toLowerCase()}, ${area.name.toLowerCase()} escort service`,
      canonical: `https://trustedescort.in/escorts-service/${city.slug}/${area.slug}/`,
      ogImage: 'https://trustedescort.in/logo.png',
      schema,
      city,
      area,
      ads,
      otherAreas,
      areaContent: getAreaContent(city.slug, area.slug),
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
      areaContent: getAreaContent(city.slug, area.slug),
      locationAds
    });
  }
});

// ── Individual Ad Profile ──────────────────────────────────────────────────
// Redirect non-trailing-slash to canonical form
router.get('/profile/:id', (req, res, next) => {
  if (!req.path.endsWith('/')) return res.redirect(301, `/escorts-service/profile/${req.params.id}/`);
  next();
});

router.get('/profile/:id/', async (req, res) => {
  try {
    const ad = await Ad.findOne({ _id: req.params.id, status: 'approved' })
      .populate('advertiser', 'name company');
    if (!ad) {
      return res.status(404).render('404', { title: 'Profile Not Found', noindex: true });
    }

    const profileUrl = `https://trustedescort.in/escorts-service/profile/${ad._id}/`;
    const imageUrl = ad.image || 'https://trustedescort.in/logo.png';
    const truncatedDesc = ad.description.length > 155
      ? ad.description.substring(0, 152) + '...'
      : ad.description;

    const cityObj = CITY_BY_SLUG[ad.citySlug] || null;
    const today = new Date().toISOString().split('T')[0];

    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ProfilePage',
          '@id': `${profileUrl}#webpage`,
          'url': profileUrl,
          'name': `${ad.title} — Escort Service in ${ad.city}`,
          'description': truncatedDesc,
          'datePublished': '2024-01-01',
          'dateModified': today,
          'inLanguage': 'en-IN',
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
            'addressRegion': cityObj ? cityObj.state : undefined,
            'addressCountry': 'IN'
          },
          ...(ad.aboutMe && ad.aboutMe.gender ? { 'gender': ad.aboutMe.gender } : {}),
          ...(ad.services && ad.services.length > 0 ? {
            'hasOccupation': {
              '@type': 'Occupation',
              'name': ad.category || 'Escort Service',
              'description': `Verified escort service in ${ad.city}, India.`
            }
          } : {}),
          'url': profileUrl,
          'worksFor': { '@type': 'Organization', 'name': 'Trusted Escort India', 'url': 'https://trustedescort.in' }
        }
      ]
    });

    res.render('escorts-service/profile', {
      title: `${ad.title} — Escort Service in ${ad.city} | Trusted Escort India`,
      metaDescription: truncatedDesc,
      metaKeywords: `escort service ${(ad.city || 'india').toLowerCase()}, ${(ad.title || '').toLowerCase()}, verified escort ${(ad.city || '').toLowerCase()}, call girls ${(ad.city || '').toLowerCase()}`,
      canonical: profileUrl,
      ogImage: imageUrl,
      ogType: 'profile',
      schema,
      city: cityObj,
      ad
    });
  } catch (err) {
    console.error('Profile page error:', err.message);
    res.status(404).render('404', { title: 'Profile Not Found', noindex: true });
  }
});

module.exports = router;
