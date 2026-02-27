import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { defaultEscorts } from '../services/escortData'
import { majorCities } from '../services/locationsData'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cityImages = {
  Mumbai: '🌆', Delhi: '🏛️', Bangalore: '🌿', Hyderabad: '🕌',
  Pune: '🌄', Goa: '🏖️', Chennai: '🎭', Kolkata: '🌺',
  Chandigarh: '🌸', Jaipur: '🏰', Indore: '🌟', Ahmedabad: '🏙️',
  Surat: '💎', Lucknow: '🕍', Nagpur: '🍊', Visakhapatnam: '⚓',
  Bhopal: '🌊', Patna: '🏯', Vadodara: '🎨', Agra: '🕌',
  Nashik: '🍇', Kochi: '⛵', Coimbatore: '🌾', Thane: '🏘️',
}

const featuredEscorts = defaultEscorts.slice(0, 6)

const features = [
  {
    icon: '✓',
    title: 'Verified Profiles',
    desc: 'Every companion on our platform is personally verified for authenticity and safety.',
  },
  {
    icon: '🔒',
    title: '100% Discreet',
    desc: 'Your privacy is our top priority. All interactions are completely confidential.',
  },
  {
    icon: '⭐',
    title: 'Premium Quality',
    desc: 'Only the highest-calibre companions with verified reviews and ratings.',
  },
  {
    icon: '📞',
    title: '24/7 Support',
    desc: 'Our dedicated support team is available around the clock to assist you.',
  },
  {
    icon: '🌍',
    title: 'Pan-India Coverage',
    desc: 'Companions available across 500+ cities and locations throughout India.',
  },
  {
    icon: '⚡',
    title: 'Instant Booking',
    desc: 'Connect with companions quickly — most respond within minutes.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Browse Companions',
    desc: 'Explore verified profiles in your city. Filter by location, services, and availability.',
  },
  {
    number: '02',
    title: 'Connect Directly',
    desc: 'Contact your chosen companion via call or WhatsApp for a private conversation.',
  },
  {
    number: '03',
    title: 'Enjoy Your Time',
    desc: 'Meet your companion at a time and place of your choosing, fully discreet.',
  },
]

