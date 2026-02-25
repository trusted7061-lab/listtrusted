import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentUser, getCurrentUserProfile, createProfile, logoutUser, deleteUserAccount, imageToBase64, getCurrentUserAds, updateAdStatus, deleteAd, duplicateAd, getAdById, getUserCoins, getCoinPackages, addCoins, generateUPILink, getUPIId } from '../services/profileService'
import { getAllLocationsForAdvertiser } from '../services/locationsData'

function AdvertiserDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [existingProfile, setExistingProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [imagePreview, setImagePreview] = useState([null, null, null])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  
  // My Ads state
  const [userAds, setUserAds] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [showAdForm, setShowAdForm] = useState(false)
  const [editingAdId, setEditingAdId] = useState(null)
  const [deleteAdModal, setDeleteAdModal] = useState(null)
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1) // 1: Ad Details, 2: Promote Ad
  const [userCoins, setUserCoins] = useState(0) // User's coin balance
  const [promotionData, setPromotionData] = useState({
    product: null, // 'super-turbo' or 'turbo'
    days: 7, // Number of days
    timeSlots: [] // 'night', 'morning', 'afternoon', 'evening'
  })
  
  // Add Coins Modal state
  const [showCoinsModal, setShowCoinsModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [paymentStep, setPaymentStep] = useState(1) // 1: Select package, 2: Pay & Confirm
  const [transactionId, setTransactionId] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const coinPackages = getCoinPackages()
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
    description: '',
    height: '',
    ethnicity: 'Indian',
    eyes: '',
    hair: '',
    languages: [],
    services: [],
    hourlyRate: '',
    halfDayRate: '',
    fullDayRate: '',
    overnightRate: '',
    availability: 'Available',
    image: '', // Main profile image
    gallery: ['', '', ''] // Three gallery images
  })

  // Get all locations from centralized data
  const locations = useMemo(() => getAllLocationsForAdvertiser(), [])

  const availableServices = [
    'Dinner & Wine', 'Travel Companion', 'Events', 'Nightlife',
    'Corporate Events', 'Shopping', 'Entertainment', 'Intimate',
    'Private Dates', 'Cultural Events'
  ]

  const availableLanguages = [
    'English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada',
    'Malayalam', 'Bengali', 'Gujarati', 'Punjabi'
  ]

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      navigate('/signin')
      return
    }
    
    setUser(currentUser)
    
    // Load user's coins
    const coins = getUserCoins()
    setUserCoins(coins)
    
    // Load user's ads
    const ads = getCurrentUserAds()
    setUserAds(ads)
    
    // If user has ads, don't show form by default
    if (ads.length > 0) {
      setShowAdForm(false)
    } else {
      setShowAdForm(true)
    }
    
    // Load existing profile if any (for editing)
    const profile = getCurrentUserProfile()
    if (profile) {
      setExistingProfile(profile)
    }
    
    // Listen for profile updates
    const handleProfilesUpdate = () => {
      const updatedAds = getCurrentUserAds()
      setUserAds(updatedAds)
    }
    
    // Listen for coins updates
    const handleCoinsUpdate = (e) => {
      setUserCoins(e.detail.coins)
    }
    
    window.addEventListener('profilesUpdated', handleProfilesUpdate)
    window.addEventListener('coinsUpdated', handleCoinsUpdate)
    return () => {
      window.removeEventListener('profilesUpdated', handleProfilesUpdate)
      window.removeEventListener('coinsUpdated', handleCoinsUpdate)
    }
  }, [navigate])

  // Load ad data for editing
  const handleEditAd = (adId) => {
    const ad = getAdById(adId)
    if (ad) {
      setEditingAdId(adId)
      setCurrentStep(1)
      setPromotionData({
        product: ad.promotion?.product || null,
        days: ad.promotion?.days || 7,
        timeSlots: ad.promotion?.timeSlots || []
      })
      setFormData({
        name: ad.name || '',
        age: ad.age || '',
        location: ad.location || '',
        description: ad.description || '',
        height: ad.height || '',
        ethnicity: ad.ethnicity || 'Indian',
        eyes: ad.eyes || '',
        hair: ad.hair || '',
        languages: ad.languages || [],
        services: ad.services || [],
        hourlyRate: ad.rates?.hourly?.replace('₹', '') || '',
        halfDayRate: ad.rates?.halfDay?.replace('₹', '') || '',
        fullDayRate: ad.rates?.fullDay?.replace('₹', '') || '',
        overnightRate: ad.rates?.overnight?.replace('₹', '') || '',
        availability: ad.availability || 'Available',
        image: ad.image || '',
        gallery: ad.gallery || ['', '', '']
      })
      if (ad.gallery) {
        setImagePreview(ad.gallery)
      }
      setShowAdForm(true)
      window.scrollTo({ top: 500, behavior: 'smooth' })
    }
  }

  // Handle pause/activate ad
  const handleToggleAdStatus = (adId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    updateAdStatus(adId, newStatus)
    setSuccessMessage(`Ad ${newStatus === 'active' ? 'activated' : 'paused'} successfully!`)
  }

  // Handle duplicate ad
  const handleDuplicateAd = (adId) => {
    duplicateAd(adId)
    setSuccessMessage('Ad duplicated successfully!')
  }

  // Handle delete ad
  const handleDeleteAd = (adId) => {
    deleteAd(adId)
    setDeleteAdModal(null)
    setSuccessMessage('Ad deleted successfully!')
  }

  // Filter ads by tab
  const filteredAds = useMemo(() => {
    if (activeTab === 'all') return userAds
    return userAds.filter(ad => ad.status === activeTab)
  }, [userAds, activeTab])

  // Reset form for new ad
  const handleNewAd = () => {
    setEditingAdId(null)
    setCurrentStep(1)
    setPromotionData({
      product: null,
      days: 7,
      timeSlots: []
    })
    setFormData({
      name: '',
      age: '',
      location: '',
      description: '',
      height: '',
      ethnicity: 'Indian',
      eyes: '',
      hair: '',
      languages: [],
      services: [],
      hourlyRate: '',
      halfDayRate: '',
      fullDayRate: '',
      overnightRate: '',
      availability: 'Available',
      image: '',
      gallery: ['', '', '']
    })
    setImagePreview([null, null, null])
    setShowAdForm(true)
    window.scrollTo({ top: 500, behavior: 'smooth' })
  }

  // Handle opening Add Coins modal
  const handleOpenCoinsModal = () => {
    setShowCoinsModal(true)
    setPaymentStep(1)
    setSelectedPackage(null)
    setTransactionId('')
  }

  // Handle package selection and proceed to payment
  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg)
    setPaymentStep(2)
  }

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!transactionId.trim()) {
      alert('Please enter transaction ID')
      return
    }
    
    setPaymentLoading(true)
    
    try {
      // Add coins to user account
      const newBalance = addCoins(selectedPackage.coins, transactionId, selectedPackage.id)
      setUserCoins(newBalance)
      setSuccessMessage(`${selectedPackage.coins} coins added successfully!`)
      setShowCoinsModal(false)
      setPaymentStep(1)
      setSelectedPackage(null)
      setTransactionId('')
    } catch (error) {
      alert(error.message || 'Failed to add coins')
    } finally {
      setPaymentLoading(false)
    }
  }

  // Generate UPI payment link
  const getPaymentLink = () => {
    if (!selectedPackage) return ''
    const txnId = `TE${Date.now()}`
    return generateUPILink(selectedPackage.price, txnId)
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/signin')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm')
      return
    }

    try {
      deleteUserAccount()
      alert('Your account has been successfully deleted')
      navigate('/')
    } catch (error) {
      alert(error.message || 'Failed to delete account')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleArrayToggle = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        [`image${index}`]: 'Please upload a valid image file'
      }))
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [`image${index}`]: 'Image size should be less than 5MB'
      }))
      return
    }
    
    try {
      const base64 = await imageToBase64(file)
      
      // Update preview
      const newPreviews = [...imagePreview]
      newPreviews[index] = base64
      setImagePreview(newPreviews)
      
      // Update form data
      const newGallery = [...formData.gallery]
      newGallery[index] = base64
      setFormData(prev => ({
        ...prev,
        gallery: newGallery,
        image: index === 0 ? base64 : prev.image // First image is also the main profile image
      }))
      
      // Clear error
      setErrors(prev => ({
        ...prev,
        [`image${index}`]: ''
      }))
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [`image${index}`]: 'Failed to process image'
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.age || formData.age < 18 || formData.age > 60) newErrors.age = 'Age must be between 18 and 60'
    if (!formData.location) newErrors.location = 'Location is required'
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.height) newErrors.height = 'Height is required'
    if (formData.languages.length === 0) newErrors.languages = 'Select at least one language'
    if (formData.services.length === 0) newErrors.services = 'Select at least one service'
    if (!formData.hourlyRate || isNaN(formData.hourlyRate)) newErrors.hourlyRate = 'Valid hourly rate is required'
    
    // Validate images
    if (!formData.gallery[0]) newErrors.image0 = 'At least one image is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    // Go to step 2 (Promotion)
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle time slot toggle
  const handleTimeSlotToggle = (slot) => {
    setPromotionData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.includes(slot)
        ? prev.timeSlots.filter(s => s !== slot)
        : [...prev.timeSlots, slot]
    }))
  }

  // Handle product selection
  const handleProductSelect = (product) => {
    setPromotionData(prev => ({
      ...prev,
      product: prev.product === product ? null : product
    }))
  }

  // Calculate promotion cost
  const calculatePromotionCost = () => {
    if (!promotionData.product) return 0
    const basePrice = promotionData.product === 'super-turbo' ? 50 : 25
    const slotsMultiplier = Math.max(1, promotionData.timeSlots.length)
    return basePrice * promotionData.days * slotsMultiplier
  }

  // Final submit (from promotion step)
  const handleFinalSubmit = async (skip = false) => {
    setIsLoading(true)
    setSuccessMessage('')
    
    try {
      const profileData = {
        name: formData.name,
        age: parseInt(formData.age),
        location: formData.location,
        description: formData.description,
        height: formData.height,
        ethnicity: formData.ethnicity,
        eyes: formData.eyes,
        hair: formData.hair,
        languages: formData.languages,
        services: formData.services,
        rates: {
          hourly: `₹${formData.hourlyRate}`,
          halfDay: formData.halfDayRate ? `₹${formData.halfDayRate}` : `₹${parseInt(formData.hourlyRate) * 4}`,
          fullDay: formData.fullDayRate ? `₹${formData.fullDayRate}` : `₹${parseInt(formData.hourlyRate) * 8}`,
          overnight: formData.overnightRate ? `₹${formData.overnightRate}` : `₹${parseInt(formData.hourlyRate) * 10}`
        },
        availability: formData.availability,
        image: formData.gallery[0],
        gallery: formData.gallery.filter(img => img),
        promotion: skip ? null : (promotionData.product ? {
          product: promotionData.product,
          days: promotionData.days,
          timeSlots: promotionData.timeSlots,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + promotionData.days * 24 * 60 * 60 * 1000).toISOString()
        } : null)
      }
      
      await createProfile(profileData, editingAdId)
      
      setSuccessMessage(editingAdId ? 'Ad updated successfully!' : 'Ad created successfully!')
      setShowAdForm(false)
      setEditingAdId(null)
      setCurrentStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      // Refresh ads data
      const updatedAds = getCurrentUserAds()
      setUserAds(updatedAds)
      
    } catch (error) {
      setErrors({ submit: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Check if ad is expired
  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date()
  }

  if (!user) return null

  return (
    <>
      <Helmet>
        <title>Advertiser Dashboard | Trusted Escort</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-dark-bg pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-serif font-bold mb-2">
                  Welcome, <span className="text-gold">{user.businessName || user.name}</span>
                </h1>
                <p className="text-gray-400">
                  Manage your ads and reach more clients
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Coins Balance */}
                <div className="flex items-center gap-2 bg-dark-card border border-gold/30 rounded-lg px-4 py-2">
                  <span className="text-xl">🪙</span>
                  <span className="text-gold font-bold">{userCoins}</span>
                  <span className="text-gray-400 text-sm">Coins</span>
                  <button
                    onClick={handleOpenCoinsModal}
                    className="ml-2 px-3 py-1 bg-gold text-dark-bg rounded text-sm font-semibold hover:bg-gold-light transition"
                  >
                    + Add
                  </button>
                </div>
                <button
                  onClick={handleNewAd}
                  className="px-6 py-2 bg-gold text-dark-bg rounded-lg hover:bg-gold-light transition font-semibold"
                >
                  + Post New Ad
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 border border-gold/30 text-gold rounded-lg hover:bg-gold/10 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400"
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* My Ads Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-card border border-gold/20 rounded-xl p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif font-bold">
                My Ads <span className="text-gold">({userAds.length})</span>
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {['all', 'active', 'paused'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === tab
                      ? 'bg-gold text-dark-bg'
                      : 'bg-dark-bg text-gray-400 hover:text-gold border border-gold/20'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="ml-2 text-xs">
                    ({tab === 'all' ? userAds.length : userAds.filter(a => a.status === tab).length})
                  </span>
                </button>
              ))}
            </div>

            {/* Ads List */}
            {filteredAds.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No ads found</h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'all' 
                    ? "You haven't posted any ads yet. Create your first ad to get started!"
                    : `No ${activeTab} ads found.`}
                </p>
                {activeTab === 'all' && (
                  <button
                    onClick={handleNewAd}
                    className="px-6 py-3 bg-gold text-dark-bg rounded-lg hover:bg-gold-light transition font-semibold"
                  >
                    Create Your First Ad
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAds.map((ad) => (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col md:flex-row gap-4 p-4 bg-dark-bg border border-gold/10 rounded-xl hover:border-gold/30 transition"
                  >
                    {/* Ad Image */}
                    <div className="w-full md:w-32 h-32 flex-shrink-0">
                      <img
                        src={ad.image || ad.gallery?.[0] || '/placeholder.jpg'}
                        alt={ad.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Ad Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{ad.name}</h3>
                          <p className="text-sm text-gray-400">{ad.location}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ad.status === 'active' ? 'bg-green-900/50 text-green-400 border border-green-500/30' :
                          ad.status === 'paused' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/30' :
                          'bg-red-900/50 text-red-400 border border-red-500/30'
                        }`}>
                          {ad.status?.toUpperCase() || 'ACTIVE'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Age:</span>{' '}
                          <span className="text-gray-300">{ad.age}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rate:</span>{' '}
                          <span className="text-gold">{ad.rates?.hourly}/hr</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Views:</span>{' '}
                          <span className="text-gray-300">{ad.views || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Expires:</span>{' '}
                          <span className={isExpired(ad.expiresAt) ? 'text-red-400' : 'text-gray-300'}>
                            {formatDate(ad.expiresAt)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/escorts/${ad.id}`}>
                          <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
                            View
                          </button>
                        </Link>
                        <button
                          onClick={() => handleEditAd(ad.id)}
                          className="px-3 py-1.5 bg-gold/20 text-gold text-sm rounded hover:bg-gold/30 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDuplicateAd(ad.id)}
                          className="px-3 py-1.5 bg-purple-600/20 text-purple-400 text-sm rounded hover:bg-purple-600/30 transition"
                        >
                          📋 Duplicate
                        </button>
                        <button
                          onClick={() => handleToggleAdStatus(ad.id, ad.status)}
                          className={`px-3 py-1.5 text-sm rounded transition ${
                            ad.status === 'active'
                              ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                              : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          }`}
                        >
                          {ad.status === 'active' ? '⏸️ Pause' : '▶️ Activate'}
                        </button>
                        <button
                          onClick={() => setDeleteAdModal(ad.id)}
                          className="px-3 py-1.5 bg-red-600/20 text-red-400 text-sm rounded hover:bg-red-600/30 transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Delete Ad Confirmation Modal */}
          <AnimatePresence>
            {deleteAdModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setDeleteAdModal(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-dark-card border border-gold/20 rounded-xl p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-white mb-4">Delete Ad?</h3>
                  <p className="text-gray-400 mb-6">
                    Are you sure you want to delete this ad? This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setDeleteAdModal(null)}
                      className="px-4 py-2 border border-gold/30 text-gold rounded-lg hover:bg-gold/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteAd(deleteAdModal)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Coins Modal */}
          <AnimatePresence>
            {showCoinsModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                onClick={() => setShowCoinsModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-dark-card border border-gold/20 rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      🪙 {paymentStep === 1 ? 'Add Coins' : 'Complete Payment'}
                    </h3>
                    <button
                      onClick={() => setShowCoinsModal(false)}
                      className="text-gray-400 hover:text-white transition text-xl"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Step 1: Select Package */}
                  {paymentStep === 1 && (
                    <div>
                      <p className="text-gray-400 mb-6">
                        Select a coin package to boost your ads visibility
                      </p>
                      <div className="space-y-3">
                        {coinPackages.map((pkg) => (
                          <div
                            key={pkg.id}
                            onClick={() => handleSelectPackage(pkg)}
                            className={`relative cursor-pointer border-2 rounded-xl p-4 transition flex justify-between items-center ${
                              pkg.popular
                                ? 'border-gold bg-gold/10'
                                : 'border-gold/20 hover:border-gold/50'
                            }`}
                          >
                            {pkg.popular && (
                              <div className="absolute -top-3 left-4 px-2 py-0.5 bg-gold text-dark-bg text-xs font-bold rounded">
                                MOST POPULAR
                              </div>
                            )}
                            <div className="flex items-center gap-4">
                              <div className="text-3xl">🪙</div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xl font-bold text-white">{pkg.coins}</span>
                                  <span className="text-gray-400">Coins</span>
                                  {pkg.savings && (
                                    <span className="px-2 py-0.5 bg-green-600/30 text-green-400 text-xs rounded-full">
                                      Save {pkg.savings}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gold">₹{pkg.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Payment */}
                  {paymentStep === 2 && selectedPackage && (
                    <div>
                      <button
                        onClick={() => setPaymentStep(1)}
                        className="text-gold text-sm mb-4 flex items-center gap-1 hover:underline"
                      >
                        ← Change Package
                      </button>

                      {/* Selected Package Summary */}
                      <div className="bg-dark-bg border border-gold/30 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🪙</span>
                            <span className="text-lg font-bold text-white">{selectedPackage.coins} Coins</span>
                          </div>
                          <span className="text-xl font-bold text-gold">₹{selectedPackage.price}</span>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-4">Pay using UPI</h4>
                        
                        {/* UPI ID Display */}
                        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex gap-2">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-6" />
                              </div>
                              <span className="text-white font-medium">GPay / PhonePe / Paytm</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-dark-bg rounded-lg p-3">
                            <span className="text-gray-400 text-sm">UPI ID:</span>
                            <span className="text-gold font-mono font-bold">{getUPIId()}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(getUPIId())
                                alert('UPI ID copied!')
                              }}
                              className="ml-auto text-xs bg-gold/20 text-gold px-2 py-1 rounded hover:bg-gold/30 transition"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="text-gray-400 text-sm mt-3">
                            Send exactly <span className="text-gold font-bold">₹{selectedPackage.price}</span> to the above UPI ID
                          </p>
                        </div>

                        {/* Pay via App Button (Mobile deep link with fallback) */}
                        <button
                          onClick={() => {
                            const paymentLink = getPaymentLink()
                            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                            
                            if (isMobile) {
                              // On mobile, open the UPI link
                              window.open(paymentLink, '_blank')
                            } else {
                              // On desktop, show instructions
                              alert(
                                'To pay via UPI on desktop:\n\n' +
                                '1. Open a UPI app on your mobile phone (Google Pay, PhonePe, or Paytm)\n' +
                                '2. Use the "Send Money" option\n' +
                                '3. Enter UPI ID: ' + getUPIId() + '\n' +
                                '4. Enter amount: ₹' + selectedPackage.price + '\n' +
                                '5. Complete the payment\n' +
                                '6. Copy the Transaction ID (UTR) from payment confirmation\n' +
                                '7. Come back here and paste it in the Transaction ID field'
                              )
                            }
                          }}
                          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition mb-4"
                        >
                          <span>📱</span> Open UPI App to Pay
                        </button>

                        {/* Transaction ID Input */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Enter Transaction ID / UTR Number
                          </label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="e.g., 1234567890123456"
                            className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition"
                          />
                          <p className="text-gray-500 text-xs mt-2">
                            Find this in your UPI app payment confirmation
                          </p>
                        </div>
                      </div>

                      {/* Confirm Button */}
                      <button
                        onClick={handleConfirmPayment}
                        disabled={paymentLoading || !transactionId.trim()}
                        className="w-full py-4 bg-gold text-dark-bg rounded-lg font-bold text-lg hover:bg-gold-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {paymentLoading ? 'Verifying...' : 'Confirm Payment'}
                      </button>
                      
                      <p className="text-center text-gray-500 text-xs mt-4">
                        Coins will be added instantly after verification
                      </p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create/Edit Ad Form */}
          <AnimatePresence>
            {showAdForm && (
              <>
                {/* Step Indicator */}
                <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-gold' : 'text-gray-500'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-gold text-dark-bg' : 'bg-gray-700 text-gray-400'}`}>
                        1
                      </div>
                      <span className="hidden md:inline font-medium">Ad Details</span>
                    </div>
                    <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-gold' : 'bg-gray-700'}`}></div>
                    <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-gold' : 'text-gray-500'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-gold text-dark-bg' : 'bg-gray-700 text-gray-400'}`}>
                        2
                      </div>
                      <span className="hidden md:inline font-medium">Promote Ad</span>
                    </div>
                  </div>
                </div>

                {/* Step 1: Ad Details Form */}
                {currentStep === 1 && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="bg-dark-card border border-gold/20 rounded-xl p-8 md:p-12 backdrop-blur-sm"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-serif font-bold">
                    {editingAdId ? 'Edit Ad' : 'Create New Ad'}
                  </h2>
                  {userAds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setShowAdForm(false); setEditingAdId(null); setCurrentStep(1); }}
                      className="text-gray-400 hover:text-white transition"
                    >
                      ✕ Close
                    </button>
                  )}
                </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400">
                {errors.submit}
              </div>
            )}

            {/* Image Upload Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gold">Profile Images</h3>
              <p className="text-gray-400 text-sm mb-4">Upload up to 3 images (first image will be your main profile picture)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map(index => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image {index + 1} {index === 0 && <span className="text-red-400">*</span>}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index)}
                        className="hidden"
                        id={`image-upload-${index}`}
                      />
                      <label
                        htmlFor={`image-upload-${index}`}
                        className={`block w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition ${
                          errors[`image${index}`] ? 'border-red-500' : 'border-gold/30 hover:border-gold'
                        } ${imagePreview[index] ? '' : 'flex items-center justify-center'}`}
                      >
                        {imagePreview[index] ? (
                          <img
                            src={imagePreview[index]}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <p className="mt-2 text-sm text-gray-400">Click to upload</p>
                          </div>
                        )}
                      </label>
                    </div>
                    {errors[`image${index}`] && (
                      <p className="text-red-400 text-sm mt-2">{errors[`image${index}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Information */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    className={`w-full px-4 py-3 bg-dark-bg border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition ${
                      errors.name ? 'border-red-500' : 'border-gold/30 hover:border-gold/50'
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-2">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Age <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                    min="18"
                    max="60"
                    className={`w-full px-4 py-3 bg-dark-bg border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition ${
                      errors.age ? 'border-red-500' : 'border-gold/30 hover:border-gold/50'
                    }`}
                  />
                  {errors.age && <p className="text-red-400 text-sm mt-2">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-dark-bg border rounded-lg text-white focus:outline-none focus:border-gold transition ${
                      errors.location ? 'border-red-500' : 'border-gold/30 hover:border-gold/50'
                    }`}
                  >
                    <option value="">Select location</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  {errors.location && <p className="text-red-400 text-sm mt-2">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Height <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g., 5'6&quot;"
                    className={`w-full px-4 py-3 bg-dark-bg border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition ${
                      errors.height ? 'border-red-500' : 'border-gold/30 hover:border-gold/50'
                    }`}
                  />
                  {errors.height && <p className="text-red-400 text-sm mt-2">{errors.height}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Ethnicity</label>
                  <input
                    type="text"
                    name="ethnicity"
                    value={formData.ethnicity}
                    onChange={handleChange}
                    placeholder="e.g., Indian"
                    className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition hover:border-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Eye Color</label>
                  <input
                    type="text"
                    name="eyes"
                    value={formData.eyes}
                    onChange={handleChange}
                    placeholder="e.g., Brown"
                    className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition hover:border-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hair Color</label>
                  <input
                    type="text"
                    name="hair"
                    value={formData.hair}
                    onChange={handleChange}
                    placeholder="e.g., Black"
                    className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition hover:border-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Availability <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-white focus:outline-none focus:border-gold transition hover:border-gold/50"
                  >
                    <option value="Available">Available</option>
                    <option value="Available Today">Available Today</option>
                    <option value="By Appointment">By Appointment</option>
                    <option value="Limited">Limited Availability</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Description <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe yourself and your services (minimum 50 characters)"
                rows="5"
                className={`w-full px-4 py-3 bg-dark-bg border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition resize-none ${
                  errors.description ? 'border-red-500' : 'border-gold/30 hover:border-gold/50'
                }`}
              />
              <div className="flex justify-between mt-2">
                <p className="text-gray-500 text-xs">{formData.description.length}/500 characters</p>
                {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
              </div>
            </div>

            {/* Languages */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Languages <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableLanguages.map(lang => (
                  <motion.button
                    key={lang}
                    type="button"
                    onClick={() => handleArrayToggle('languages', lang)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      formData.languages.includes(lang)
                        ? 'bg-gold text-dark-bg'
                        : 'bg-dark-bg border border-gold/30 text-gold hover:border-gold'
                    }`}
                  >
                    {formData.languages.includes(lang) && '✓ '}
                    {lang}
                  </motion.button>
                ))}
              </div>
              {errors.languages && <p className="text-red-400 text-sm mt-2">{errors.languages}</p>}
            </div>

            {/* Services */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Services Offered <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableServices.map(service => (
                  <motion.button
                    key={service}
                    type="button"
                    onClick={() => handleArrayToggle('services', service)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      formData.services.includes(service)
                        ? 'bg-gold text-dark-bg'
                        : 'bg-dark-bg border border-gold/30 text-gold hover:border-gold'
                    }`}
                  >
                    {formData.services.includes(service) && '✓ '}
                    {service}
                  </motion.button>
                ))}
              </div>
              {errors.services && <p className="text-red-400 text-sm mt-2">{errors.services}</p>}
            </div>

            {/* Rates */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gold">Rates (in ₹)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hourly Rate <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    placeholder="e.g., 5000"
                    className={`w-full px-4 py-3 bg-dark-bg border rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition ${
                      errors.hourlyRate ? 'border-red-500' : 'border-gold/30 hover:border-gold/50'
                    }`}
                  />
                  {errors.hourlyRate && <p className="text-red-400 text-sm mt-2">{errors.hourlyRate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Half Day Rate</label>
                  <input
                    type="number"
                    name="halfDayRate"
                    value={formData.halfDayRate}
                    onChange={handleChange}
                    placeholder="Leave empty for auto-calculation"
                    className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition hover:border-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Day Rate</label>
                  <input
                    type="number"
                    name="fullDayRate"
                    value={formData.fullDayRate}
                    onChange={handleChange}
                    placeholder="Leave empty for auto-calculation"
                    className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition hover:border-gold/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Overnight Rate</label>
                  <input
                    type="number"
                    name="overnightRate"
                    value={formData.overnightRate}
                    onChange={handleChange}
                    placeholder="Leave empty for auto-calculation"
                    className="w-full px-4 py-3 bg-dark-bg border border-gold/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gold transition hover:border-gold/50"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-gold to-gold/80 text-dark-bg rounded-lg hover:from-gold/90 hover:to-gold/70 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Promote Your Ad →
              </button>
            </div>
          </motion.form>
                )}

                {/* Step 2: Promote Your Ad */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-dark-card border border-gold/20 rounded-xl p-8 md:p-12 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-3xl font-serif font-bold">
                        Promote Your <span className="text-gold">Ad</span>
                      </h2>
                      <button
                        type="button"
                        onClick={() => handleFinalSubmit(true)}
                        className="text-gray-400 hover:text-gold transition"
                      >
                        Skip →
                      </button>
                    </div>

                    {/* Coins Balance */}
                    <div className="flex items-center justify-between bg-dark-bg border border-gold/20 rounded-lg p-4 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                          <span className="text-gold text-xl">🪙</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Your Balance</p>
                          <p className="text-xl font-bold text-gold">{userCoins} Coins</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleOpenCoinsModal}
                        className="px-4 py-2 bg-gold text-dark-bg rounded-lg hover:bg-gold-light transition font-medium"
                      >
                        + Add Coins
                      </button>
                    </div>

                    <p className="text-gray-400 mb-6">
                      Your Ad climbs to the top of the listing <span className="text-gold font-semibold">5 times</span> for each time slot chosen.
                    </p>

                    {/* Product Selection */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold mb-4">What product do you want?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Super Turbo */}
                        <div
                          onClick={() => handleProductSelect('super-turbo')}
                          className={`relative cursor-pointer border-2 rounded-xl p-6 transition ${
                            promotionData.product === 'super-turbo'
                              ? 'border-gold bg-gold/10'
                              : 'border-gold/20 hover:border-gold/50'
                          }`}
                        >
                          {promotionData.product === 'super-turbo' && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                              <span className="text-dark-bg">✓</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">💖</span>
                            <h4 className="text-xl font-bold text-gold">SUPER TURBO</h4>
                          </div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2 text-gray-300">
                              <span className="text-gold">⚡</span> 5 bumps for time slot
                            </li>
                            <li className="flex items-center gap-2 text-gray-300">
                              <span className="text-gold">🏷️</span> Tag Super Turbo
                            </li>
                            <li className="flex items-center gap-2 text-gray-300">
                              <span className="text-gold">📷</span> Double photo
                            </li>
                            <li className="flex items-center gap-2 text-gray-300">
                              <span className="text-gold">📐</span> 2.5x bigger listing
                            </li>
                          </ul>
                          <p className="mt-4 text-gold font-bold">50 coins/day/slot</p>
                        </div>

                        {/* Turbo */}
                        <div
                          onClick={() => handleProductSelect('turbo')}
                          className={`relative cursor-pointer border-2 rounded-xl p-6 transition ${
                            promotionData.product === 'turbo'
                              ? 'border-gold bg-gold/10'
                              : 'border-gold/20 hover:border-gold/50'
                          }`}
                        >
                          {promotionData.product === 'turbo' && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                              <span className="text-dark-bg">✓</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🚀</span>
                            <h4 className="text-xl font-bold text-blue-400">TURBO</h4>
                          </div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2 text-gray-300">
                              <span className="text-blue-400">⚡</span> 5 bumps for time slot
                            </li>
                            <li className="flex items-center gap-2 text-gray-300">
                              <span className="text-blue-400">🏷️</span> Tag Turbo
                            </li>
                          </ul>
                          <p className="mt-4 text-blue-400 font-bold">25 coins/day/slot</p>
                        </div>
                      </div>
                    </div>

                    {/* Days Selection */}
                    {promotionData.product && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                      >
                        <h3 className="text-lg font-semibold mb-4">For how many days?</h3>
                        <div className="flex flex-wrap gap-2">
                          {[3, 7, 14, 30].map(days => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => setPromotionData(prev => ({ ...prev, days }))}
                              className={`px-6 py-3 rounded-lg font-medium transition ${
                                promotionData.days === days
                                  ? 'bg-gold text-dark-bg'
                                  : 'bg-dark-bg border border-gold/30 text-gray-300 hover:border-gold'
                              }`}
                            >
                              {days} days
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Time Slots */}
                    {promotionData.product && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8"
                      >
                        <h3 className="text-lg font-semibold mb-4">What time slot do you want?</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { id: 'night', label: 'Night', time: '00:00 - 06:00', icon: '🌙' },
                            { id: 'morning', label: 'Morning', time: '06:00 - 12:00', icon: '🌅' },
                            { id: 'afternoon', label: 'Afternoon', time: '12:00 - 18:00', icon: '☀️' },
                            { id: 'evening', label: 'Evening', time: '18:00 - 00:00', icon: '🌆' }
                          ].map(slot => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => handleTimeSlotToggle(slot.id)}
                              className={`relative p-4 rounded-xl border-2 transition ${
                                promotionData.timeSlots.includes(slot.id)
                                  ? 'border-gold bg-gold/10'
                                  : 'border-gold/20 hover:border-gold/50'
                              }`}
                            >
                              {promotionData.timeSlots.includes(slot.id) && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                                  <span className="text-dark-bg text-xs">✓</span>
                                </div>
                              )}
                              <div className="text-2xl mb-2">{slot.icon}</div>
                              <div className="font-medium text-white">{slot.label}</div>
                              <div className="text-sm text-gray-400">{slot.time}</div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Cost Summary */}
                    {promotionData.product && promotionData.timeSlots.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-dark-bg border border-gold/30 rounded-xl p-6 mb-8"
                      >
                        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Product:</span>
                            <span className="text-white font-medium">
                              {promotionData.product === 'super-turbo' ? 'Super Turbo' : 'Turbo'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-white">{promotionData.days} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Time Slots:</span>
                            <span className="text-white">{promotionData.timeSlots.length} selected</span>
                          </div>
                          <div className="border-t border-gold/20 pt-2 mt-2">
                            <div className="flex justify-between text-lg font-bold">
                              <span className="text-gray-300">Total:</span>
                              <span className="text-gold">{calculatePromotionCost()} Coins</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-6 py-4 border border-gold/30 text-gold rounded-lg hover:bg-gold/10 transition font-medium"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFinalSubmit(false)}
                        disabled={isLoading || (promotionData.product && userCoins < calculatePromotionCost())}
                        className="flex-1 px-8 py-4 bg-gradient-to-r from-gold to-gold/80 text-dark-bg rounded-lg hover:from-gold/90 hover:to-gold/70 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Publishing...' : promotionData.product ? `Publish & Pay ${calculatePromotionCost()} Coins` : 'Publish Ad'}
                      </button>
                    </div>

                    {promotionData.product && userCoins < calculatePromotionCost() && (
                      <p className="text-center text-red-400 mt-4 text-sm">
                        You need {calculatePromotionCost() - userCoins} more coins. Add coins to continue.
                      </p>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>

          {/* Danger Zone - Delete Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 border border-red-500/30 rounded-xl p-6 bg-red-900/10"
          >
            <h3 className="text-xl font-semibold text-red-400 mb-2 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Danger Zone
            </h3>
            <p className="text-gray-400 mb-4">
              Once you delete your account, there is no going back. This will permanently delete your profile and all associated data.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 transition font-semibold"
            >
              Delete Account
            </button>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-card border border-red-500/30 rounded-xl p-8 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-3xl font-serif font-bold text-red-400 mb-2">
                  Delete Account?
                </h2>
                <p className="text-gray-400">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type <span className="text-red-400 font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-4 py-3 bg-dark-bg border border-red-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmText('')
                  }}
                  className="flex-1 px-6 py-3 border border-gold/30 text-gold rounded-lg hover:bg-gold/10 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE'}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AdvertiserDashboard
