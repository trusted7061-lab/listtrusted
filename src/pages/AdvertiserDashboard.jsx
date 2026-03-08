import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const API_BASE = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://trustedescort-backend.onrender.com/api')

// Check if a token looks like a valid JWT (three dot-separated base64 segments)
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false
  if (token.startsWith('local-token-')) return false
  const parts = token.split('.')
  return parts.length === 3 && parts.every(p => p.length > 0)
}

// Try to refresh the auth token using the stored refresh token
const tryRefreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken || !isValidJWT(refreshToken)) return null
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (res.ok) {
      const data = await res.json()
      if (data.accessToken || data.token) {
        const newToken = data.accessToken || data.token
        localStorage.setItem('authToken', newToken)
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
        return newToken
      }
    }
  } catch {}
  return null
}

// Fetch with automatic token refresh on 401 or malformed token
const fetchWithRefresh = async (url, options = {}) => {
  let token = localStorage.getItem('authToken')

  // If token is obviously invalid, try refreshing first instead of sending a bad token
  if (!isValidJWT(token)) {
    const newToken = await tryRefreshToken()
    if (newToken) {
      token = newToken
    } else {
      // No valid token at all — return a fake 401 response
      return new Response(JSON.stringify({ message: 'No valid session' }), { status: 401 })
    }
  }

  const config = {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` },
  }
  let res = await fetch(url, config)
  if (res.status === 401) {
    const newToken = await tryRefreshToken()
    if (newToken) {
      config.headers.Authorization = `Bearer ${newToken}`
      res = await fetch(url, config)
    }
  }
  return res
}

const STATUS_LABEL = {
  pending: { label: 'Pending Review', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
  approved: { label: 'Live', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  rejected: { label: 'Rejected', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  expired: { label: 'Expired', color: 'text-gray-400 bg-gray-400/10 border-gray-400/30' },
  inactive: { label: 'Inactive', color: 'text-gray-500 bg-gray-500/10 border-gray-500/30' },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function AdvertiserDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [ads, setAds] = useState([])
  const [loadingAds, setLoadingAds] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [toast, setToast] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [coins, setCoins] = useState(0)
  const [loadingCoins, setLoadingCoins] = useState(true)
  const [showCoinModal, setShowCoinModal] = useState(false)
  const [selectedCoins, setSelectedCoins] = useState(null)
  const [requestingCoins, setRequestingCoins] = useState(false)
  const [needsRelogin, setNeedsRelogin] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('currentUser')
    if (!stored) {
      setIsAuthenticated(false)
      setIsChecking(false)
      return
    }
    setUser(JSON.parse(stored))
    setIsAuthenticated(true)
    setIsChecking(false)

    // Check if token is a valid JWT — if not, show re-login banner
    const token = localStorage.getItem('authToken')
    if (!isValidJWT(token)) {
      setNeedsRelogin(true)
      setCoins(0)
      setLoadingCoins(false)
      return // skip API calls — they'll all fail
    }

    fetchAds()
    fetchCoins()

    // Re-fetch coins when admin adds them (same session)
    const onCoinsUpdated = () => fetchCoins()
    window.addEventListener('coinsUpdated', onCoinsUpdated)

    // Poll wallet balance every 15 seconds (catches admin-added coins from other sessions)
    const pollInterval = setInterval(() => fetchCoins(), 15000)

    return () => {
      window.removeEventListener('coinsUpdated', onCoinsUpdated)
      clearInterval(pollInterval)
    }
  }, [])

  const fetchAds = async () => {
    setLoadingAds(true)
    try {
      const res = await fetchWithRefresh(`${API_BASE}/ads/my-ads`)
      if (res.ok) {
        const data = await res.json()
        setAds(data.ads || [])
      } else {
        // Fallback: load from localStorage
        const localAds = JSON.parse(localStorage.getItem('localAds') || '[]')
        setAds(localAds)
      }
    } catch {
      const localAds = JSON.parse(localStorage.getItem('localAds') || '[]')
      setAds(localAds)
    } finally {
      setLoadingAds(false)
    }
  }

  const getLocalCoins = () => {
    // Try userCoins first, then check currentUser object
    const userCoins = localStorage.getItem('userCoins')
    if (userCoins && parseInt(userCoins) > 0) return parseInt(userCoins)
    try {
      const stored = JSON.parse(localStorage.getItem('currentUser') || '{}')
      if (stored.coins) return stored.coins
    } catch {}
    return 0
  }

  const fetchCoins = async () => {
    setLoadingCoins(true)
    try {
      const res = await fetchWithRefresh(`${API_BASE}/ads/wallet/balance`)
      if (res.ok) {
        const data = await res.json()
        const coinVal = data.coins || 0
        setCoins(coinVal)
        localStorage.setItem('userCoins', String(coinVal))
      } else {
        setCoins(getLocalCoins())
      }
    } catch {
      setCoins(getLocalCoins())
    } finally {
      setLoadingCoins(false)
    }
  }

  const handleRelogin = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('userCoins')
    navigate('/sign-in')
  }

  const handleRequestCoins = async (amount) => {
    if (needsRelogin) {
      showToast('⚠️ Please sign in again first (see banner above).')
      setShowCoinModal(false)
      setRequestingCoins(false)
      return
    }

    setRequestingCoins(true)
    try {
      const res = await fetchWithRefresh(`${API_BASE}/ads/request-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coinsRequested: amount }),
      })
      if (res.ok) {
        showToast(`✅ Coin request for ${amount} coins submitted to admin for approval`)
        setShowCoinModal(false)
        setSelectedCoins(null)
      } else {
        const err = await res.json().catch(() => ({}))
        if (res.status === 401) {
          setNeedsRelogin(true)
          showToast('⚠️ Session expired. Please sign in again.')
          setShowCoinModal(false)
        } else {
          showToast(err.message || 'Failed to request coins')
        }
      }
    } catch (error) {
      showToast('Network error. Please check your connection.')
    } finally {
      setRequestingCoins(false)
    }
  }

  const handleDelete = async (adId) => {
    try {
      const res = await fetchWithRefresh(`${API_BASE}/ads/${adId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setAds(prev => prev.filter(a => (a._id || a.id) !== adId))
        showToast('Ad removed successfully')
      } else {
        // Local fallback
        const localAds = JSON.parse(localStorage.getItem('localAds') || '[]').filter(a => a.id !== adId)
        localStorage.setItem('localAds', JSON.stringify(localAds))
        setAds(localAds)
        showToast('Ad removed')
      }
    } catch {
      showToast('Failed to remove ad')
    }
    setDeleteId(null)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: null, isAuthenticated: false } }))
    navigate('/')
  }

  // Stats
  const totalAds = ads.length
  const liveAds = ads.filter(a => (a.adminApprovalStatus || a.status) === 'approved').length
  const pendingAds = ads.filter(a => (a.adminApprovalStatus || a.status) === 'pending').length
  const rejectedAds = ads.filter(a => (a.adminApprovalStatus || a.status) === 'rejected').length

  const statCards = [
    { label: 'Total Ads Posted', value: totalAds, icon: '📋', color: 'border-gold/30' },
    { label: 'Live Ads', value: liveAds, icon: '🟢', color: 'border-green-400/30' },
    { label: 'Pending Review', value: pendingAds, icon: '🕐', color: 'border-yellow-400/30' },
    { label: 'My Coins', value: loadingCoins ? '–' : coins, icon: '💰', color: 'border-blue-400/30' },
  ]

  return (
    <>
      <Helmet>
        <title>Advertiser Dashboard – TrustedEsco</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {isChecking ? (
        // Loading state
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      ) : !isAuthenticated ? (
        // Not logged in
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
          <div className="card-glass rounded-xl p-8 max-w-md w-full mx-4 text-center">
            <h2 className="font-serif text-2xl font-bold text-white mb-4">Login Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to access your advertiser dashboard.</p>
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
      ) : (
        // Authenticated - Show dashboard
        <div className="min-h-screen bg-dark-bg">
        {/* Top bar */}
        <div className="bg-dark-card border-b border-gold/10 px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-bold text-gold">TrustedEsco</Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">
              Hi, <span className="text-white">{user?.displayName || user?.businessName || user?.name || user?.email?.split('@')[0] || 'Advertiser'}</span>
            </span>
            <Link to="/post-ad" className="btn-gold px-4 py-2 rounded-lg text-xs font-semibold">+ Post New Ad</Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 text-xs transition-colors">Logout</button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Re-login banner */}
          {needsRelogin && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-yellow-400 font-semibold text-sm">⚠️ Your session needs to be refreshed</p>
                <p className="text-gray-400 text-xs mt-1">Please sign in again to request coins and manage your ads. Your data is safe.</p>
              </div>
              <button
                onClick={handleRelogin}
                className="btn-gold px-6 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap"
              >
                Sign In Again
              </button>
            </div>
          )}

          {/* Page heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="font-serif text-3xl font-bold text-white mb-1">Advertiser Dashboard</h1>
            <p className="text-gray-400 text-sm">Manage your ads and track performance</p>
          </motion.div>

          {/* Stat Cards */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className={`card-glass p-6 border ${s.color} rounded-xl`}
              >
                <div className="text-2xl mb-3">{s.icon}</div>
                <p className="font-serif text-4xl font-bold text-white mb-1">{loadingAds ? '–' : s.value}</p>
                <p className="text-gray-400 text-xs">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-wrap gap-3 mb-10">
            <Link to="/post-ad" className="btn-gold px-6 py-2.5 rounded-lg text-sm font-semibold">+ Post New Ad</Link>
            <Link to="/account" className="btn-outline px-6 py-2.5 rounded-lg text-sm font-semibold">Edit Profile</Link>
            <button 
              onClick={() => setShowCoinModal(true)} 
              className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-blue-400/40 text-blue-400 hover:text-blue-300 hover:border-blue-400/60 transition-colors"
            >
              💰 Request Coins
            </button>
            <button onClick={fetchAds} className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-gold/20 text-gray-400 hover:text-white hover:border-gold/50 transition-colors">
              🔄 Refresh
            </button>
          </motion.div>

          {/* Ad List */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <h2 className="font-serif text-xl font-semibold text-white mb-5">Your Ads</h2>

            {loadingAds ? (
              <div className="card-glass p-12 text-center">
                <p className="text-gray-400 text-sm">Loading your ads…</p>
              </div>
            ) : ads.length === 0 ? (
              <div className="card-glass p-12 text-center rounded-xl">
                <p className="text-4xl mb-4">📭</p>
                <h3 className="font-serif text-xl font-semibold text-white mb-3">No ads yet</h3>
                <p className="text-gray-400 text-sm mb-6">Post your first ad and start reaching clients across India.</p>
                <Link to="/post-ad" className="btn-gold px-8 py-3 rounded-lg text-sm font-semibold">Post Your First Ad</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {ads.map(ad => {
                  const adId = ad._id || ad.id
                  const approvalStatus = ad.adminApprovalStatus || ad.status || 'pending'
                  const sl = STATUS_LABEL[approvalStatus] || STATUS_LABEL.pending
                  return (
                    <motion.div
                      key={adId}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="card-glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-white font-medium text-sm truncate">{ad.title || 'Untitled Ad'}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${sl.color}`}>
                            {sl.label}
                          </span>
                          {ad.isPremium && (
                            <span className="text-xs px-2 py-0.5 rounded-full border border-gold/40 text-gold bg-gold/10 font-medium">⭐ Premium</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          {ad.city && <span>📍 {ad.city}</span>}
                          {ad.contact?.phone && <span>📞 {ad.contact.phone}</span>}
                          {ad.createdAt && <span>🗓 {new Date(ad.createdAt).toLocaleDateString('en-IN')}</span>}
                          {ad.rejectionReason && <span className="text-red-400">Reason: {ad.rejectionReason}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {deleteId === adId ? (
                          <>
                            <span className="text-xs text-gray-400">Remove this ad?</span>
                            <button
                              onClick={() => handleDelete(adId)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              Yes, remove
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="text-xs px-3 py-1.5 rounded-lg border border-gold/20 text-gray-400 hover:text-white transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteId(adId)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/50 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      )}

      {/* Coin Request Modal */}
      {showCoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card-glass rounded-xl p-8 max-w-md w-full"
          >
            <h2 className="font-serif text-2xl font-bold text-white mb-4">Request Coins</h2>
            <p className="text-gray-400 mb-6">Select the number of coins you want to request. The admin will review and approve your request.</p>
            
            <div className="space-y-3 mb-6">
              {[
                { amount: 200, desc: 'Basic Package' },
                { amount: 500, desc: 'Popular Package' },
                { amount: 1000, desc: 'Premium Package' }
              ].map(pkg => (
                <button
                  key={pkg.amount}
                  onClick={() => setSelectedCoins(pkg.amount)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedCoins === pkg.amount
                      ? 'border-blue-400 bg-blue-400/10 text-white'
                      : 'border-gold/20 bg-dark-card/50 text-gray-300 hover:border-gold/30'
                  }`}
                >
                  <div className="font-semibold">{pkg.amount} Coins</div>
                  <div className="text-xs text-gray-400">{pkg.desc}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => {
                  setShowCoinModal(false)
                  setSelectedCoins(null)
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gold/20 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedCoins && handleRequestCoins(selectedCoins)}
                disabled={!selectedCoins || requestingCoins}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                  selectedCoins && !requestingCoins
                    ? 'btn-gold text-dark-bg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {requestingCoins ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>

            {/* WhatsApp option */}
            <div className="border-t border-gold/10 pt-4">
              <p className="text-gray-500 text-xs text-center mb-3">Or request coins directly via WhatsApp</p>
              <a
                href={`https://wa.me/919229604907?text=${encodeURIComponent(`Hi Admin, I am an advertiser on TrustedEsco.\n\nI would like to request ${selectedCoins || ''} coins for my account.\n\nMy email: ${user?.email || 'N/A'}\nMy name: ${user?.displayName || user?.businessName || 'N/A'}\n\nPlease approve my coin request. Thank you!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.947 1.347l-.355.199-3.682.993 1.012-3.678-.235-.374A9.86 9.86 0 015.031 3.284c5.432 0 9.873 4.441 9.873 9.873 0 2.65-.997 5.151-2.813 7.06l-.262.214-3.822-1.02.667 2.989.261-.042a9.908 9.908 0 004.761-1.486l.327-.206 3.957 1.06-1.274-4.648.23-.365a9.884 9.884 0 001.395-5.159c0-5.432-4.441-9.873-9.873-9.873"/></svg>
                Request via WhatsApp
              </a>
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
