const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const { CITIES, CITY_BY_SLUG } = require('../config/cities');

// ── Search ────────────────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  const raw = (req.query.q || '').trim();
  const cityFilter = (req.query.city || '').trim();
  const stateFilter = (req.query.state || '').trim();
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 12;

  // Sanitise: strip characters that would make a regex dangerous
  const q = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  try {
    const filter = { status: 'approved' };
    if (q) {
      filter.$or = [
        { title:       { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category:    { $regex: q, $options: 'i' } },
        { city:        { $regex: q, $options: 'i' } },
        { services:    { $regex: q, $options: 'i' } },
      ];
    }
    if (cityFilter && CITY_BY_SLUG[cityFilter]) {
      filter.citySlug = cityFilter;
    } else if (stateFilter) {
      const stateSlugs = CITIES.filter(c => c.state === stateFilter).map(c => c.slug);
      if (stateSlugs.length) filter.citySlug = { $in: stateSlugs };
    }

    const total   = await Ad.countDocuments(filter);
    const results = await Ad.find(filter)
      .populate('advertiser', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.render('search', {
      title: raw ? `"${raw}" — Search Results | Trusted Escort India` : 'Search | Trusted Escort India',
      metaDescription: `Search results for "${raw}" on Trusted Escort India.`,
      canonical: raw ? `https://trustedescort.in/search?q=${encodeURIComponent(raw)}` : 'https://trustedescort.in/search',
      noindex: !!(raw || stateFilter || cityFilter),
      q: raw,
      cityFilter,
      stateFilter,
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      cities: CITIES,
    });
  } catch (err) {
    console.error(err);
    res.render('search', {
      title: 'Search | Trusted Escort India',
      metaDescription: 'Search escort listings.',
      canonical: 'https://trustedescort.in/search',
      q: raw, cityFilter, stateFilter: '', results: [], total: 0, page: 1, totalPages: 0, limit, cities: CITIES,
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const approvedAds = await Ad.find({ status: 'approved' })
      .populate('advertiser', 'name company')
      .sort({ createdAt: -1 })
      .limit(6);

    const schema = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://trustedescort.in/#website',
          'url': 'https://trustedescort.in',
          'name': 'Trusted Escort India',
          'description': 'Find trusted escorts service near me in India — verified profiles across 75+ cities',
          'inLanguage': 'en-IN',
          'potentialAction': {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': 'https://trustedescort.in/escorts-service/{search_term_string}/'
            },
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'WebPage',
          '@id': 'https://trustedescort.in/#webpage',
          'url': 'https://trustedescort.in',
          'name': 'Escorts Service Near Me | Trusted Escort India',
          'isPartOf': { '@id': 'https://trustedescort.in/#website' },
          'about': { '@id': 'https://trustedescort.in/#business' },
          'speakable': {
            '@type': 'SpeakableSpecification',
            'cssSelector': ['.speakable-content', '.answer-box p', 'h1', '.hero-answer']
          }
        },
        {
          '@type': 'Organization',
          '@id': 'https://trustedescort.in/#organization',
          'name': 'Trusted Escort India',
          'url': 'https://trustedescort.in',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://trustedescort.in/logo.png',
            'width': 200,
            'height': 60
          },
          'sameAs': ['https://trustedescort.in']
        },
        {
          '@type': 'LocalBusiness',
          '@id': 'https://trustedescort.in/#business',
          'name': 'Trusted Escort India',
          'description': 'India\'s most trusted escort service directory. Verified escort profiles across 75+ cities — Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata and more.',
          'url': 'https://trustedescort.in',
          'image': 'https://trustedescort.in/logo.png',
          'priceRange': 'Free to browse',
          'areaServed': [
            { '@type': 'City', 'name': 'Delhi' },
            { '@type': 'City', 'name': 'Mumbai' },
            { '@type': 'City', 'name': 'Bangalore' },
            { '@type': 'City', 'name': 'Hyderabad' },
            { '@type': 'City', 'name': 'Chennai' },
            { '@type': 'City', 'name': 'Kolkata' },
            { '@type': 'City', 'name': 'Pune' },
            { '@type': 'City', 'name': 'Ahmedabad' },
            { '@type': 'City', 'name': 'Goa' },
            { '@type': 'City', 'name': 'Jaipur' },
            { '@type': 'City', 'name': 'Chandigarh' },
            { '@type': 'City', 'name': 'Lucknow' }
          ]
        },
        {
          '@type': 'HowTo',
          'name': 'How to Find Escort Service Near Me in India',
          'description': 'Step-by-step guide to finding verified escort service listings in your city on Trusted Escort India',
          'totalTime': 'PT2M',
          'step': [
            {
              '@type': 'HowToStep',
              'position': 1,
              'name': 'Choose Your City',
              'text': 'Browse the city grid below and select your city from 75+ Indian cities. Metro cities like Delhi, Mumbai, Bangalore and Hyderabad have the most listings.',
              'url': 'https://trustedescort.in/#cities'
            },
            {
              '@type': 'HowToStep',
              'position': 2,
              'name': 'Browse Verified Listings',
              'text': 'View all admin-approved escort service profiles for your selected city. Every listing is manually reviewed before publishing.',
              'url': 'https://trustedescort.in/escorts-service/'
            },
            {
              '@type': 'HowToStep',
              'position': 3,
              'name': 'Contact Directly',
              'text': 'Tap the Call or WhatsApp button on any listing to contact the advertiser directly — no middlemen, no booking fees.',
              'url': 'https://trustedescort.in/escorts-service/'
            }
          ]
        },
        {
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'How do I find escorts service near me in India?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'To find escorts service near you in India, visit Trusted Escort India and select your city from 75+ cities. Each city page lists admin-verified escort profiles with direct call and WhatsApp contact. No registration needed to browse.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Are escort profiles on Trusted Escort India verified?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. Every escort profile and advertisement on Trusted Escort India is manually reviewed and approved by our admin team before going live. Fake or unverified listings are rejected. This makes us India\'s most reliable escort service directory.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Which cities in India have escort service listings?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Trusted Escort India covers 75+ cities including Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Goa, Chandigarh, Lucknow, Surat, Indore, Bhopal, Nagpur, Kochi, Coimbatore and many more across all Indian states.'
              }
            },
            {
              '@type': 'Question',
              'name': 'How do I post an escort service ad on Trusted Escort India?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Register as an advertiser, fill in your profile details and service description, upload photos, select your city, then submit for admin review. Your listing goes live within 24 hours of approval.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is escort service near me available 24/7?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. Listings on Trusted Escort India are available to browse 24 hours a day, 7 days a week. Individual escort service availability depends on each advertiser. Contact details are shown directly on approved listings.'
              }
            },
            {
              '@type': 'Question',
              'name': 'What is the best escort service platform in India?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Trusted Escort India is India\'s most trusted escort service platform. With 500+ admin-verified listings across 75+ cities, direct contact via call or WhatsApp, and free browsing — it is the top-rated escort directory in India.'
              }
            }
          ]
        }
      ]
    });

    res.render('landing', {
      title: 'Escorts Service Near Me in India | Trusted Escort India',
      metaDescription: 'Find trusted escorts service near you in India. Browse 500+ verified escort profiles across Delhi, Mumbai, Bangalore, Hyderabad, Chennai & 70+ more cities. Admin-approved, safe & discreet. Free to browse.',
      metaKeywords: 'escorts service near me, escort service india, escorts in delhi, escorts in mumbai, escorts in bangalore, escort service near me, call girls near me india, female escorts india, verified escort service, escort directory india',
      canonical: 'https://trustedescort.in',
      ogImage: 'https://trustedescort.in/logo.png',
      schema,
      ads: approvedAds,
      cities: CITIES
    });
  } catch (err) {
    console.error(err);
    res.render('landing', {
      title: 'Escorts Service Near Me | Trusted Escort India',
      metaDescription: 'Find trusted escorts service near you across India.',
      ads: [],
      cities: CITIES
    });
  }
});

// ── Static pages ─────────────────────────────────────────────────────────────
router.get('/about', (req, res) => {
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': 'https://trustedescort.in/about#webpage',
    'url': 'https://trustedescort.in/about',
    'name': 'About Us — Trusted Escort India',
    'description': "Learn about Trusted Escort India — India's most trusted verified escort service directory covering 75+ cities.",
    'mainEntity': {
      '@type': 'Organization',
      'name': 'Trusted Escort India',
      'url': 'https://trustedescort.in',
      'description': "India's most trusted platform for verified escort service listings. Browse admin-approved escort profiles across 75+ cities.",
      'founded': '2024'
    }
  });

  res.render('pages/about', {
    title: 'About Us | Trusted Escort India',
    metaDescription: "Learn about Trusted Escort India — India's most trusted verified escort service directory covering 75+ cities.",
    canonical: 'https://trustedescort.in/about',
    schema
  });
});

router.get('/contact', (req, res) => {
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': 'https://trustedescort.in/contact#webpage',
    'url': 'https://trustedescort.in/contact',
    'name': 'Contact Us — Trusted Escort India',
    'description': 'Get in touch with the Trusted Escort India team.',
    'mainEntity': {
      '@type': 'Organization',
      'name': 'Trusted Escort India',
      'contactPoint': {
        '@type': 'ContactPoint',
        '@id': 'https://trustedescort.in/contact#contactpoint',
        'contactType': 'Customer Support',
        'email': 'support@trustedescort.in',
        'availableLanguage': 'en'
      }
    }
  });

  res.render('pages/contact', {
    title: 'Contact Us | Trusted Escort India',
    metaDescription: 'Get in touch with the Trusted Escort India team. Support, abuse reports and business enquiries.',
    canonical: 'https://trustedescort.in/contact',
    schema
  });
});

