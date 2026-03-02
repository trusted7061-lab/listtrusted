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
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-gold"></div>
          <p className="text-gray-300 mt-4">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !ad) {
    return (
      <div className="min-h-screen bg-dark-bg py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-card border border-gold/20 rounded-2xl p-8 text-center"
          >
            <h1 className="text-3xl font-serif font-bold text-white mb-3">Profile Not Found</h1>
            <p className="text-gray-300 text-lg mb-6">{error || 'The escort profile you are looking for does not exist.'}</p>
            <a href="/escorts" className="inline-block px-8 py-3 bg-gold hover:bg-gold/90 text-black font-bold rounded-lg transition">
              Back to Escorts
            </a>
          </motion.div>
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

      <div className="min-h-screen bg-dark-bg">
        {/* Sticky Header */}
        <div className="bg-dark-card border-b border-gold/20 sticky top-0 z-50 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-white font-serif text-2xl font-bold hover:text-gold transition">
              TrustedEsco
            </a>
            <div className="flex items-center gap-3">
              <a href="/escorts" className="text-gray-300 hover:text-gold transition text-sm">← Back</a>
              {ad.contact?.phone && (
                <a
                  href={`https://wa.me/${ad.contact.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gold hover:bg-gold/90 text-black rounded-lg font-semibold transition transform hover:scale-105"
                >
                  Contact Now
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-8">
              {/* Main Image - Full Height */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-dark-card rounded-2xl overflow-hidden border border-gold/20 shadow-xl"
              >
                <img
                  src={ad.images?.[selectedImageIndex]?.url || 'https://via.placeholder.com/600x800'}
                  alt={`${ad.profileInfo?.name}`}
                  className="w-full h-auto object-contain"
                />
                {ad.isPremium && (
                  <div className="absolute top-5 right-5 bg-gold text-black px-4 py-2 rounded-lg font-bold text-sm">
                    ⭐ PREMIUM
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-dark-bg/80 backdrop-blur-sm px-3 py-1 rounded-lg text-gold text-sm font-semibold">
                  {selectedImageIndex + 1} / {ad.images?.length || 1}
                </div>
              </motion.div>

              {/* Image Thumbnails */}
              {ad.images && ad.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {ad.images.map((image, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      whileHover={{ scale: 1.05 }}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        idx === selectedImageIndex ? 'border-gold' : 'border-dark-hover'
                      }`}
                    >
                      <img src={image.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* About Section */}
              {ad.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-dark-card border border-gold/20 rounded-2xl p-8"
                >
                  <h2 className="text-3xl font-serif font-bold text-white mb-6">About Me</h2>
                  <p className="text-gray-300 leading-relaxed text-base whitespace-pre-wrap">{ad.description}</p>
                </motion.div>
              )}

              {/* Services */}
              {ad.services && ad.services.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-dark-card border border-gold/20 rounded-2xl p-8"
                >
                  <h3 className="text-2xl font-serif font-bold text-white mb-6">Services Available</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {ad.services.map((service, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.08 }}
                        className="flex items-center gap-3 p-3 bg-dark-hover rounded-lg border border-gold/10 hover:border-gold/30 transition"
                      >
                        <span className="text-gold text-lg">✓</span>
                        <span className="text-gray-200">{service}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-3 gap-4"
              >
                <div className="bg-dark-card border border-gold/20 rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold text-gold">{ad.views || 0}</p>
                  <p className="text-gray-400 text-sm mt-2">Profile Views</p>
                </div>
                <div className="bg-dark-card border border-gold/20 rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold text-gold">★★★★★</p>
                  <p className="text-gray-400 text-sm mt-2">5 Star Rating</p>
                </div>
                <div className="bg-dark-card border border-gold/20 rounded-lg p-5 text-center">
                  <p className="text-3xl font-bold text-gold">24/7</p>
                  <p className="text-gray-400 text-sm mt-2">Available</p>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-card border border-gold/30 rounded-2xl p-8 sticky top-24"
              >
                {/* Name */}
                <div className="text-center mb-6">
                  <h1 className="text-4xl font-serif font-bold text-white mb-3">{ad.profileInfo?.name}</h1>
                  <div className="inline-block bg-gold/20 border border-gold text-gold px-6 py-2 rounded-lg font-bold text-xl">
                    {ad.profileInfo?.age} Years
                  </div>
                </div>

                {/* Info Grid */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gold/20">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Body Type</p>
                    <p className="text-white font-semibold text-lg">{ad.profileInfo?.bodyType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">📍 Location</p>
                    <p className="text-white font-semibold text-lg">{ad.city}, {ad.state}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Rating</p>
                    <p className="text-gold font-bold text-lg">{ad.rating || 4.9} / 5.0 ⭐</p>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className={`text-center rounded-lg p-4 mb-6 border ${
                  isDefaultProfile 
                    ? 'bg-gold/10 border-gold/30' 
                    : 'bg-gold/10 border-gold/30'
                }`}>
                  <p className="text-gold font-semibold text-sm">
                    ✓ {isDefaultProfile ? 'Featured Profile' : 'Verified Member'}
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
                      className="w-full bg-gold hover:bg-gold/90 text-black font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.116-4.922 5.488-4.922 9.52C1.5 23.487 5.487 27.5 10.514 27.5c2.102 0 4.142-.547 5.972-1.585h.005c4.031-2.582 6.771-6.986 6.771-12.187 0-7.530-6.288-13.66-14.036-13.66" />
                      </svg>
                      WhatsApp
                    </motion.a>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => window.location.href = `tel:${ad.contact?.phone}`}
                    className="w-full bg-dark-hover border border-gold/20 hover:border-gold text-gold font-bold py-3 rounded-lg transition"
                  >
                    📞 Call Now
                  </motion.button>
                </div>
              </motion.div>

              {/* Quick Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-dark-card border border-gold/20 rounded-xl p-5 space-y-3 text-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Response Time</span>
                  <span className="text-gold font-semibold">Usually 5 min</span>
                </div>
                <div className="border-t border-gold/20 pt-3 flex justify-between items-center">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-gold font-semibold">{new Date(ad.createdAt).toLocaleDateString()}</span>
                </div>
              </motion.div>

              {/* Safety Notice */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-dark-card border border-gold/20 rounded-xl p-5"
              >
                <h4 className="text-gold font-bold text-sm mb-3">🛡️ Safety Verified</h4>
                <ul className="space-y-2 text-xs text-gray-300">
                  <li>✓ Verified profile</li>
                  <li>✓ Discreet service</li>
                  <li>✓ Safe & secure</li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
