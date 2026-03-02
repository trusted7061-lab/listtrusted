import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { defaultEscorts } from '../services/escortData'

export default function CompanionProfile() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isDefaultProfile, setIsDefaultProfile] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)

  useEffect(() => {
    const loadAdData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Extract ID from slug (slug format: name-id, get everything after last hyphen)
        const lastHyphenIndex = slug.lastIndexOf('-')
        const adId = slug.substring(lastHyphenIndex + 1)
        const nameFromSlug = slug.substring(0, lastHyphenIndex)

        console.log('Loading profile:', { slug, adId, nameFromSlug })

        // STEP 1: Try to find in defaultEscorts first (faster, more reliable)
        let foundProfile = defaultEscorts.find(
          escort => 
            String(escort.id) === String(adId) || 
            escort.name.toLowerCase().replace(/\s+/g, '-') === nameFromSlug.toLowerCase()
        )

        if (foundProfile) {
          console.log('✅ Found in defaultEscorts:', foundProfile.name)
          setIsDefaultProfile(true)
          // Format default profile
          const formattedProfile = {
            id: foundProfile.id,
            profileInfo: {
              name: foundProfile.name,
              age: foundProfile.age,
              bodyType: foundProfile.bodyType
            },
            city: foundProfile.city || foundProfile.location,
            area: foundProfile.area || foundProfile.location,
            state: 'India',
            images: [
              { url: foundProfile.image }
            ],
            services: foundProfile.services || [],
            description: foundProfile.description || `Experience with ${foundProfile.name}. Available for ${(foundProfile.services || []).join(', ')}`,
            contact: { phone: foundProfile.phone || '' },
            advertiser: {
              name: 'Trusted Escort',
              id: 'admin'
            },
            views: foundProfile.reviews || 0,
            isPremium: foundProfile.isPremium || false,
            createdAt: new Date().toISOString()
          }
          setAd(formattedProfile)
          setLoading(false)
          return
        }

        // STEP 2: Try backend if not in defaults
        console.log('Not found in defaults, trying backend...')
        const API_BASE = import.meta.env.VITE_API_URL || 'https://trustedescort-backend.onrender.com/api'
        
        try {
          const response = await fetch(`${API_BASE}/ads/${adId}`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.ad) {
              console.log('✅ Found in backend:', data.ad.profileInfo?.name)
              setAd(data.ad)
              setIsDefaultProfile(false)
              setLoading(false)
              return
            }
          }
        } catch (backendErr) {
          console.warn('Backend fetch error (expected for default profiles):', backendErr.message)
        }

        // STEP 3: If we reach here, try one more time with exact name matching
        console.log('Trying name-based search...')
        const nameMatch = defaultEscorts.find(
          escort => escort.name.toLowerCase() === nameFromSlug.toLowerCase().replace(/-/g, ' ')
        )

        if (nameMatch) {
          console.log('✅ Found via name match:', nameMatch.name)
          setIsDefaultProfile(true)
          const formattedProfile = {
            id: nameMatch.id,
            profileInfo: {
              name: nameMatch.name,
              age: nameMatch.age,
              bodyType: nameMatch.bodyType
            },
            city: nameMatch.city || nameMatch.location,
            area: nameMatch.area || nameMatch.location,
            state: 'India',
            images: [{ url: nameMatch.image }],
            services: nameMatch.services || [],
            description: nameMatch.description || `Experience with ${nameMatch.name}. Available for ${(nameMatch.services || []).join(', ')}`,
            contact: { phone: nameMatch.phone || '' },
            advertiser: {
              name: 'Trusted Escort',
              id: 'admin'
            },
            views: nameMatch.reviews || 0,
            isPremium: nameMatch.isPremium || false,
            createdAt: new Date().toISOString()
          }
          setAd(formattedProfile)
          setLoading(false)
          return
        }

        // If nothing found, show error
        throw new Error(`Profile "${nameFromSlug}" not found`)
      } catch (err) {
        console.error('❌ Error loading ad:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadAdData()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-pink-500"></div>
          <p className="text-white mt-4">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
            <p className="text-gray-300">{error || 'The escort profile you are looking for does not exist or has been removed.'}</p>
            <a href="/" className="inline-block mt-4 px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  const pageTitle = `${ad.profileInfo?.name || 'Escort'} - ${ad.profileInfo?.age} Years Old Premium Companion in ${ad.city} | Trusted Escort India`
  const pageDescription = `Meet ${ad.profileInfo?.name}, a ${ad.profileInfo?.age} year old premium ${ad.profileInfo?.bodyType} escort in ${ad.city}. Available for ${ad.services?.slice(0, 3).join(', ')}. Verified, Safe & Discreet. Book Now!`

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${ad.profileInfo?.name}, escort in ${ad.city}, ${ad.profileInfo?.age} year old, ${ad.services?.join(', ')}, premium companion`} />
        <meta name="author" content="Trusted Escort" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Open Graph for Social Sharing */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ad.images?.[0]?.url || 'https://via.placeholder.com/1200x630?text=Trusted+Escort'} />
        <meta property="og:url" content={`https://trustedescort.in/escorts/${slug}`} />
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="Trusted Escort" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ad.images?.[0]?.url || 'https://via.placeholder.com/1200x630?text=Trusted+Escort'} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://trustedescort.in/escorts/${slug}`} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "name": ad.profileInfo?.name,
            "url": `https://trustedescort.in/escorts/${slug}`,
            "image": ad.images?.[0]?.url,
            "description": ad.description,
            "mainEntity": {
              "@type": "Person",
              "name": ad.profileInfo?.name,
              "age": ad.profileInfo?.age,
              "description": ad.description,
              "areaServed": {
                "@type": "City",
                "name": ad.city
              },
              "ratingValue": ad.rating || 4.9,
              "bestRating": "5",
              "worstRating": "1"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        {/* Sticky Header */}
        <div className="bg-gradient-to-r from-pink-900/40 to-red-900/40 border-b border-pink-500/30 sticky top-0 z-50 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-white font-bold text-xl hover:text-pink-400 transition">
              🔥 Trusted Escort
            </a>
            <div className="flex items-center gap-3">
              <a href="/escorts" className="text-gray-300 hover:text-white transition">← Back</a>
              <button onClick={() => setShowContactModal(true)} className="px-4 py-2 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg font-semibold hover:from-pink-700 hover:to-red-700 transition transform hover:scale-105">
                📞 Contact
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Image with Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-pink-500/20"
              >
                <img
                  src={ad.images?.[selectedImageIndex]?.url || 'https://via.placeholder.com/800x900'}
                  alt={`${ad.profileInfo?.name} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-auto object-cover max-h-[650px]"
                />
                {ad.isPremium && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-sm animate-pulse">
                    ⭐ PREMIUM
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
                  {selectedImageIndex + 1} / {ad.images?.length || 1}
                </div>
              </motion.div>

              {/* Tagline */}
              <div className="bg-gradient-to-r from-pink-900/30 to-red-900/30 border border-pink-500/30 rounded-xl p-5 text-center">
                <p className="text-gray-200 text-lg font-semibold">
                  {ad.profileInfo?.name}: Premium {ad.profileInfo?.bodyType} Companion in {ad.city}
                </p>
                <p className="text-gray-400 mt-2 text-sm">✓ Available 24/7 | ✓ Verified & Safe | ✓ Discreet Service</p>
              </div>

              {/* Description Section */}
              {ad.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-8 border border-gray-600/30 backdrop-blur-sm"
                >
                  <h2 className="text-3xl font-bold text-white mb-4">✨ About Me</h2>
                  <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">{ad.description}</p>
                </motion.div>
              )}

              {/* Services Section */}
              {ad.services && ad.services.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl p-8 border border-purple-500/30"
                >
                  <h3 className="text-2xl font-bold text-white mb-6">💎 Services Offered</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ad.services.map((service, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.08 }}
                        className="flex items-center gap-3 p-3 bg-purple-900/30 rounded-lg border border-purple-500/20 hover:border-purple-500/50 transition"
                      >
                        <span className="text-pink-400 text-xl">✓</span>
                        <span className="text-gray-200 font-semibold">{service}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Stats Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl p-5 border border-cyan-500/30 text-center hover:border-cyan-500/60 transition">
                  <p className="text-3xl font-bold text-cyan-400">{ad.views || 0}</p>
                  <p className="text-gray-400 text-sm mt-2">Profile Views</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-5 border border-yellow-500/30 text-center hover:border-yellow-500/60 transition">
                  <p className="text-3xl font-bold text-yellow-400">100+</p>
                  <p className="text-gray-400 text-sm mt-2">Happy Clients</p>
                </div>
                <div className="bg-gradient-to-br from-pink-900/30 to-red-900/30 rounded-xl p-5 border border-pink-500/30 text-center hover:border-pink-500/60 transition">
                  <p className="text-3xl font-bold text-pink-400">{ad.rating || 5}★</p>
                  <p className="text-gray-400 text-sm mt-2">Average Rating</p>
                </div>
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-5 border border-green-500/30 text-center hover:border-green-500/60 transition">
                  <p className="text-3xl font-bold text-green-400">24/7</p>
                  <p className="text-gray-400 text-sm mt-2">Available</p>
                </div>
              </motion.div>

              {/* Safety Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-500/40 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-blue-300 mb-4">🛡️ Safety & Privacy</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <p className="text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span> All profiles verified & screened
                  </p>
                  <p className="text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span> Private & discreet service
                  </p>
                  <p className="text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span> 100% safe transactions
                  </p>
                  <p className="text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span> Respectful treatment
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Contact Info */}
            <div className="space-y-6">
              {/* Profile Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-pink-900/40 to-red-900/40 border border-pink-500/40 rounded-3xl p-8 sticky top-24"
              >
                {/* Name & Age Badge */}
                <div className="text-center mb-6">
                  <h1 className="text-5xl font-black text-white mb-3">{ad.profileInfo?.name}</h1>
                  <div className="inline-block bg-gradient-to-r from-pink-600 to-red-600 text-white px-6 py-3 rounded-full font-bold text-2xl">
                    {ad.profileInfo?.age} Yrs
                  </div>
                </div>

                {/* Rating */}
                <div className="text-center mb-6 pb-6 border-b border-pink-500/30">
                  <p className="text-5xl font-bold text-pink-400">{ad.rating || 4.9}★</p>
                  <p className="text-gray-300 text-sm mt-2">5 Star Rating</p>
                </div>

                {/* Body Type & Location */}
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Body Type</p>
                    <p className="text-white font-bold text-lg mt-1">{ad.profileInfo?.bodyType}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">📍 Location</p>
                    <p className="text-white font-bold text-lg mt-1">{ad.city}, {ad.state}</p>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className={`text-center rounded-lg p-4 mb-6 border ${
                  isDefaultProfile 
                    ? 'bg-blue-900/30 border-blue-500/30' 
                    : 'bg-green-900/30 border-green-500/30'
                }`}>
                  <p className={isDefaultProfile ? 'text-blue-400 font-semibold' : 'text-green-400 font-semibold'}>
                    {isDefaultProfile 
                      ? '✓ Featured Profile'
                      : '✓ Verified Member'
                    }
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  {ad.contact?.phone && (
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      href={`https://wa.me/${ad.contact.phone}?text=Hi%20${encodeURIComponent(ad.profileInfo?.name || 'there')},%20I%20am%20interested%20in%20your%20services.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition transform shadow-lg flex items-center justify-center gap-2"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.116-4.922 5.488-4.922 9.52C1.5 23.487 5.487 27.5 10.514 27.5c2.102 0 4.142-.547 5.972-1.585h.005c4.031-2.582 6.771-6.986 6.771-12.187 0-7.530-6.288-13.66-14.036-13.66" />
                      </svg>
                      WhatsApp Chat
                    </motion.a>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowContactModal(true)}
                    className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-bold py-4 rounded-xl transition transform shadow-lg"
                  >
                    📞 Call Me Now
                  </motion.button>
                </div>
              </motion.div>

              {/* Quick Info Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-5 space-y-4"
              >
                <div className="text-center">
                  <p className="text-gray-400 text-xs font-semibold uppercase">Response Time</p>
                  <p className="text-green-400 font-bold mt-1">Usually within 5 min</p>
                </div>
                <div className="text-center border-t border-gray-700/30 pt-4">
                  <p className="text-gray-400 text-xs font-semibold uppercase">Member Since</p>
                  <p className="text-white font-bold mt-1">{new Date(ad.createdAt).toLocaleDateString()}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-pink-900/40 to-red-900/40 border-t border-pink-500/30 py-8"
        >
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Meet {ad.profileInfo?.name}?</h3>
            <p className="text-gray-300 mb-6">Contact now for an unforgettable experience</p>
            {ad.contact?.phone && (
              <a
                href={`https://wa.me/${ad.contact.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition transform hover:scale-105 shadow-lg"
              >
                💬 Start Chat on WhatsApp
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
