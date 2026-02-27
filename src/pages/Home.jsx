import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { majorCities } from '../services/locationsData'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const cityImages = {
  Mumbai: '🌆', Delhi: '🏛️', Bangalore: '🌿', Hyderabad: '🕌',
  Pune: '🌄', Goa: '🏖️', Chennai: '🎭', Kolkata: '🌺',
  Chandigarh: '🌸', Jaipur: '🏰', Indore: '🌟', Ahmedabad: '🏙️',
  Surat: '💎', Lucknow: '🕍', Nagpur: '🍊', Visakhapatnam: '⚓',
  Bhopal: '🌊', Patna: '🏯', Vadodara: '🎨', Agra: '🕌',
  Nashik: '🍇', Kochi: '⛵', Coimbatore: '🌾', Thane: '🏘️',
}

const faqs = [
  {
    q: 'Is TrustedEsco legal and safe to use?',
    a: 'Yes. TrustedEsco is a legal adult companion directory for individuals aged 18 and above. All profiles are voluntarily submitted by independent adults. We do not facilitate or promote any illegal activity.',
  },
  {
    q: 'Are the companion profiles verified?',
    a: 'Yes. Every profile on TrustedEsco goes through a verification process to confirm the authenticity of the individual. Verified profiles are clearly marked with a gold ✓ Verified badge.',
  },
  {
    q: 'Which cities are covered on TrustedEsco?',
    a: 'We cover 500+ cities across India including Mumbai, Delhi, Bangalore, Hyderabad, Pune, Goa, Chennai, Kolkata, Chandigarh, Jaipur, Indore, Ahmedabad, and many more metro and tier-2 cities.',
  },
  {
    q: 'How do I contact a companion?',
    a: 'Browse companion profiles in your city, view their contact details, and reach out directly via call or WhatsApp. All contact is between you and the companion — we do not handle any transactions.',
  },
  {
    q: 'Is my personal information kept private?',
    a: 'Absolutely. We take privacy seriously. We do not share your personal data with third parties. Your browsing activity and contact details remain strictly confidential.',
  },
  {
    q: 'How do I post my companion ad on TrustedEsco?',
    a: 'Click "Post Your Ad" from the home page or the top navigation. Create an advertiser account, fill in your profile details including photos, services, and contact info, and your listing goes live within minutes.',
  },
  {
    q: 'Is it free to post an ad?',
    a: 'Yes, basic listing is free. We also offer premium placement options to increase your visibility in search results and across city pages.',
  },
  {
    q: 'How can I make my ad stand out?',
    a: 'Add high-quality photos, write a detailed description, list your services clearly, and keep your availability status updated. Verified profiles consistently receive more enquiries.',
  },
  {
    q: 'Can I edit or remove my ad after posting?',
    a: 'Yes. You can log in to your advertiser dashboard at any time to update your profile, change photos, edit contact details, or pause/remove your listing.',
  },
  {
    q: 'What types of companion services are available?',
    a: 'Companions on TrustedEsco offer a range of services including dinner dates, corporate events, travel companionship, social events, nightlife, and more — all between consenting adults.',
  },
  {
    q: 'How do I report a fake or suspicious profile?',
    a: 'You can report any suspicious profile using the "Report" option on the profile page, or contact our support team. We take all reports seriously and investigate promptly.',
  },
  {
    q: 'Is there a mobile app for TrustedEsco?',
    a: 'Our platform is fully mobile-optimised and works seamlessly on all devices. You can also install it as a Progressive Web App (PWA) on your phone for an app-like experience — no download required.',
  },
]

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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('find') // 'find' | 'post'
  const [searchCity, setSearchCity] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [openFaq, setOpenFaq] = useState(null)

  const citySlug = (city) => city.toLowerCase().replace(/\s+/g, '-')

  useEffect(() => {
    if (searchCity.trim().length > 1) {
      setSuggestions(
        majorCities.filter(c =>
          c.toLowerCase().includes(searchCity.toLowerCase())
        ).slice(0, 6)
      )
    } else {
      setSuggestions([])
    }
  }, [searchCity])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchCity.trim()) {
      navigate(`/escorts/in/${citySlug(searchCity.trim())}`)
    } else {
      navigate('/escorts')
    }
  }

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
            target: 'https://trustedesco.in/escorts/in/{search_term_string}',
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

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold text-xs uppercase tracking-widest mb-5 font-sans">
              India's Most Trusted Escort Directory
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your Perfect{' '}
              <span className="text-gold">Companion</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Thousands of verified, premium companions across 500+ cities in India.
              Discreet, safe, and always available.
            </p>

            {/* ── TAB SWITCHER ── */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-dark-card border border-gold/20 rounded-xl p-1 gap-1">
                <button
                  onClick={() => setActiveTab('find')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'find'
                      ? 'bg-gold text-black shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🔍 Find Escorts
                </button>
                <button
                  onClick={() => setActiveTab('post')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'post'
                      ? 'bg-gold text-black shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📋 Post Your Ad
                </button>
              </div>
            </div>

            {/* ── TAB CONTENT ── */}
            <AnimatePresence mode="wait">
              {activeTab === 'find' ? (
                <motion.div
                  key="find"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-xl mx-auto"
                >
                  <form onSubmit={handleSearch} className="relative">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Enter your city — Mumbai, Delhi, Goa…"
                          value={searchCity}
                          onChange={e => setSearchCity(e.target.value)}
                          className="w-full px-5 py-4 rounded-xl bg-dark-card border border-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-base"
                        />
                        {suggestions.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-dark-card border border-gold/20 rounded-xl overflow-hidden z-50 shadow-xl">
                            {suggestions.map(city => (
                              <button
                                key={city}
                                type="button"
                                onClick={() => { setSearchCity(city); setSuggestions([]) }}
                                className="w-full text-left px-5 py-3 text-sm text-gray-300 hover:bg-dark-hover hover:text-gold transition-colors flex items-center gap-2"
                              >
                                <span>{cityImages[city] || '🏙️'}</span> {city}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button type="submit" className="btn-gold px-7 py-4 rounded-xl text-sm font-semibold whitespace-nowrap">
                        Search
                      </button>
                    </div>
                  </form>
                  <div className="flex flex-wrap justify-center gap-2 mt-5 text-xs">
                    {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Goa', 'Chennai', 'Kolkata'].map(city => (
                      <Link
                        key={city}
                        to={`/escorts/in/${citySlug(city)}`}
                        className="px-3 py-1 border border-gold/20 rounded-full text-gray-400 hover:border-gold/60 hover:text-gold transition-colors"
                      >
                        {city}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="post"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-xl mx-auto"
                >
                  <div className="card-glass rounded-2xl p-8 text-left">
                    <h2 className="font-serif text-2xl font-bold text-white mb-2">
                      Advertise on TrustedEsco
                    </h2>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                      Reach thousands of genuine clients across India. Post your companion profile in minutes — <span className="text-gold font-medium">free to start.</span>
                    </p>
                    <ul className="space-y-2 mb-7 text-sm text-gray-300">
                      {['Instant listing — goes live immediately', 'Reach clients in 500+ cities', 'Verified badge for trusted profiles', 'Direct WhatsApp & call contact'].map(item => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="text-gold">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-3">
                      <Link to="/advertiser-signup" className="btn-gold flex-1 text-center py-3 rounded-xl text-sm font-semibold">
                        Create Free Account
                      </Link>
                      <Link to="/post-ad" className="btn-outline flex-1 text-center py-3 rounded-xl text-sm font-semibold">
                        Post Ad Directly
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-dark-bg">
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

      {/* ── BROWSE ALL METRO CITIES ── */}
      <section className="py-20 bg-dark-card">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-gold text-xs uppercase tracking-widest mb-3">All Metro Cities</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Browse by <span className="text-gold">City</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Find verified companions across all major metro and tier-1 cities in India.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {majorCities.map(city => (
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
      <section className="py-20 bg-dark-bg">
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
      <section className="py-20 bg-dark-card">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="card-glass p-12"
          >
            <p className="text-gold text-xs uppercase tracking-widest mb-4">For Companions & Advertisers</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
              Grow Your <span className="text-gold">Business</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Join thousands of independent companions who trust TrustedEsco to connect them with
              genuine, high-quality clients across India. Post your listing today — it's free to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/advertiser-signup" className="btn-gold px-8 py-3 rounded-lg text-sm font-semibold">
                Create Free Account
              </Link>
              <Link to="/post-ad" className="btn-outline px-8 py-3 rounded-lg text-sm font-semibold">
                Post Ad Directly
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-dark-bg">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-gold text-xs uppercase tracking-widest mb-3">Got Questions?</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked <span className="text-gold">Questions</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Everything you need to know about TrustedEsco — for clients and advertisers alike.
            </p>
          </motion.div>

          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left card-glass px-6 py-5 flex items-center justify-between gap-4 hover:border-gold/50 transition-all duration-200 group"
                >
                  <span className="font-medium text-white group-hover:text-gold transition-colors text-sm leading-snug">
                    {faq.q}
                  </span>
                  <span className={`text-gold text-xl font-bold flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 py-4 bg-dark-card border border-t-0 border-gold/10 rounded-b-xl">
                        <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
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