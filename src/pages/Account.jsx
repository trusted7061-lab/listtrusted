import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const API_BASE = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://trustedescort-backend.onrender.com/api')

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Account() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [coins, setCoins] = useState(0)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  const [formData, setFormData] = useState({
    displayName: '',
    businessName: '',
    email: '',
    phone: '',
    location: '',
    description: ''
  })

  useEffect(() => {
    loadProfile()
    fetchCoinBalance()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setFormData({
          displayName: data.displayName || '',
          businessName: data.businessName || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          description: data.description || ''
        })
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem('currentUser')
        if (stored) {
          const parsed = JSON.parse(stored)
          setUser(parsed)
          setFormData({
            displayName: parsed.displayName || '',
            businessName: parsed.businessName || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            location: parsed.location || '',
            description: parsed.description || ''
          })
        }
      }
    } catch {
      const stored = localStorage.getItem('currentUser')
      if (stored) {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        setFormData({
          displayName: parsed.displayName || '',
          businessName: parsed.businessName || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          location: parsed.location || '',
          description: parsed.description || ''
        })
      }
    } finally {
      setIsLoading(false)
    }
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
        setCoins(coinVal)
        localStorage.setItem('userCoins', String(coinVal))
      } else {
        const local = localStorage.getItem('userCoins')
        if (local) setCoins(parseInt(local))
      }
    } catch {
      const local = localStorage.getItem('userCoins')
      if (local) setCoins(parseInt(local))
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    const token = localStorage.getItem('authToken')

    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: formData.displayName,
          businessName: formData.businessName,
          phone: formData.phone,
          location: formData.location,
          description: formData.description
        })
      })

      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: data.user, isAuthenticated: true } }))
        setIsEditing(false)
        showToast('Profile updated successfully!')
      } else {
        showToast(data.message || 'Failed to update profile')
      }
    } catch (error) {
      showToast('Error: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      showToast('Password must be at least 6 characters')
      return
    }

    setChangingPassword(true)
    const token = localStorage.getItem('authToken')

    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await res.json()
      if (res.ok) {
        showToast('Password changed successfully!')
        setShowPasswordModal(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        showToast(data.message || 'Failed to change password')
      }
    } catch (error) {
      showToast('Error: ' + error.message)
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: null, isAuthenticated: false } }))
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-gray-400">Loading account...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="card-glass rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <h2 className="font-serif text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-gray-400 mb-6">Please sign in to view your account.</p>
          <div className="space-y-3">
            <Link to="/signin" className="block btn-gold px-6 py-3 rounded-lg text-sm font-semibold">
              Sign In
            </Link>
            <Link to="/advertiser-signup" className="block btn-outline px-6 py-3 rounded-lg text-sm font-semibold">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'

  return (
    <>
      <Helmet>
        <title>My Account – TrustedEsco</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 py-10">

          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8"
          >
            <h1 className="font-serif text-3xl font-bold text-white mb-1">My Account</h1>
            <p className="text-gray-400 text-sm">Manage your profile and settings</p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="card-glass rounded-xl p-6 md:p-8 mb-6 border border-gold/10"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/30 to-purple-500/30 border-2 border-gold/40 flex items-center justify-center text-3xl">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-xl font-bold text-white mb-1">
                  {user.displayName || user.businessName || user.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-gray-400 text-sm mb-3">{user.email}</p>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-gold/10 border border-gold/30 text-gold">
                    {user.userType === 'advertiser' ? '📢 Advertiser' : '👤 User'}
                  </span>
                  {user.isEmailVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-green-400/10 border border-green-400/30 text-green-400">
                      ✓ Email Verified
                    </span>
                  )}
                  {user.isPhoneVerified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-green-400/10 border border-green-400/30 text-green-400">
                      ✓ Phone Verified
                    </span>
                  )}
                </div>

                <p className="text-gray-500 text-xs">Member since {memberSince}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline px-5 py-2 rounded-lg text-sm font-semibold"
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-gold px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : '💾 Save'}
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); loadProfile() }}
                      className="btn-outline px-5 py-2 rounded-lg text-sm font-semibold"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6"
          >
            <div className="card-glass rounded-xl p-5 border border-blue-400/20 text-center">
              <div className="text-2xl mb-2">💰</div>
              <p className="font-serif text-2xl font-bold text-white">{coins}</p>
              <p className="text-gray-400 text-xs">Coin Balance</p>
            </div>
            <div className="card-glass rounded-xl p-5 border border-gold/20 text-center">
              <div className="text-2xl mb-2">📢</div>
              <p className="font-serif text-2xl font-bold text-white">{user.userType === 'advertiser' ? 'Yes' : 'No'}</p>
              <p className="text-gray-400 text-xs">Advertiser Account</p>
            </div>
            <div className="card-glass rounded-xl p-5 border border-purple-400/20 text-center">
              <div className="text-2xl mb-2">🔐</div>
              <p className="font-serif text-2xl font-bold text-white">{user.authProvider === 'google' ? 'Google' : 'Email'}</p>
              <p className="text-gray-400 text-xs">Login Method</p>
            </div>
          </motion.div>

          {/* Profile Details / Edit Form */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="card-glass rounded-xl p-6 md:p-8 mb-6 border border-gold/10"
          >
            <h3 className="font-serif text-lg font-bold text-white mb-6">Profile Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Display Name */}
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Display Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-gold/50 focus:outline-none transition-colors"
                    placeholder="Your display name"
                  />
                ) : (
                  <p className="text-white text-sm py-2.5">{formData.displayName || '—'}</p>
                )}
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Business Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-gold/50 focus:outline-none transition-colors"
                    placeholder="Your business name"
                  />
                ) : (
                  <p className="text-white text-sm py-2.5">{formData.businessName || '—'}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Email</label>
                <p className="text-white text-sm py-2.5">{formData.email || '—'}</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-gold/50 focus:outline-none transition-colors"
                    placeholder="10-digit phone number"
                  />
                ) : (
                  <p className="text-white text-sm py-2.5">{formData.phone || '—'}</p>
                )}
              </div>

              {/* Location */}
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-xs mb-1.5">Location</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-gold/50 focus:outline-none transition-colors"
                    placeholder="City, State"
                  />
                ) : (
                  <p className="text-white text-sm py-2.5">{formData.location || '—'}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-gray-400 text-xs mb-1.5">About / Description</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-gold/50 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about yourself or your business"
                  />
                ) : (
                  <p className="text-white text-sm py-2.5">{formData.description || '—'}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="card-glass rounded-xl p-6 md:p-8 mb-6 border border-gold/10"
          >
            <h3 className="font-serif text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <Link
                to="/advertiser-dashboard"
                className="flex items-center gap-3 p-4 rounded-lg border border-gold/20 hover:border-gold/40 hover:bg-gold/5 transition-colors"
              >
                <span className="text-xl">📊</span>
                <div>
                  <p className="text-white text-sm font-semibold">Dashboard</p>
                  <p className="text-gray-500 text-xs">View your ads & stats</p>
                </div>
              </Link>

              <Link
                to="/post-ad"
                className="flex items-center gap-3 p-4 rounded-lg border border-gold/20 hover:border-gold/40 hover:bg-gold/5 transition-colors"
              >
                <span className="text-xl">📝</span>
                <div>
                  <p className="text-white text-sm font-semibold">Post New Ad</p>
                  <p className="text-gray-500 text-xs">Create a new listing</p>
                </div>
              </Link>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-3 p-4 rounded-lg border border-gold/20 hover:border-gold/40 hover:bg-gold/5 transition-colors text-left w-full"
              >
                <span className="text-xl">🔑</span>
                <div>
                  <p className="text-white text-sm font-semibold">Change Password</p>
                  <p className="text-gray-500 text-xs">Update your password</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="card-glass rounded-xl p-6 md:p-8 border border-red-500/10"
          >
            <h3 className="font-serif text-lg font-bold text-white mb-4">Session</h3>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              🚪 Logout
            </button>
          </motion.div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-glass rounded-xl p-6 md:p-8 max-w-md w-full border border-gold/20"
          >
            <h3 className="font-serif text-xl font-bold text-white mb-6">Change Password</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-gold/50 focus:outline-none transition-colors"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-gold/50 focus:outline-none transition-colors"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white text-sm focus:border-gold/50 focus:outline-none transition-colors"
                  placeholder="Repeat new password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="flex-1 btn-outline px-4 py-2.5 rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="flex-1 btn-gold px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