const stats = [
  { value: '10,000+', label: 'Verified Companions' },
  { value: '500+', label: 'Cities Covered' },
  { value: '50,000+', label: 'Happy Clients' },
  { value: '4.8★', label: 'Average Rating' },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCities, setFilteredCities] = useState(majorCities.slice(0, 24))

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredCities(
        majorCities.filter(c =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 24)
      )
    } else {
      setFilteredCities(majorCities.slice(0, 24))
    }
  }, [searchQuery])

  const citySlug = (city) => city.toLowerCase().replace(/\s+/g, '-')

  return (
    <>
      <Helmet>
        <title>TrustedEsco – Premium Escort Services Across India | Verified Companions</title>
        <meta
          name="description"
          content="India's most trusted escort directory. Browse verified companion profiles in Mumbai, Delhi, Bangalore, Hyderabad, Pune, Goa and 500+ cities. Discreet, safe & premium."
        />
        <meta name="keywords" content="escort service India, verified escorts, companion Mumbai, escort Delhi, call girls Bangalore, premium escort directory India" />
        <link rel="canonical" href="https://trustedesco.in/" />
        <meta property="og:title" content="TrustedEsco – Premium Escort Services Across India" />
        <meta property="og:description" content="Browse verified companion profiles across 500+ Indian cities. Discreet, safe, and premium." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://trustedesco.in/" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'TrustedEsco',
          url: 'https://trustedesco.in',
          description: 'Premium escort directory across India with verified companion profiles.',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://trustedesco.in/escorts?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        })}</script>
      </Helmet>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-bg">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/60 via-dark-bg/40 to-dark-bg" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold text-sm uppercase tracking-widest mb-4 font-sans">
              India's Most Trusted Escort Directory
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your Perfect{' '}
              <span className="text-gold">Companion</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Browse thousands of verified, premium companion profiles across 500+ cities in India.
              Discreet, safe, and always available.
            </p>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-8">
              <input
                type="text"
                placeholder="Search city — Mumbai, Delhi, Bangalore…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 px-5 py-3 rounded-lg bg-dark-card border border-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
              />
              <Link
                to={searchQuery ? `/escorts/in/${citySlug(searchQuery)}` : '/escorts'}
                className="btn-gold px-7 py-3 rounded-lg text-sm font-semibold whitespace-nowrap"
              >
                Browse Now
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
              {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Goa'].map(city => (
                <Link
                  key={city}
                  to={`/escorts/in/${citySlug(city)}`}
                  className="px-3 py-1 border border-gold/20 rounded-full hover:border-gold/60 hover:text-gold transition-colors"
                >
                  {city}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <div className="w-px h-12 bg-gradient-to-b from-gold/60 to-transparent mx-auto" />
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-dark-card border-y border-gold/10 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map(({ value, label }) => (
              <motion.div key={label} variants={fadeUp}>
                <p className="font-serif text-3xl md:text-4xl font-bold text-gold">{value}</p>
                <p className="text-gray-400 text-sm mt-1">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED COMPANIONS ── */}
      <section className="py-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-gold text-xs uppercase tracking-widest mb-3">Hand-Picked for You</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Featured <span className="text-gold">Companions</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Meet some of our top-rated verified companions, each ready to make your experience unforgettable.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {featuredEscorts.map(escort => (
              <motion.div key={escort.id} variants={fadeUp}>
                <Link to={`/escorts/${escort.id}`} className="block card-glass overflow-hidden group hover:border-gold/50 transition-all duration-300">
                  <div className="relative overflow-hidden h-64">
                    <img
                      src={escort.image}
                      alt={`${escort.name} – companion in ${escort.location}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = '/images/placeholder.jpg' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />
                    {escort.verified && (
                      <span className="absolute top-3 right-3 bg-gold text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                    <span className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded-full font-medium ${escort.availability === 'Available' ? 'bg-green-500/90 text-white' : 'bg-yellow-500/90 text-black'}`}>
                      {escort.availability}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-serif text-xl font-semibold text-white group-hover:text-gold transition-colors">
                        {escort.name}, <span className="text-gold/80 font-sans text-sm font-normal">{escort.age}</span>
                      </h3>
                      <span className="text-yellow-400 text-sm">★ {escort.rating}</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-3 flex items-center gap-1">
                      <span>📍</span> {escort.location}
                      <span className="mx-2">·</span>
                      <span>⚡ {escort.responseTime}</span>
                    </p>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-4">{escort.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {escort.services.slice(0, 3).map(s => (
                        <span key={s} className="text-xs border border-gold/20 text-gold/70 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-12">
            <Link to="/escorts" className="btn-outline px-8 py-3 rounded-lg text-sm font-semibold">
              View All Companions →
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-dark-card">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-gold text-xs uppercase tracking-widest mb-3">Simple & Easy</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              How It <span className="text-gold">Works</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Get started in three simple steps and enjoy a seamless, discreet experience.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="relative card-glass p-8 text-center"
              >
                <p className="font-serif text-6xl font-bold text-gold/15 absolute top-4 right-6 select-none">
                  {step.number}
                </p>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-5">
                    <span className="text-gold font-serif font-bold text-lg">{i + 1}</span>
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BROWSE BY CITY ── */}
      <section className="py-20 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-gold text-xs uppercase tracking-widest mb-3">500+ Cities Covered</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Browse by <span className="text-gold">City</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Find verified companions in your city. We cover every major metro and tier-2 city across India.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {filteredCities.map(city => (
              <motion.div key={city} variants={fadeUp}>
                <Link
                  to={`/escorts/in/${citySlug(city)}`}
                  className="card-glass p-4 flex flex-col items-center text-center hover:border-gold/50 hover:bg-dark-hover transition-all duration-300 group"
                >
                  <span className="text-2xl mb-2">{cityImages[city] || '🏙️'}</span>
                  <span className="text-white text-sm font-medium group-hover:text-gold transition-colors">
                    {city}
                  </span>
                  <span className="text-gray-500 text-xs mt-0.5">View escorts</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-10">
            <Link to="/escorts" className="btn-gold px-8 py-3 rounded-lg text-sm font-semibold">
              Browse All Cities
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-20 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-gold text-xs uppercase tracking-widest mb-3">Our Promise</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-gold">TrustedEsco</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We set the gold standard in companion services — verified, discreet, and premium every time.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map(feat => (
              <motion.div
                key={feat.title}
                variants={fadeUp}
                className="card-glass p-7 hover:border-gold/40 transition-all duration-300 group"
              >
                <div className="text-3xl mb-4">{feat.icon}</div>
                <h3 className="font-serif text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors">
                  {feat.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── ADVERTISER CTA ── */}
      <section className="py-20 bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="card-glass p-12"
          >
            <p className="text-gold text-xs uppercase tracking-widest mb-4">For Companions</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Grow Your <span className="text-gold">Business</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Join thousands of independent companions who trust TrustedEsco to connect them with
              genuine, high-quality clients across India. Post your listing today — it's free to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/advertiser-signup" className="btn-gold px-8 py-3 rounded-lg text-sm font-semibold">
                Post Your Ad Free
              </Link>
              <Link to="/post-ad" className="btn-outline px-8 py-3 rounded-lg text-sm font-semibold">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SAFETY NOTE ── */}
      <section className="py-12 bg-dark-card border-t border-gold/10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="font-serif text-2xl font-semibold text-white mb-4">
              🔒 Your Safety & Privacy Matter
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              TrustedEsco is an adult companion directory for users aged 18 and above. All profiles are
              voluntarily submitted by independent individuals. We do not facilitate or promote any illegal
              activity. Please review our{' '}
              <Link to="/terms" className="text-gold hover:underline">Terms of Service</Link> and{' '}
              <Link to="/privacy-policy" className="text-gold hover:underline">Privacy Policy</Link> before using this platform.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  )
}
