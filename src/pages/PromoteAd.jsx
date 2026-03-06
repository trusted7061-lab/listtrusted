import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const API_BASE = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5002/api')

const BOOST_OPTIONS = {
  turbo: {
    name: 'TURBO',
    bumps: 5,
    duration: '5 bumps for time slot',
    photo: '2.5x bigger',
    price: 100,
    description: 'Good visibility boost'
  },
  superTurbo: {
    name: 'SUPER TURBO',
    bumps: 5,
    duration: '5 bumps for time slot',
    photo: 'double photo',
    extraFeature: 'Tag Super Turbo',
    price: 200,
    description: 'Maximum visibility'
  }
}

const TIME_SLOTS = [
  { id: 'all-day', label: 'All Day', time: 'All day', climbs: '20 climbs to the top at day' },
  { id: 'night', label: 'Night', time: '00:00 - 06:00', climbs: '20 climbs to the top at night' },
  { id: 'morning', label: 'Morning', time: '06:00 - 12:00', climbs: '20 climbs to the top in morning' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 - 18:00', climbs: '20 climbs to the top in afternoon' },
  { id: 'evening', label: 'Evening', time: '18:00 - 00:00', climbs: '20 climbs to the top in evening' }
]

const DURATIONS = [
  { value: 1, label: '1 Day' },
  { value: 3, label: '3 Days' },
  { value: 7, label: '7 Days' },
  { value: 15, label: '15 Days' },
  { value: 30, label: '30 Days' }
]

export default function PromoteAd() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [adData, setAdData] = useState(null)
  const [coinBalance, setCoinBalance] = useState(0)
  
  const [formData, setFormData] = useState({
    boostType: 'turbo', // turbo or superTurbo
    duration: 1,
    timeSlot: 'all-day'
  })

  useEffect(() => {
    // Get ad data from location state (passed from PostAd)
    if (location.state?.adData) {
      setAdData(location.state.adData)
    } else {
      // If no ad data, redirect back
      navigate('/post-ad')
    }
    // Fetch coin balance
    fetchCoinBalance()
  }, [location.state, navigate])

  const getLocalCoins = () => {
    const userCoins = localStorage.getItem('userCoins')
    if (userCoins && parseInt(userCoins) > 0) return parseInt(userCoins)
    try {
      const stored = JSON.parse(localStorage.getItem('currentUser') || '{}')
      if (stored.coins) return stored.coins
    } catch {}
    return 0
  }

  const fetchCoinBalance = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/ads/wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const coinVal = data.coins || 0
        setCoinBalance(coinVal)
        localStorage.setItem('userCoins', String(coinVal))
      } else {
        setCoinBalance(getLocalCoins())
      }
    } catch (err) {
      console.error('Failed to fetch coin balance:', err)
      setCoinBalance(getLocalCoins())
    }
  }

  const handleBoostSelect = (type) => {
    setFormData(prev => ({ ...prev, boostType: type }))
  }

  const handleDurationChange = (e) => {
    setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))
  }

  const handleTimeSlotChange = (slotId) => {
    setFormData(prev => ({ ...prev, timeSlot: slotId }))
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSkip = async () => {
    // Post ad without promotion boost
    await submitAd(null)
  }

  const handleNext = async () => {
    // Post ad with promotion boost
    await submitAd(formData)
  }

  const submitAd = async (boostData) => {
    setLoading(true)
    const token = localStorage.getItem('authToken')

    try {
      // Create FormData for file upload
      const uploadFormData = new FormData()
      
      // Add images
      if (adData.images && adData.images.length > 0) {
        adData.images.forEach((img) => {
          uploadFormData.append('images', img.file)
        })
      }

      // Add ad data
      uploadFormData.append('title', adData.title)
      uploadFormData.append('description', adData.description)
      uploadFormData.append('city', adData.city)
      uploadFormData.append('state', adData.state)
      uploadFormData.append('area', adData.area || '')
      
      uploadFormData.append('contact', JSON.stringify({
        phone: adData.phone,
        whatsapp: adData.whatsapp || false
      }))

      uploadFormData.append('profileInfo', JSON.stringify({
        name: adData.name,
        age: adData.age,
        gender: adData.gender,
        nationality: adData.nationality || '',
        ethnicity: adData.ethnicity || '',
        bodyType: adData.bodyType,
        hairColor: adData.hairColor || '',
        breastSize: adData.breastSize || '',
        breastType: adData.breastType || ''
      }))

      uploadFormData.append('services', JSON.stringify(adData.services || []))
      uploadFormData.append('optionalInfo', JSON.stringify(adData.optionalInfo || []))

      // Add boost data if selected
      if (boostData) {
        uploadFormData.append('boost', JSON.stringify({
          type: boostData.boostType,
          duration: boostData.duration,
          timeSlot: boostData.timeSlot,
          costCoins: boostData.boostType === 'superTurbo' ? 200 : 100
        }))
      }

      const res = await fetch(`${API_BASE}/ads/create`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: uploadFormData
      })

      const data = await res.json()
      if (res.ok) {
        showToast('Ad posted successfully!')
        setTimeout(() => navigate('/advertiser-dashboard'), 2000)
      } else {
        showToast(data.message || 'Failed to post ad')
      }
    } catch (error) {
      showToast('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!adData) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Promote Your Ad – TrustedEsco</title>
      </Helmet>

      <div className="min-h-screen bg-dark-bg">
        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 mb-8"
          >
            <p className="text-yellow-400 text-sm">
              ℹ️ The ad is in the moderation queue. Promote to get it live right now!
            </p>
          </motion.div>

          {/* Coin Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-white font-semibold">{coinBalance} Coins</span>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              + Add Coins
            </button>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glass rounded-xl p-8"
          >
            <div className="mb-8">
              <h2 className="font-serif text-2xl font-bold text-white mb-4">Promote your AD</h2>
              <p className="text-gray-400">Your Ad climbs to the top of the listing 5 times for each time slot chosen.</p>
            </div>

            {/* Boost Options */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-4">What product do you want?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Turbo Option */}
                <motion.button
                  onClick={() => handleBoostSelect('turbo')}
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    formData.boostType === 'turbo'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gold/20 bg-dark-card/50 hover:border-gold/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white mb-2">TURBO</h4>
                      <div className="space-y-1 text-sm text-gray-400">
                        <div>✓ 5 bumps for time slot</div>
                        <div>✓ 2.5x bigger</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">100</div>
                      <div className="text-xs text-gray-400">coins</div>
                    </div>
                  </div>
                </motion.button>

                {/* Super Turbo Option */}
                <motion.button
                  onClick={() => handleBoostSelect('superTurbo')}
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    formData.boostType === 'superTurbo'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gold/20 bg-dark-card/50 hover:border-gold/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white mb-2">SUPER TURBO</h4>
                      <div className="space-y-1 text-sm text-gray-400">
                        <div>✓ 5 bumps for time slot</div>
                        <div>✓ Double photo</div>
                        <div>✓ Tag Super Turbo</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">200</div>
                      <div className="text-xs text-gray-400">coins</div>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-4">For how many days?</h3>
              <select
                value={formData.duration}
                onChange={handleDurationChange}
                className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-3 text-white focus:border-gold/50 focus:outline-none transition-colors"
              >
                {DURATIONS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Time Slots */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-4">What time slot do you want?</h3>
              <div className="space-y-3">
                {TIME_SLOTS.map(slot => (
                  <label
                    key={slot.id}
                    className="flex items-center gap-4 p-4 border border-gold/20 rounded-lg cursor-pointer hover:bg-gold/5 transition-colors"
                  >
                    <input
                      type="radio"
                      name="timeSlot"
                      value={slot.id}
                      checked={formData.timeSlot === slot.id}
                      onChange={() => handleTimeSlotChange(slot.id)}
                      className="w-4 h-4 accent-gold"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-white">{slot.label}</div>
                      <div className="text-xs text-gray-400">{slot.time}</div>
                      <div className="text-xs text-gray-500">{slot.climbs}</div>
                    </div>
                    {formData.timeSlot === slot.id && !['all-day'].includes(slot.id) && (
                      <button
                        type="button"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                      >
                        SELECT
                      </button>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSkip}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg border border-gold/20 text-gray-400 hover:text-white hover:border-gold/50 transition-colors disabled:opacity-50 font-semibold"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'NEXT'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-dark-card border border-gold/30 text-white text-sm px-6 py-3 rounded-xl shadow-xl z-50"
        >
          {toast}
        </motion.div>
      )}
    </>
  )
}