router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.render('pages/contact', {
      title: 'Contact Us | Trusted Escort India',
      metaDescription: 'Contact Trusted Escort India.',
      canonical: 'https://trustedescort.in/contact',
      error: 'Please fill in all fields.',
    });
  }
  console.log('[contact form]', { name, email, subject, message: message.slice(0, 100) });
  res.render('pages/contact', {
    title: 'Contact Us | Trusted Escort India',
    metaDescription: 'Contact Trusted Escort India.',
    canonical: 'https://trustedescort.in/contact',
    success: "Thank you! We've received your message and will reply within 24 hours.",
  });
});

router.get('/privacy-policy', (req, res) => {
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://trustedescort.in/privacy-policy#webpage',
    'url': 'https://trustedescort.in/privacy-policy',
    'name': 'Privacy Policy — Trusted Escort India',
    'description': 'Read the Trusted Escort India privacy policy — how we collect, use and protect your data.',
    'mainEntity': {
      '@type': 'Organization',
      'name': 'Trusted Escort India',
      'url': 'https://trustedescort.in'
    }
  });

  res.render('pages/privacy-policy', {
    title: 'Privacy Policy | Trusted Escort India',
    metaDescription: 'Read the Trusted Escort India privacy policy — how we collect, use and protect your data.',
    canonical: 'https://trustedescort.in/privacy-policy',
    schema
  });
});

router.get('/terms', (req, res) => {
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://trustedescort.in/terms#webpage',
    'url': 'https://trustedescort.in/terms',
    'name': 'Terms & Conditions — Trusted Escort India',
    'description': 'Read the Trusted Escort India terms and conditions of use.',
    'mainEntity': {
      '@type': 'Organization',
      'name': 'Trusted Escort India',
      'url': 'https://trustedescort.in'
    }
  });

  res.render('pages/terms', {
    title: 'Terms & Conditions | Trusted Escort India',
    metaDescription: 'Read the Trusted Escort India terms and conditions of use.',
    canonical: 'https://trustedescort.in/terms',
    schema
  });
});

router.get('/age-verification', (req, res) => {
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://trustedescort.in/age-verification#webpage',
    'url': 'https://trustedescort.in/age-verification',
    'name': 'Age Verification — Adults 18+ Only',
    'description': 'Trusted Escort India is strictly for adults aged 18 and above. Read our age verification and child protection policy.'
  });

  res.render('pages/age-verification', {
    title: 'Age Verification — Adults 18+ Only | Trusted Escort India',
    metaDescription: 'Trusted Escort India is strictly for adults aged 18 and above. Read our age verification and child protection policy.',
    canonical: 'https://trustedescort.in/age-verification',
    noindex: true,
    schema
  });
});

router.get('/help-center', (req, res) => {
  const schema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://trustedescort.in/help-center#webpage',
    'url': 'https://trustedescort.in/help-center',
    'name': 'Help Center — Trusted Escort India',
    'description': 'Browse frequently asked questions and get help with browsing, posting ads, accounts and safety on Trusted Escort India.'
  });

  res.render('pages/help-center', {
    title: 'Help Center | Trusted Escort India',
    metaDescription: 'Browse frequently asked questions and get help with browsing, posting ads, accounts and safety on Trusted Escort India.',
    canonical: 'https://trustedescort.in/help-center',
    schema
  });
});

module.exports = router;
