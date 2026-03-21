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

module.exports = router;
