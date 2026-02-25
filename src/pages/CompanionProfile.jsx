import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllProfiles } from '../services/profileService'
import { getAllEscorts, getEscortById, defaultEscorts } from '../services/escortData'

function CompanionProfile() {
  const { slug } = useParams()
  console.log('🔍 CompanionProfile component mounted - Requested slug:', slug)
  
  const [companion, setCompanion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Image modal state
  const [showModal, setShowModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  
  // Cities list for locations section
  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Goa',
    'Chennai', 'Kolkata', 'Chandigarh', 'Jaipur', 'Indore', 'Ahmedabad',
    'Surat', 'Lucknow', 'Nagpur', 'Visakhapatnam', 'Bhopal', 'Patna',
    'Vadodara', 'Agra', 'Nashik', 'Kochi', 'Coimbatore', 'Thane', 
    'Ghaziabad', 'Ludhiana', 'Faridabad', 'Meerut', 'Rajkot', 
    'Kalyan-Dombivli', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 
    'Amritsar', 'Navi Mumbai', 'Allahabad (Prayagraj)', 'Howrah', 'Ranchi', 
    'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 
    'Kota', 'Guwahati', 'Solapur', 'Hubli-Dharwad', 'Bareilly', 'Moradabad', 
    'Mysuru (Mysore)', 'Tiruchirappalli', 'Salem', 'Aligarh', 'Bhubaneswar', 
    'Jalandhar', 'Gorakhpur', 'Guntur', 'Bikaner', 'Noida', 'Firozabad', 
    'Jamshedpur', 'Bhavnagar', 'Cuttack', 'Dehradun', 'Asansol', 'Nellore', 
    'Ajmer', 'Kollam', 'Mangalore'
  ]

  // Loading effect
  useEffect(() => {
    window.scrollTo(0, 0) // Scroll to top when profile loads
  }, [slug])

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false)
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [showModal])
  
  // Load companion profile
  useEffect(() => {
    const loadCompanion = () => {
      console.log('=== CompanionProfile Loading ===')
      console.log('Requested slug:', slug)
      setIsLoading(true)
      
      try {
        // Start with defaultEscorts (always available)
        let allEscorts = [...defaultEscorts]
        console.log('Default escorts loaded:', defaultEscorts.length)
        
        // Add advertiser profiles if any
        const advertiserProfiles = getAllProfiles()
        if (advertiserProfiles && advertiserProfiles.length > 0) {
          allEscorts = [...advertiserProfiles, ...allEscorts]
          console.log('Added advertiser profiles:', advertiserProfiles.length)
        }
        
        console.log('Total escorts available:', allEscorts.length)
        
        // Find companion by slug (name-id format) or by ID
        const foundCompanion = allEscorts.find(c => {
          const escortSlug = `${c.name.toLowerCase().replace(/\s+/g, '-')}-${c.id}`
          return escortSlug === slug || c.id === parseInt(slug) || String(c.id) === String(slug)
        })
        
        if (foundCompanion) {
          console.log('✓ Companion found:', foundCompanion.name, foundCompanion.location)
          setCompanion(foundCompanion)
        } else {
          console.log('✗ Companion NOT found for slug:', slug)
          console.log('Sample slugs:', allEscorts.slice(700, 710).map(e => ({ slug: `${e.name.toLowerCase().replace(/\s+/g, '-')}-${e.id}`, name: e.name, location: e.location })))
          setCompanion(null)
        }
      } catch (error) {
        console.error('Error loading companion:', error)
        setCompanion(null)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Small delay to ensure imports are ready
    const timer = setTimeout(loadCompanion, 100)
    
    return () => clearTimeout(timer)
  }, [slug])
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
          <p className="text-xs text-gray-500 mt-2">Please check console (F12) for debug logs</p>
        </div>
      </div>
    )
  }
  
  // If still no companion after loading, show not found
  if (!companion) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-gold mb-4">Profile Not Found</h1>
          <p className="text-gray-400 mb-4">
            Sorry, the profile you're looking for doesn't exist.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Searched for ID: {id} | Check browser console (F12) for debug info
          </p>
          <Link to="/escorts" className="btn-gold">
            Back to Escorts
          </Link>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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

  // Handle image click for lightbox
  const handleImageClick = (img) => {
    setSelectedImage(img)
    setShowModal(true)
  }

  // WhatsApp booking
  const handleWhatsAppBooking = () => {
    const message = `Hi, I'd like to book ${companion.name} from ${companion.location}`
    const phoneNumber = '919876543210' // Replace with actual number
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{`${companion.name} - ${companion.age} Year Old ${companion.verified ? 'Verified ' : ''}Escort in ${companion.location} | Trusted Escort`}</title>
        <meta name="description" content={`Meet ${companion.name}, ${companion.age} years old ${companion.verified ? 'verified ' : ''}elite escort in ${companion.location}. ${companion.description} - Rating: ${companion.rating}/5 with ${companion.reviews} reviews. Available for ${companion.services?.join(', ') || 'various services'}.`} />
        <meta name="keywords" content={`${companion.name}, ${companion.location} escort, ${companion.age} year old escort, ${companion.verified ? 'verified escort, ' : ''}elite companionship, ${companion.services?.join(', ')}`} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={`${companion.name} - ${companion.age} Escort in ${companion.location}`} />
        <meta property="og:description" content={`${companion.description} - Rating: ${companion.rating}/5`} />
        <meta property="og:image" content={companion.image} />
        <meta property="og:type" content="profile" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": companion.name,
            "description": companion.description,
            "image": companion.image,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": companion.location
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-dark-bg text-white">
        {/* Hero Section with Image */}
        <div className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden bg-dark-card">
          <img
            src={companion.image}
            alt={`${companion.name}, ${companion.age} - ${companion.description}`}
            className="w-full h-full object-cover object-top cursor-pointer hover:scale-105 transition-transform duration-700"
            onClick={() => handleImageClick(companion.image)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/800x1200/1a1a1a/d4af37?text=Image+Not+Available'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent" />
                    {/* Top Contact & Chat Buttons */}
          <div className="absolute top-0 left-0 right-0 p-6">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-end gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWhatsAppBooking}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Contact & Chat
                </motion.button>
              </motion.div>
            </div>
          </div>
                    {/* Profile Header Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-5xl md:text-6xl font-serif font-bold text-gold">
                    {companion.name}
                  </h1>
                  {companion.verified && (
                    <div className="bg-green-500/20 backdrop-blur-md px-4 py-2 rounded-full text-sm text-green-300 border border-green-300/30 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-lg mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white font-semibold">{companion.rating}</span>
                    <span className="text-gray-400">({companion.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    {companion.location}
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 001.415-1.415L11 9.586V6a1 1 0 00-1-1z" />
                    </svg>
                    {companion.age} years old
                  </div>
                </div>
                
                <p className="text-xl text-gray-300 max-w-3xl">
                  {companion.description}
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
          {/* Hello Message */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 p-6 bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30 rounded-xl text-center backdrop-blur-sm"
          >
            <h2 className="text-3xl font-serif font-bold text-gold">Hello!</h2>
            <p className="text-gray-300 mt-2">Welcome to {companion.name}'s profile</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="md:col-span-2 space-y-8">
              {/* About Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card-glass p-8"
              >
                <h2 className="text-3xl font-serif font-bold text-gold mb-6">About Me</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {companion.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gold/20">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Age</p>
                    <p className="text-white font-semibold text-lg">{companion.age} years</p>
                  </div>
                  {companion.height && (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Height</p>
                      <p className="text-white font-semibold text-lg">{companion.height}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Location</p>
                    <p className="text-white font-semibold text-lg">{companion.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Availability</p>
                    <p className="text-green-400 font-semibold text-lg flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full" />
                      {companion.availability || 'Available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Response Time</p>
                    <p className="text-white font-semibold text-lg">{companion.responseTime || '< 1 hour'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Rating</p>
                    <p className="text-yellow-400 font-semibold text-lg">★ {companion.rating}/5</p>
                  </div>
                </div>
              </motion.section>

              {/* Services Section */}
              {companion.services && companion.services.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card-glass p-8"
                >
                  <h2 className="text-3xl font-serif font-bold text-gold mb-6">Services Offered</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {companion.services.map((service, idx) => (
                      <div
                        key={idx}
                        className="bg-gold/10 border border-gold/20 rounded-lg p-4 text-center hover:bg-gold/20 transition"
                      >
                        <p className="text-gold font-semibold">{service}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Reviews Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card-glass p-8"
              >
                <h2 className="text-3xl font-serif font-bold text-gold mb-6">
                  Reviews & Ratings
                </h2>
                
                <div className="flex items-center gap-4 mb-8 p-6 bg-gold/10 rounded-lg">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gold mb-2">{companion.rating}</div>
                    <div className="text-yellow-400 text-2xl mb-1">★★★★★</div>
                    <div className="text-gray-400 text-sm">{companion.reviews} reviews</div>
                  </div>
                  
                  <div className="flex-grow pl-6 border-l border-gold/20">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 w-12">5 ★</span>
                        <div className="flex-grow bg-dark-card rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '85%' }} />
                        </div>
                        <span className="text-sm text-gray-400 w-12 text-right">85%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 w-12">4 ★</span>
                        <div className="flex-grow bg-dark-card rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '12%' }} />
                        </div>
                        <span className="text-sm text-gray-400 w-12 text-right">12%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 w-12">3 ★</span>
                        <div className="flex-grow bg-dark-card rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '2%' }} />
                        </div>
                        <span className="text-sm text-gray-400 w-12 text-right">2%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-dark-card/50 p-6 rounded-lg border border-gold/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-yellow-400">★★★★★</div>
                      <span className="text-gray-400 text-sm">2 days ago</span>
                    </div>
                    <p className="text-gray-300">
                      "Absolutely wonderful experience! {companion.name} was professional, charming, and made the evening unforgettable. Highly recommended!"
                    </p>
                    <p className="text-gray-500 text-sm mt-2">- Verified Booking</p>
                  </div>
                  
                  <div className="bg-dark-card/50 p-6 rounded-lg border border-gold/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-yellow-400">★★★★★</div>
                      <span className="text-gray-400 text-sm">1 week ago</span>
                    </div>
                    <p className="text-gray-300">
                      "Perfect companion for my business event. Elegant, intelligent conversation, and very punctual. Will definitely book again."
                    </p>
                    <p className="text-gray-500 text-sm mt-2">- Verified Booking</p>
                  </div>

                  <div className="bg-dark-card/50 p-6 rounded-lg border border-gold/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-yellow-400">★★★★★</div>
                      <span className="text-gray-400 text-sm">2 weeks ago</span>
                    </div>
                    <p className="text-gray-300">
                      "Exceeded all expectations. Great sense of humor, beautiful, and very accommodating. The booking process was smooth and discreet."
                    </p>
                    <p className="text-gray-500 text-sm mt-2">- Verified Booking</p>
                  </div>
                </div>
              </motion.section>

              {/* Chat/Contact Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card-glass p-8"
              >
                <h2 className="text-3xl font-serif font-bold text-gold mb-6">
                  Contact & Chat
                </h2>
                
                {/* WhatsApp Contact */}
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <p className="text-gray-400 text-sm mb-1">WhatsApp Number</p>
                      <p className="text-white text-xl font-bold">{companion.whatsappNumber ? companion.whatsappNumber : 'Not provided'}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleWhatsAppBooking}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.51 3.58 1.39 5.06L2 22l5.06-1.39C8.54 21.49 10.27 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.54 0-3-.42-4.24-1.15l-.3-.18-2.52.66.67-2.46-.2-.31A7.93 7.93 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
                      <path d="M15.5 13.3c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.7.8-.1.2-.2.2-.4.1-.3-.1-.9-.3-1.7-1-.6-.6-1.1-1.2-1.2-1.5-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.4.1-.1.1-.2.2-.3 0-.2 0-.3 0-.4 0-.1-.5-1.1-.6-1.5-.2-.4-.3-.3-.5-.4h-.4c-.1 0-.4 0-.6.3-.2.2-.7.7-.7 1.7s.7 2 .8 2.1 1.4 2.2 3.5 3.1c2 .9 2 .6 2.4.6.4 0 1.2-.5 1.4-1s.2-.9.1-1c-.1-.1-.3-.2-.5-.3z"/>
                    </svg>
                    Chat on WhatsApp
                  </button>
                </div>

                {/* Quick Message Templates */}
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm font-semibold mb-3">Quick Message Templates:</p>
                  
                  <button
                    onClick={() => {
                      const message = `Hi ${companion.name}, I'd like to inquire about your availability for a booking.`
                      window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank')
                    }}
                    className="w-full text-left p-4 bg-dark-card/50 hover:bg-dark-card border border-gold/10 hover:border-gold/30 rounded-lg transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm group-hover:text-white">Check Availability</span>
                      <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      const message = `Hello ${companion.name}, I'm interested in booking you for a dinner date. Can we discuss the details?`
                      window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank')
                    }}
                    className="w-full text-left p-4 bg-dark-card/50 hover:bg-dark-card border border-gold/10 hover:border-gold/30 rounded-lg transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm group-hover:text-white">Dinner Date Inquiry</span>
                      <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      const message = `Hi ${companion.name}, I would like to know more about your services and rates. Thank you!`
                      window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank')
                    }}
                    className="w-full text-left p-4 bg-dark-card/50 hover:bg-dark-card border border-gold/10 hover:border-gold/30 rounded-lg transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm group-hover:text-white">Rates & Services Info</span>
                      <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t border-gold/20">
                  <p className="text-gray-400 text-sm mb-3">Other Ways to Contact:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3 text-gray-300">
                      <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span>Phone: +91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span>Email via Contact Form</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-300">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Online Now - Quick Response</span>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Right Column - Booking Card */}
            <div className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card-glass p-6 sticky top-24"
              >
                <h3 className="text-2xl font-serif font-bold text-gold mb-6">Book {companion.name}</h3>
                
                {/* WhatsApp Quick Contact */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-white font-semibold text-sm">WhatsApp: +91 98765 43210</span>
                  </div>
                  <p className="text-gray-400 text-xs">Click below to chat instantly</p>
                </div>
                
                {/* Rates */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-3 bg-dark-card/50 rounded">
                    <span className="text-gray-300">1 Hour</span>
                    <span className="text-gold font-bold">₹8,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-card/50 rounded">
                    <span className="text-gray-300">2 Hours</span>
                    <span className="text-gold font-bold">₹15,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-dark-card/50 rounded">
                    <span className="text-gray-300">Full Night</span>
                    <span className="text-gold font-bold">₹25,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gold/20 rounded border border-gold/30">
                    <span className="text-white font-semibold">Weekend Special</span>
                    <span className="text-gold font-bold">₹30,000</span>
                  </div>
                </div>

                {/* Availability Status */}
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-green-300 mb-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                    <span className="font-semibold">{companion.availability || 'Available Now'}</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Responds within {companion.responseTime || '< 1 hour'}
                  </p>
                </div>

                {/* Booking Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleWhatsAppBooking}
                    className="w-full btn-gold py-4 flex items-center justify-center gap-3 text-lg font-semibold"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Book via WhatsApp
                  </button>
                  
                  <Link
                    to="/booking"
                    state={{ companion }}
                    className="w-full block text-center py-4 bg-dark-card border-2 border-gold text-gold rounded-lg font-semibold hover:bg-gold/10 transition"
                  >
                    Book Online
                  </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-6 pt-6 border-t border-gold/20 space-y-3 text-sm">
                  <div className="flex items-start gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <span>100% verified & secure booking</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                    </svg>
                    <span>Complete privacy & discretion guaranteed</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-400">
                    <svg className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                    <span>24/7 customer support available</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Our Locations Section */}
          <section className="py-16 border-t border-gold/10 mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">
                Our Locations
              </h2>
              <p className="text-gray-400 text-lg">
                Premium escort services available in major cities across India
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.05 }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {cities.map((city, index) => (
                <motion.div
                  key={city}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Link to={`/escorts/in/${city.toLowerCase().replace(/\s+/g, '-')}`}>
                    <motion.div
                      whileHover={{ y: -5, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="card-glass p-4 text-center cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-dark-bg/95 via-dark-card/90 to-dark-bg/95 group-hover:from-dark-card/80 group-hover:via-gold/10 group-hover:to-dark-card/80 transition-all"></div>
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

            {/* Quick Action */}
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
                  className="px-8 py-3 border-2 border-gold text-gold rounded-lg font-semibold hover:bg-gold/10 transition"
                >
                  View All Escorts
                </motion.button>
              </Link>
            </motion.div>
          </section>

          {/* Back to Escorts */}
          <div className="mt-12 text-center">
            <Link
              to="/escorts"
              className="inline-flex items-center gap-2 text-gold hover:text-gold/80 transition text-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Escorts
            </Link>
          </div>
        </div>
      </div>

      {/* Image Modal/Lightbox */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute -top-12 right-0 text-white hover:text-gold transition text-xl"
              >
                ✕ Close
              </button>
              <img
                src={selectedImage}
                alt={companion.name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default CompanionProfile

