const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const { CITIES, CITY_BY_SLUG } = require('../config/cities');

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
          '@id': 'https://trustedesco.com/#website',
          'url': 'https://trustedesco.com',
          'name': 'Trusted Escort India',
          'description': 'Find trusted escorts service near me across India',
          'potentialAction': {
            '@type': 'SearchAction',
            'target': 'https://trustedesco.com/search?q={search_term_string}',
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'LocalBusiness',
          '@id': 'https://trustedesco.com/#business',
          'name': 'Trusted Escort India',
          'description': 'Premium escorts service near you across India. Verified escort ads in all major cities.',
          'url': 'https://trustedesco.com',
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
            { '@type': 'City', 'name': 'Jaipur' }
          ]
        },
        {
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'How do I find escorts service near me?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Simply browse our platform to find verified escort service listings near your location. We cover all major cities in India including Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Goa and more. Every profile is admin-verified before going live.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Are escort profiles on Trusted Escort India verified?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes. Every profile and advertisement on our platform is manually reviewed and approved by our admin team before going live, ensuring authenticity, quality and safety.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Which cities are covered for escort services in India?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'We cover all major cities in India: Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Goa, Chandigarh, Lucknow, Surat, Indore, and many more.'
              }
            },
            {
              '@type': 'Question',
              'name': 'How do I post an escort service ad?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Register as an advertiser, submit your profile details and photos, and our admin team will review and approve your listing within 24 hours.'
              }
            }
          ]
        }
      ]
    });

    res.render('landing', {
      title: 'Escorts Service Near Me | Trusted Escort India',
      metaDescription: 'Find trusted escorts service near you. Browse 500+ verified escort profiles across Delhi, Mumbai, Bangalore, Hyderabad & all major Indian cities. Safe, discreet & premium escort services available 24/7.',
      metaKeywords: 'escorts service near me, escort service india, escorts in delhi, escorts in mumbai, escorts in bangalore, escort girls india, premium escorts, female escorts india, call girls near me, companion service india, escort service hyderabad, escort service chennai',
      canonical: 'https://trustedesco.com',
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

module.exports = router;
