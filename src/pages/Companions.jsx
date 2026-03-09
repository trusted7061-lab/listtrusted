import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { majorCities } from '../services/locationsData'
import { defaultEscorts } from '../services/escortData'
import { getAllProfiles } from '../services/profileService'

const API_BASE = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://trustedescort.onrender.com/api')

const cityImages = {
  Mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop',
  Delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop',
  Bangalore: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=300&fit=crop',
  Hyderabad: 'https://images.unsplash.com/photo-1584487702749-29a3e768a21a?w=400&h=300&fit=crop',
  Pune: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=400&h=300&fit=crop',
  Goa: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400&h=300&fit=crop',
  Chennai: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400&h=300&fit=crop',
  Kolkata: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=400&h=300&fit=crop',
  Chandigarh: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
  Jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&h=300&fit=crop',
  Ahmedabad: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
  Kochi: 'https://images.unsplash.com/photo-1533577116850-9cc66cad8a9b?w=400&h=300&fit=crop',
}

const getDefaultImage = (city) =>
  cityImages[city] || 'https://images.unsplash.com/photo-1558431382-27e303142255?w=400&h=300&fit=crop'

export default function Companions() {
  const [selectedCity, setSelectedCity] = useState(null)
  const [escorts, setEscorts] = useState([])
  const [loading, setLoading] = useState(false)
  const [featuredAds, setFeaturedAds] = useState([])

  // Load featured ads from popular cities on mount
  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const localProfiles = getAllProfiles()
        const combined = [...defaultEscorts, ...localProfiles]
        let backendAds = []
        const topCities = ['Mumbai', 'Delhi', 'Bangalore']
        for (const city of topCities) {
          try {
            const res = await fetch(`${API_BASE}/ads/city/${city}?limit=3&sort=featured`)
            if (res.ok) {
              const data = await res.json()
              backendAds = [...backendAds, ...(data.ads || [])]
            }
          } catch { /* skip */ }
        }
        const adsAsEscorts = backendAds.map(ad => ({
          id: ad.id,
          name: ad.profileInfo?.name || 'Unknown',
          age: ad.profileInfo?.age || 'N/A',
          location: ad.city,
          image: ad.images?.[0]?.url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300&h=400&fit=crop',
          description: ad.description || '',
          services: ad.services || [],
          rating: 4.9,
          verified: true,
          isPremium: ad.isPremium,
          isAdvertiserAd: true,
        }))
        const all = [...adsAsEscorts, ...combined.slice(0, Math.max(0, 9 - adsAsEscorts.length))]
        setFeaturedAds(all.slice(0, 9))
      } catch { /* silent */ }
    }
    loadFeatured()
  }, [])

  // Load escorts when a city is selected
  useEffect(() => {
    if (!selectedCity) return
    const load = async () => {
      setLoading(true)
      setEscorts([])
      try {
        const localProfiles = getAllProfiles()
        const combined = [...defaultEscorts, ...localProfiles].filter(
          e => e.location?.toLowerCase() === selectedCity.toLowerCase()
        )
        let backendAds = []
        try {
          const res = await fetch(`${API_BASE}/ads/city/${selectedCity}?limit=50&sort=featured`)
          if (res.ok) {
            const data = await res.json()
            backendAds = (data.ads || []).map(ad => ({
              id: ad.id,
              name: ad.profileInfo?.name || 'Unknown',
              age: ad.profileInfo?.age || 'N/A',
              location: ad.city,
              image: ad.images?.[0]?.url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300&h=400&fit=crop',
              description: ad.description || '',
              services: ad.services || [],
              rating: 4.9,
              verified: true,
              isPremium: ad.isPremium,
              isAdvertiserAd: true,
            }))
          }
        } catch { /* fallback to local */ }
        setEscorts([...backendAds, ...combined])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedCity])

  const displayEscorts = selectedCity ? escorts : featuredAds

  return (
    <>
      <Helmet>
        <title>Browse Escorts in India | Trusted Escort</title>
        <meta name="description" content="Browse verified escorts across India. Find premium companions in Mumbai, Delhi, Bangalore, Goa and more cities. Discreet, professional escort services." />
        <meta name="keywords" content="escorts india, escort service, premium escorts, verified escorts, companions india, escort directory" />
        <link rel="canonical" href="https://trustedescort.in/escorts" />
        <meta property="og:title" content="Browse Escorts in India | Trusted Escort" />
        <meta property="og:description" content="Find premium verified escorts across all major cities in India." />
        <meta property="og:url" content="https://trustedescort.in/escorts" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://trustedescort.in" },
              { "@type": "ListItem", "position": 2, "name": "Browse Escorts", "item": "https://trustedescort.in/escorts" }
            ]
          })}
        </script>
      </Helmet>

      {/* Hero */}
      <section className="relative pt-24 pb-20 bg-dark-bg overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero-section-2.png"
            alt="Premium escorts India"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/80 via-dark-bg/70 to-dark-bg" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gold mb-4">
              Browse All Escorts
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Verified, premium companions across India. Select a city to explore.
            </p>
          </motion.div>
        </div>
      </section>

      {/* City Filter */}
      <section className="py-8 bg-dark-card border-t border-b border-gold/10 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCity(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCity
                  ? 'bg-gold text-dark-bg'
                  : 'bg-dark-bg border border-gold/20 text-gray-300 hover:border-gold hover:text-gold'
              }`}
            >
              All Cities
            </button>
            {majorCities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCity === city
                    ? 'bg-gold text-dark-bg'
                    : 'bg-dark-bg border border-gold/20 text-gray-300 hover:border-gold hover:text-gold'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* City Cards Grid (shown only when no city selected) */}
      {!selectedCity && (
        <section className="py-16 bg-dark-bg">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-serif font-bold text-gold text-center mb-10"
            >
              Browse by City
            </motion.h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
              {majorCities.map((city, index) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    to={`/escorts/in/${city.toLowerCase().replace(/\s+/g, '-')}`}
                    className="relative block rounded-xl overflow-hidden group"
                    style={{ aspectRatio: '4/3' }}
                  >
                    <img
                      src={getDefaultImage(city)}
                      alt={`Escorts in ${city}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-serif font-bold text-lg">{city}</h3>
                      <p className="text-gold text-xs">View escorts →</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Escort Listings */}
      <section className="py-16 bg-dark-card border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-serif font-bold text-gold"
            >
              {selectedCity ? `Escorts in ${selectedCity}` : 'Featured Escorts'}
            </motion.h2>
            {selectedCity && (
              <Link
                to={`/escorts/in/${selectedCity.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-gold text-sm hover:underline"
              >
                View full page →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayEscorts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayEscorts.map((escort, index) => (
                <motion.div
                  key={escort.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  whileHover={{ y: -8 }}
                  className="card-glass overflow-hidden group"
                >
                  <Link to={`/escorts/${String(escort.name).toLowerCase().replace(/\s+/g, '-')}-${escort.id}`}>
                    <div className="relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                      <img
                        src={escort.image}
                        alt={`${escort.name}, escort in ${escort.location}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent opacity-80" />

                      {escort.verified && (
                        <div className="absolute top-4 right-4 bg-gold/90 backdrop-blur-sm text-dark-bg px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </div>
                      )}
                      {escort.isPremium && (
                        <div className="absolute top-4 left-4 bg-dark-bg/80 backdrop-blur-sm text-gold px-2 py-1 rounded-full text-xs font-semibold">
                          Premium
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-2xl font-serif font-bold text-white mb-1">
                          {escort.name}, {escort.age}
                        </h3>
                        <div className="flex items-center gap-1.5 text-gold mb-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">{escort.location}</span>
                        </div>
                        {escort.description && (
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{escort.description}</p>
                        )}
                        {escort.services?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {escort.services.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-dark-bg/80 backdrop-blur-sm text-gray-300 rounded-full">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg mb-4">
                {selectedCity
                  ? `No escorts listed in ${selectedCity} yet. Check back soon!`
                  : 'No escorts available at the moment.'}
              </p>
              {selectedCity && (
                <Link
                  to={`/escorts/in/${selectedCity.toLowerCase().replace(/\s+/g, '-')}`}
                  className="btn-gold inline-block px-6 py-3 rounded-lg text-sm font-semibold"
                >
                  View {selectedCity} Page
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-dark-bg border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-serif font-bold text-gold text-center mb-12"
          >
            Why Choose Trusted Escort
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '✓', title: 'Verified Profiles', desc: 'All escorts are background verified and profile-authenticated for your safety.' },
              { icon: '🔒', title: '100% Discreet', desc: 'Complete privacy guaranteed. Your information is never shared with anyone.' },
              { icon: '⭐', title: 'Premium Quality', desc: 'Only elite, professional companions who meet our strict standards are listed.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card-glass p-6 rounded-xl text-center"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-gold font-serif font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
