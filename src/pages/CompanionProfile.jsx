import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { defaultEscorts } from '../services/escortData'

export default function CompanionProfile() {
  const { slug } = useParams()
  const [ad, setAd] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isDefaultProfile, setIsDefaultProfile] = useState(false)

  useEffect(() => {
    const loadAdData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Extract ID from slug (slug format: name-id, get everything after last hyphen)
        const lastHyphenIndex = slug.lastIndexOf('-')
        const adId = slug.substring(lastHyphenIndex + 1)
        const nameFromSlug = slug.substring(0, lastHyphenIndex)

        const API_BASE = import.meta.env.VITE_API_URL || 'https://trustedescort-backend.onrender.com/api'
        
        try {
          // Try to fetch from backend first
          const response = await fetch(`${API_BASE}/ads/${adId}`)
          
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.ad) {
              setAd(data.ad)
              return
            }
          }
        } catch (err) {
          console.warn('Failed to fetch from backend:', err)
        }

        // If backend fails, try to find in defaultEscorts
        console.log('Checking defaultEscorts for:', { nameFromSlug, adId })
        const defaultProfile = defaultEscorts.find(
          escort => 
            escort.id === adId || 
            escort.name.toLowerCase().replace(/\s+/g, '-') === nameFromSlug
        )

        if (defaultProfile) {
          setIsDefaultProfile(true)
          // Format default profile to match backend ad format
          const formattedProfile = {
            id: defaultProfile.id,
            profileInfo: {
              name: defaultProfile.name,
              age: defaultProfile.age,
              bodyType: defaultProfile.bodyType
            },
            city: defaultProfile.city || defaultProfile.location,
            area: defaultProfile.area || defaultProfile.location,
            state: 'India',
            images: [
              { url: defaultProfile.image }
            ],
            services: defaultProfile.services || [],
            description: defaultProfile.description || `Experience with ${defaultProfile.name}. Available for ${(defaultProfile.services || []).join(', ')}`,
            contact: { phone: defaultProfile.phone || '' },
            advertiser: {
              name: 'Trusted Escort',
              id: 'admin'
            },
            views: defaultProfile.reviews || 0,
            isPremium: defaultProfile.isPremium || false,
            createdAt: new Date().toISOString()
          }
          setAd(formattedProfile)
          return
        }

        throw new Error('Profile not found in database or default profiles')
      } catch (err) {
        console.error('Error loading ad:', err)
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

  const pageTitle = `${ad.profileInfo?.name || 'Escort'} - Premium Companion in ${ad.city}`
  const pageDescription = ad.description || `Meet ${ad.profileInfo?.name}, ${ad.profileInfo?.age} years old escort in ${ad.city}. Available for ${ad.services?.join(', ')}`

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ad.images?.[0]?.url || 'https://via.placeholder.com/600x400'} />
        <meta property="og:url" content={`https://trustedescort.in/escorts/${slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ad.images?.[0]?.url || 'https://via.placeholder.com/600x400'} />
        <link rel="canonical" href={`https://trustedescort.in/escorts/${slug}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-8">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Image Gallery */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-xl overflow-hidden mb-4">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={ad.images?.[selectedImageIndex]?.url || 'https://via.placeholder.com/600x700'}
                  alt={`${ad.profileInfo?.name} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Thumbnail Gallery */}
              {ad.images && ad.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {ad.images.map((image, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      whileHover={{ scale: 1.05 }}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        idx === selectedImageIndex ? 'border-pink-500' : 'border-gray-700'
                      }`}
                    >
                      <img src={image.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <h1 className="text-4xl font-bold text-white mb-2">{ad.profileInfo?.name}</h1>
                  <p className="text-2xl text-pink-400 font-semibold">{ad.profileInfo?.age} years old</p>
                  <p className="text-gray-400 text-lg">{ad.city}, {ad.state}</p>
                </motion.div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {ad.profileInfo?.bodyType && (
                  <div className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-sm">Body Type</p>
                    <p className="text-white font-semibold">{ad.profileInfo.bodyType}</p>
                  </div>
                )}
                {ad.isPremium && (
                  <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-lg p-3">
                    <p className="text-white text-sm font-semibold">⭐ Premium</p>
                  </div>
                )}
              </div>

              {/* Services */}
              {ad.services && ad.services.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {ad.services.map((service, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className="bg-pink-600/20 border border-pink-500/50 text-pink-300 px-3 py-1 rounded-full text-sm"
                      >
                        {service}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Button */}
              {ad.contact?.phone && (
                <motion.a
                  href={`https://wa.me/${ad.contact.phone}?text=Hi%20${encodeURIComponent(ad.profileInfo?.name || 'there')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.116-4.922 5.488-4.922 9.52C1.5 23.487 5.487 27.5 10.514 27.5c2.102 0 4.142-.547 5.972-1.585h.005c4.031-2.582 6.771-6.986 6.771-12.187 0-7.530-6.288-13.66-14.036-13.66" />
                  </svg>
                  WhatsApp
                </motion.a>
              )}
            </div>
          </motion.div>

          {/* Description */}
          {ad.description && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 bg-gray-800 rounded-lg p-6"
            >
              <h2 className="text-2xl font-bold text-white mb-4">About</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{ad.description}</p>
            </motion.div>
          )}

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {ad.city && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm font-semibold mb-1">Location</h3>
                <p className="text-white font-semibold">{ad.city}</p>
                {ad.area && <p className="text-gray-500 text-sm">{ad.area}</p>}
              </div>
            )}
            {ad.views !== undefined && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm font-semibold mb-1">Profile Views</h3>
                <p className="text-white font-semibold">{ad.views.toLocaleString()}</p>
              </div>
            )}
            {ad.createdAt && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-gray-400 text-sm font-semibold mb-1">Member Since</h3>
                <p className="text-white font-semibold">{new Date(ad.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </motion.div>

          {/* Verification Banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`mt-8 rounded-lg p-4 text-center ${
              isDefaultProfile 
                ? 'bg-blue-900/20 border border-blue-500/30' 
                : 'bg-green-900/20 border border-green-500/30'
            }`}
          >
            <p className={isDefaultProfile ? 'text-blue-400' : 'text-green-400'}>
              {isDefaultProfile 
                ? '✓ Featured Profile on Trusted Escort - Connect directly for real companions'
                : '✓ This is a verified and approved profile on Trusted Escort'
              }
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
