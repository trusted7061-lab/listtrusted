import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllCities, majorCities } from '../services/locationsData'

function Home() {
  const navigate = useNavigate()
  const [searchCity, setSearchCity] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Get all cities for search functionality
  const allCities = useMemo(() => getAllCities(), [])
  
  // Display cities for homepage grid (major cities only)
  const displayCities = majorCities
  
  const filteredCities = allCities.filter(city => 
    city.toLowerCase().includes(searchCity.toLowerCase())
  )
  
  const handleSearch = (cityName = null) => {
    const targetCity = cityName || filteredCities[0]
    if (targetCity) {
      navigate(`/escorts/in/${targetCity.toLowerCase().replace(/\s+/g, '-')}`)
      setSearchCity('')
      setShowSuggestions(false)
    }
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredCities.length > 0) {
      handleSearch()
    }
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const reasons = [
    {
      icon: '🔐',
      title: 'Absolute Discretion',
      description: 'Your privacy is our top priority. Complete confidentiality guaranteed.',
    },
    {
      icon: '👑',
      title: 'Luxury Experience',
      description: 'Premium service tailored to your exact desires and preferences.',
    },
    {
      icon: '⏰',
      title: '24/7 Availability',
      description: 'Available whenever you need us, day or night, all year round.',
    },
  ]

  const testimonials = [
    {
      name: 'Rahul',
      text: 'An absolutely premium service. The discretion and professionalism are unmatched.',
      rating: 5,
    },
    {
      name: 'Prince',
      text: 'Incredible experience from start to finish. Highly recommended.',
      rating: 5,
    },
    {
      name: 'Devesh',
      text: 'Exceeded all my expectations. Outstanding attention to detail.',
      rating: 5,
    },
  ]

  const [openFAQIndex, setOpenFAQIndex] = useState(null)

  const faqs = [
    {
      question: 'What is Trusted Escort?',
      answer: 'Trusted Escort is a premium escortship service connecting distinguished clients with sophisticated, verified escorts across major cities in India. We provide discreet, professional services for social events, business functions, travel, and personal occasions.',
    },
    {
      question: 'How do I book a companion?',
      answer: 'Browse our escorts page, select your preferred companion, and contact us via WhatsApp or our booking page. Our team will assist you with availability, rates, and special requests to ensure a seamless experience.',
    },
    {
      question: 'Are all escorts verified?',
      answer: 'Yes, all our escorts undergo a thorough verification process. Verified escorts are marked with a ✓ badge on their profiles, ensuring authenticity, professionalism, and quality of service.',
    },
    {
      question: 'What cities do you serve?',
      answer: 'We currently operate in 23 major Indian cities including Mumbai, Delhi, Bangalore, Hyderabad, Pune, Goa, Chennai, Kolkata, Chandigarh, Jaipur, Indore, Ahmedabad, Surat, Lucknow, Nagpur, and more.',
    },
    {
      question: 'What are the payment methods?',
      answer: 'We accept various payment methods including bank transfers, digital payments (UPI, Paytm, Google Pay), and cash. Payment terms and methods will be discussed during booking confirmation.',
    },
    {
      question: 'Can I cancel or reschedule a booking?',
      answer: 'Yes, cancellations and rescheduling are possible. Please notify us at least 24 hours in advance. Cancellation policies vary based on booking type and timing.',
    },
    {
      question: 'How is my privacy protected?',
      answer: 'We maintain absolute discretion. All client information is confidential and encrypted. We never share personal details with third parties. Our escorts are also bound by strict confidentiality agreements.',
    },
    {
      question: 'What services are offered?',
      answer: 'Our escorts provide social escortship services including dinner dates, corporate events, travel escortship, cultural events, shopping, entertainment, and more. Specific services are listed on each profile.',
    },
    {
      question: 'Are there minimum booking durations?',
      answer: 'Yes, minimum booking durations vary by service type. Typically, hourly bookings have a 2-hour minimum. Specific requirements are listed on each companion\'s profile.',
    },
    {
      question: 'Is communication secure?',
      answer: 'Yes, all communications through our platform are secure. We recommend using WhatsApp for booking inquiries as it offers end-to-end encryption.',
    },
    {
      question: 'What is the age requirement?',
      answer: 'You must be 18 years or older to use our services. Age verification is mandatory. All our escorts are also 18+ and verified.',
    },
    {
      question: 'How do I contact customer support?',
      answer: 'Our support team is available 24/7 via WhatsApp, phone, or through our contact form. We respond within minutes to ensure your needs are met promptly.',
    },
  ]

  const toggleFAQ = (index) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index)
  }

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>Trusted Escort | Exclusive Escortship, Redefined</title>
        <meta name="title" content="Trusted Escort | Exclusive Escortship, Redefined" />
        <meta name="description" content="Discreet, sophisticated, unforgettable escortship services. Premium escort companions in Mumbai, Delhi, Bangalore, and major Indian cities. Available 24/7." />
        <meta name="keywords" content="escort service, premium escorts, luxury companionship, elite escorts, trusted escort, high-class escorts India, Mumbai escorts, Delhi escorts, Bangalore escorts" />
        <link rel="canonical" href="https://trustedescort.in/" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://trustedescort.in/" />
        <meta property="og:title" content="Trusted Escort | Exclusive Escortship, Redefined" />
        <meta property="og:description" content="Discreet, sophisticated, unforgettable escortship services. Premium escort companions available 24/7." />
        <meta property="og:image" content="https://trustedescort.in/og-image.jpg" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:site_name" content="Trusted Escort" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://trustedescort.in/" />
        <meta property="twitter:title" content="Trusted Escort | Exclusive Escortship, Redefined" />
        <meta property="twitter:description" content="Discreet, sophisticated, unforgettable escortship services. Premium escort companions available 24/7." />
        <meta property="twitter:image" content="https://www.trustedescort.in/og-image.jpg" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="Trusted Escort" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/profiles/Mumbai/profile-1.jpg" as="image" />
        <link rel="preload" href="/images/profiles/Delhi/profile-1.jpg" as="image" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Trusted Escort",
            "url": "https://www.trustedescort.in",
            "logo": "https://www.trustedescort.in/logo.png",
            "description": "Premium escort service providing discreet, sophisticated companionship across major Indian cities. Elite escorts available 24/7.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "IN",
              "addressLocality": "Mumbai"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Service",
              "availableLanguage": ["English", "Hindi"],
              "hoursAvailable": "Mo-Su 00:00-23:59"
            },
            "sameAs": [
              "https://www.trustedescort.in/about",
              "https://www.trustedescort.in/contact"
            ]
          })}
        </script>
        
        {/* WebSite Schema with SearchAction */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Trusted Escort",
            "url": "https://trusted-six.vercel.app",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://trusted-six.vercel.app/escorts/in/{search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Hero Banner Background Image */}
        <div className="absolute inset-0 -z-20">
          <img 
            src="/images/hero-banner.png" 
            alt="Hero Banner" 
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-20 left-10 w-72 h-72 bg-gold/5 rounded-full filter blur-3xl"
          />
          <motion.div
            animate={{ x: [20, -20, 20] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full filter blur-3xl"
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
              <span className="block text-white mb-2">Exclusive Escortship,</span>
              <span className="gradient-text">Redefined.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 font-light"
          >
            Discreet, sophisticated, unforgettable.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="max-w-2xl mx-auto mb-8 relative"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by city name..."
                value={searchCity}
                onChange={(e) => {
                  setSearchCity(e.target.value)
                  setShowSuggestions(true)
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-12 pr-16 py-4 bg-dark-card/80 backdrop-blur-md border border-gold/30 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                {searchCity && filteredCities.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSearch()}
                    className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-full text-sm font-semibold transition-colors mr-2"
                  >
                    Search
                  </motion.button>
                )}
                {searchCity && (
                  <button
                    onClick={() => {
                      setSearchCity('')
                      setShowSuggestions(false)
                    }}
                    className="text-gray-400 hover:text-gold transition-colors p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchCity && filteredCities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-50 w-full mt-2 bg-dark-card/95 backdrop-blur-md border border-gold/30 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
              >
                {filteredCities.map((city, index) => (
                  <button
                    key={city}
                    onClick={() => handleSearch(city)}
                    className="w-full block px-6 py-3 hover:bg-gold/10 transition-colors border-b border-gold/10 last:border-b-0 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gold">📍</span>
                        <span className="text-white font-medium">{city}</span>
                      </div>
                      <span className="text-gold text-sm">→</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {showSuggestions && searchCity && filteredCities.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-50 w-full mt-2 bg-dark-card/95 backdrop-blur-md border border-gold/30 rounded-2xl shadow-2xl p-6 text-center"
              >
                <p className="text-gray-400">No cities found matching "{searchCity}"</p>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 justify-center"
          >
            <Link to="/escorts">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold"
              >
                View Escorts
              </motion.button>
            </Link>
            <Link to="/advertiser-signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline"
              >
                Post Your Ad
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-dark-card border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2 variants={itemVariants} className="section-title">
              Why Choose Us
            </motion.h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {reasons.map((reason, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="card-glass p-8 text-center"
              >
                <div className="text-5xl mb-4">{reason.icon}</div>
                <h3 className="text-xl font-serif font-bold text-gold mb-3">
                  {reason.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {reason.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-dark-bg border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2 variants={itemVariants} className="section-title">
              Client Testimonials
            </motion.h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card-glass p-8 flex flex-col"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="text-gold"
                    >
                      ★
                    </motion.span>
                  ))}
                </div>
                <p className="text-gray-300 text-sm mb-4 flex-grow">
                  "{testimonial.text}"
                </p>
                <p className="font-serif font-bold text-gold text-sm">
                  — {testimonial.name}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-dark-card border-t border-gold/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2 variants={itemVariants} className="section-title">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-400 text-lg mt-4">
              Find answers to common questions about our premium escort services
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Left Column - First 6 FAQs */}
            <div className="space-y-3">
              {faqs.slice(0, 6).map((faq, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="card-glass overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gold/5 transition-colors"
                  >
                    <span className="font-semibold text-white pr-4">
                      {faq.question}
                    </span>
                    <motion.svg
                      animate={{ rotate: openFAQIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-5 h-5 text-gold flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {openFAQIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-4 text-gray-400 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Right Column - Last 6 FAQs */}
            <div className="space-y-3">
              {faqs.slice(6, 12).map((faq, index) => (
                <motion.div
                  key={index + 6}
                  variants={itemVariants}
                  className="card-glass overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index + 6)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gold/5 transition-colors"
                  >
                    <span className="font-semibold text-white pr-4">
                      {faq.question}
                    </span>
                    <motion.svg
                      animate={{ rotate: openFAQIndex === index + 6 ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-5 h-5 text-gold flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {openFAQIndex === index + 6 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-4 text-gray-400 leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to="/faq">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline"
              >
                View All FAQs
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-20 bg-dark-card border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.h2 variants={itemVariants} className="section-title">
              Our Locations
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-400 text-lg mt-4">
              Premium escort services available in major cities across India
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {displayCities.map((city, index) => (
              <motion.div key={city} variants={itemVariants}>
                <Link to={`/escorts/in/${city.toLowerCase().replace(/\s+/g, '-')}`}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="card-glass p-4 text-center cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-dark/95 via-dark-card/90 to-dark/95 group-hover:from-dark-card/80 group-hover:via-gold/10 group-hover:to-dark-card/80 transition-all"></div>
                    <div className="relative z-10 text-2xl mb-2">📍</div>
                    <h3 className="relative z-10 text-sm font-semibold text-white group-hover:text-gold transition-colors">
                      {city}
                    </h3>
                    <div className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                      <span className="text-xs text-gold">View Escorts →</span>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Action: View All */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-gray-400 text-sm mb-4">
              Click any city to view available escorts in that location
            </p>
            <Link to="/escorts">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline"
              >
                View All Escorts
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark-card border-t border-gold/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="section-title">Ready for an Unforgettable Experience?</h2>
            <p className="text-xl text-gray-300">
              Book your exclusive escortship today and discover the difference luxury makes.
            </p>
            <Link to="/booking">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold"
              >
                Book Your Companion Now
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default Home