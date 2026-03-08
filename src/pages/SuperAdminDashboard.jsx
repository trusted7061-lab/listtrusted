import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://trustedescort-backend.onrender.com/api'

// ── Ad Card component ──────────────────────────────────────────────────────────
function AdCard({ ad, onApprove, onReject, showActions }) {
  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  return (
    <div className="bg-gray-900/50 border border-purple-500/20 rounded-lg p-5 hover:border-purple-500/40 transition">
      <div className="flex flex-wrap justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {ad.images?.[0] && (
            <img
              src={ad.images[0]}
              alt="Ad"
              className="w-16 h-16 object-cover rounded-lg border border-gray-700 flex-shrink-0"
            />
          )}
          <div>
            <p className="text-white font-semibold text-lg">{ad.title}</p>
            <p className="text-gray-400 text-sm">{ad.advertiser?.name} · {ad.advertiser?.email}</p>
            {ad.description && (
              <p className="text-gray-500 text-xs mt-1 line-clamp-1">{ad.description}</p>
            )}
          </div>
        </div>
        <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[ad.status] || statusColors.pending}`}>
          {ad.status?.toUpperCase()}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
        <div>
          <p className="text-gray-500 text-xs">Location</p>
          <p className="text-white">{ad.location || '—'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Category</p>
          <p className="text-white">{ad.category || '—'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Coins Used</p>
          <p className="text-yellow-400 font-semibold">{ad.coinsUsed || 0} 🪙</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Posted</p>
          <p className="text-white">{new Date(ad.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      {ad.rejectionReason && (
        <div className="mb-3 bg-red-900/20 border border-red-500/20 rounded p-2 text-xs text-red-400">
          ✕ Rejected: {ad.rejectionReason}
        </div>
      )}
      {showActions && (
        <div className="flex gap-3 pt-3 border-t border-gray-700">
          <button
            onClick={() => onApprove(ad.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
          >
            ✓ Approve
          </button>
          <button
            onClick={() => onReject(ad.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold text-sm"
          >
            ✕ Reject & Refund
          </button>
        </div>
      )}
    </div>
  )
}

// Try to refresh the auth token using the stored refresh token
async function tryRefreshToken() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    if (res.ok) {
      const data = await res.json()
      if (data.token) {
        localStorage.setItem('authToken', data.token)
        return data.token
      }
    }
  } catch {}
  return null
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  let token = localStorage.getItem('authToken')

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  }

  try {
    let response = await fetch(url, config)

    // If token expired, try to refresh and retry once
    if (response.status === 401) {
      const newToken = await tryRefreshToken()
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`
        response = await fetch(url, config)
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error)
    throw error
  }
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [loadingLogout, setLoadingLogout] = useState(false)
  const [activeTab, setActiveTab] = useState('ads')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Real data from API
  const [ads, setAds] = useState([])          // all ads
  const [advertisers, setAdvertisers] = useState([])
  const [adFilter, setAdFilter] = useState('all')  // all | pending | approved | rejected
  const [selectedAdvertiserAds, setSelectedAdvertiserAds] = useState(null) // for detail modal
  const [stats, setStats] = useState({
    totalAds: 0,
    pendingAds: 0,
    approvedAds: 0,
    rejectedAds: 0,
    activeAdvertisers: 0,
    totalCoinsDistributed: 0,
    totalLocations: 1057
  })

  const [showCoinModal, setShowCoinModal] = useState(false)
  const [selectedAdvertiser, setSelectedAdvertiser] = useState(null)
  const [coinAmount, setCoinAmount] = useState('')
  const [coinReason, setCoinReason] = useState('bonus')

  // Pending coin requests submitted via localStorage fallback
  const [pendingCoinRequests, setPendingCoinRequests] = useState([])

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('adminUser')

    if (!token) {
      navigate('/admin/login')
      return
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setAdminUser(user)
      } catch (err) {
        console.error('Error parsing admin user:', err)
        setError('Session error. Please login again.')
        navigate('/admin/login')
        return
      }
    }
    setLoading(false)
    fetchDashboardData()
    fetchCoinRequests()

    // Auto-refresh coin requests every 30 seconds
    const coinPoll = setInterval(() => fetchCoinRequests(), 30000)
    return () => clearInterval(coinPoll)
  }, [navigate])

  // Fetch coin requests from backend (real users) + merge localStorage (local-token users)
  const fetchCoinRequests = async () => {
    try {
      // Use apiRequest() so token refresh works on 401
      const data = await apiRequest('/ads/admin/coin-requests')
      const dbRequests = data.success ? (data.requests || []) : []
      console.log(`📋 Fetched ${dbRequests.length} coin requests from database`)
      // Merge with any localStorage requests (from local-token users on same device)
      const localReqs = JSON.parse(localStorage.getItem('pendingCoinRequests') || '[]')
      // Deduplicate by id
      const allIds = new Set(dbRequests.map(r => r.id))
      const uniqueLocal = localReqs.filter(r => !allIds.has(r.id))
      setPendingCoinRequests([...dbRequests, ...uniqueLocal])
    } catch (err) {
      console.error('❌ Failed to fetch coin requests:', err.message)
      // Fallback to localStorage only
      try {
        const localReqs = JSON.parse(localStorage.getItem('pendingCoinRequests') || '[]')
        setPendingCoinRequests(localReqs)
      } catch {}
    }
  }

  // Fetch all dashboard data from API
  const fetchDashboardData = async () => {
    setDataLoading(true)
    setError('')
    try {
      // First, verify admin access
      try {
        const verifyRes = await apiRequest('/ads/admin/verify')
        console.log('✅ Admin verification successful:', verifyRes)
      } catch (verifyError) {
        console.error('❌ Admin verification failed:', verifyError)
        throw verifyError
      }

      // Then fetch dashboard data
      const [statsData, adsData, usersData] = await Promise.all([
        apiRequest('/ads/admin/stats'),
        apiRequest('/ads/admin/all-ads?limit=200'),
        apiRequest('/ads/admin/users?limit=100')
      ])

      if (statsData) {
        setStats(prev => ({
          ...prev,
          totalAds: (statsData.ads?.pending || 0) + (statsData.ads?.approved || 0) + (statsData.ads?.rejected || 0),
          pendingAds: statsData.ads?.pending || 0,
          approvedAds: statsData.ads?.approved || 0,
          rejectedAds: statsData.ads?.rejected || 0,
          totalCoinsDistributed: statsData.coins?.circulatingCoins || 0
        }))
      }

      if (adsData && adsData.ads) {
        setAds(adsData.ads)
      }

      if (usersData && usersData.users) {
        const processedUsers = usersData.users.map(user => ({
          id: user.id,
          name: user.displayName || user.businessName || 'Unknown',
          email: user.email,
          phone: user.phone || 'N/A',
          coins: user.coins || 0,
          totalCoinsEarned: user.totalCoinsEarned || 0,
          totalCoinsSpent: user.totalCoinsSpent || 0,
          adsCount: user.adsCount?.total || 0,
          pendingAds: user.adsCount?.pending || 0,
          approvedAds: user.adsCount?.approved || 0,
          rejectedAds: user.adsCount?.rejected || 0,
          recentAds: user.recentAds || [],
          status: (user.adsCount?.approved || 0) > 0 ? 'active' : (user.coins > 0 ? 'registered' : 'inactive')
        }))
        setAdvertisers(processedUsers)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      if (err.message?.includes('Token expired') || err.message?.includes('Invalid token') || err.message?.includes('401')) {
        setError('Session expired. Please login again.')
        setTimeout(() => navigate('/admin/login'), 2000)
      } else {
        setError(`Unable to load data: ${err.message}`)
      }
    } finally {
      setDataLoading(false)
    }
  }

  const handleApproveAd = async (adId) => {
    try {
      const response = await apiRequest(`/ads/admin/ads/${adId}/approve`, {
        method: 'POST'
      })

      if (response.success) {
        setAds(ads.map(ad => ad.id === adId ? { ...ad, status: 'approved' } : ad))
        setStats(prev => ({
          ...prev,
          pendingAds: Math.max(0, prev.pendingAds - 1),
          approvedAds: prev.approvedAds + 1
        }))
        setSuccessMsg('Ad approved successfully!')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err) {
      setError(`Failed to approve ad: ${err.message}`)
    }
  }

  const handleRejectAd = async (adId) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    try {
      const response = await apiRequest(`/ads/admin/ads/${adId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason: reason })
      })

      if (response.success) {
        setAds(ads.map(ad => ad.id === adId ? { ...ad, status: 'rejected', rejectionReason: reason } : ad))
        setStats(prev => ({
          ...prev,
          pendingAds: Math.max(0, prev.pendingAds - 1),
          rejectedAds: prev.rejectedAds + 1
        }))
        setSuccessMsg('Ad rejected and coins refunded!')
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err) {
      setError(`Failed to reject ad: ${err.message}`)
    }
  }

  const handleAddCoins = async () => {
    if (!selectedAdvertiser || !coinAmount) {
      setError('Please select advertiser and enter coin amount')
      return
    }

    try {
      const response = await apiRequest('/ads/admin/coins/add', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedAdvertiser.id,
          coins: parseInt(coinAmount),
          reason: coinReason
        })
      })

      if (response.success) {
        setAdvertisers(advertisers.map(adv =>
          adv.id === selectedAdvertiser.id
            ? { ...adv, coins: adv.coins + parseInt(coinAmount) }
            : adv
        ))
        setShowCoinModal(false)
        setSelectedAdvertiser(null)
        setCoinAmount('')
        setCoinReason('bonus')
        setSuccessMsg(`${coinAmount} coins added successfully!`)
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (err) {
      setError(`Failed to add coins: ${err.message}`)
    }
  }

  // Approve a coin request — handles both DB requests and localStorage fallback requests
  const handleApproveCoinRequest = async (req) => {
    try {
      if (req.source === 'database') {
        // Real request stored in MongoDB — approve via backend (uses apiRequest for token refresh)
        const data = await apiRequest(`/ads/admin/coin-requests/${req.walletId}/${req.transactionId}/approve`, {
          method: 'POST'
        })
        if (!data.success) throw new Error(data.message || 'Failed to approve')
        // Refresh list from server
        await fetchCoinRequests()
        setSuccessMsg(`✅ Approved ${req.coinsRequested} coins for ${req.userName} (synced to database)`)
      } else {
        // localStorage-only request (user had a local/fake token)
        let apiSuccess = false
        if (req.userId) {
          try {
            const res = await apiRequest('/ads/admin/coins/add', {
              method: 'POST',
              body: JSON.stringify({
                userId: req.userId,
                coins: req.coinsRequested,
                reason: 'Approved coin request'
              })
            })
            if (res.success) apiSuccess = true
          } catch {}
        }
        const updated = pendingCoinRequests.filter(r => r.id !== req.id)
        setPendingCoinRequests(updated)
        localStorage.setItem('pendingCoinRequests', JSON.stringify(updated))
        setSuccessMsg(`✅ Approved ${req.coinsRequested} coins for ${req.userName}${apiSuccess ? ' (synced to database)' : ' (local only — ask user to re-login)'}`)
      }
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      setError(`Failed to approve: ${err.message}`)
    }
  }

  const handleRejectCoinRequest = async (reqId) => {
    try {
      const req = pendingCoinRequests.find(r => r.id === reqId)
      if (req?.source === 'database') {
        // Use apiRequest for token refresh support
        const data = await apiRequest(`/ads/admin/coin-requests/${req.walletId}/${req.transactionId}/reject`, {
          method: 'POST'
        })
        if (!data.success) throw new Error(data.message || 'Failed to reject')
        await fetchCoinRequests()
      } else {
        const updated = pendingCoinRequests.filter(r => r.id !== reqId)
        setPendingCoinRequests(updated)
        localStorage.setItem('pendingCoinRequests', JSON.stringify(updated))
      }
      setSuccessMsg('Coin request rejected')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setError(`Failed to reject: ${err.message}`)
    }
  }

  const handleLogout = async () => {
    setLoadingLogout(true)
    try {
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('adminUser')
      navigate('/admin/login')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setLoadingLogout(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-white mt-4 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="mb-4">Session expired. Please login again.</p>
          <button
            onClick={() => navigate('/admin/login')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black">
      {/* Navbar */}
      <nav className="bg-black/50 border-b border-purple-500/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Super Admin Dashboard
              </h1>
              <p className="text-xs text-gray-400 mt-1">Manage Ads, Advertisers & Coins</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">
                <span className="text-purple-400 font-semibold">{adminUser.email}</span>
              </span>
              <button
                onClick={() => { setDataLoading(true); fetchDashboardData(); }}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                disabled={dataLoading}
              >
                {dataLoading ? '⟳ Refreshing...' : '⟳ Refresh'}
              </button>
              <button
                onClick={handleLogout}
                disabled={loadingLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition text-sm font-medium"
              >
                {loadingLogout ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-green-400">
            ✓ {successMsg}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-8">
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Total Ads</p>
            <p className="text-2xl font-bold text-blue-400">{stats.totalAds}</p>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingAds}</p>
          </div>
          <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Approved Ads</p>
            <p className="text-2xl font-bold text-green-400">{stats.approvedAds}</p>
          </div>
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Rejected Ads</p>
            <p className="text-2xl font-bold text-red-400">{stats.rejectedAds}</p>
          </div>
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Advertisers</p>
            <p className="text-2xl font-bold text-purple-400">{advertisers.length}</p>
          </div>
          <div className="bg-pink-900/30 border border-pink-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Coins in System</p>
            <p className="text-2xl font-bold text-pink-400">{(stats.totalCoinsDistributed / 1000).toFixed(1)}k</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-purple-500/30 flex-wrap">
          <button
            onClick={() => setActiveTab('ads')}
            className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
              activeTab === 'ads'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            📝 Pending Ads ({stats.pendingAds})
          </button>
          <button
            onClick={() => setActiveTab('all-ads')}
            className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
              activeTab === 'all-ads'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            📋 All Ads ({stats.totalAds})
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
              activeTab === 'live'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            🟢 Live Ads ({stats.approvedAds})
          </button>
          <button
            onClick={() => setActiveTab('advertisers')}
            className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
              activeTab === 'advertisers'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            👥 Advertisers ({advertisers.length})
          </button>
          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-6 py-3 font-semibold text-sm transition border-b-2 ${
              activeTab === 'wallets'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            💰 Manage Coins
          </button>
          <button
            onClick={() => { setActiveTab('coin-requests'); fetchCoinRequests() }}
            className={`px-6 py-3 font-semibold text-sm transition border-b-2 relative ${
              activeTab === 'coin-requests'
                ? 'border-yellow-500 text-yellow-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            🪙 Coin Requests
            {pendingCoinRequests.length > 0 && (
              <span className="ml-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCoinRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'ads' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Pending Ads for Approval</h3>
            {ads.filter(ad => ad.status === 'pending').length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400 text-lg">✅ No pending ads — all caught up!</p>
              </div>
            ) : (
              ads.filter(ad => ad.status === 'pending').map(ad => (
                <AdCard key={ad.id} ad={ad} onApprove={handleApproveAd} onReject={handleRejectAd} showActions />
              ))
            )}
          </div>
        )}

        {activeTab === 'all-ads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h3 className="text-xl font-bold text-white">All Ads</h3>
              <div className="flex gap-2">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                  <button
                    key={f}
                    onClick={() => setAdFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                      adFilter === f
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {f} ({f === 'all' ? ads.length : ads.filter(a => a.status === f).length})
                  </button>
                ))}
              </div>
            </div>
            {(adFilter === 'all' ? ads : ads.filter(a => a.status === adFilter)).length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No ads found</p>
              </div>
            ) : (
              (adFilter === 'all' ? ads : ads.filter(a => a.status === adFilter)).map(ad => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  onApprove={handleApproveAd}
                  onReject={handleRejectAd}
                  showActions={ad.status === 'pending'}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'live' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Live / Approved Ads</h3>
            {ads.filter(ad => ad.status === 'approved').length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No live ads yet</p>
              </div>
            ) : (
              ads.filter(ad => ad.status === 'approved').map(ad => (
                <AdCard key={ad.id} ad={ad} onApprove={handleApproveAd} onReject={handleRejectAd} showActions={false} />
              ))
            )}
          </div>
        )}

        {activeTab === 'advertisers' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Advertiser Management</h3>
            <div className="overflow-x-auto rounded-xl border border-purple-500/20">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-900/30 border-b border-purple-500/30">
                    <th className="text-left p-4 text-purple-400">Name</th>
                    <th className="text-left p-4 text-purple-400">Email</th>
                    <th className="text-right p-4 text-purple-400">Coins</th>
                    <th className="text-center p-4 text-purple-400">Total Ads</th>
                    <th className="text-center p-4 text-purple-400">Pending</th>
                    <th className="text-center p-4 text-purple-400">Live</th>
                    <th className="text-center p-4 text-purple-400">Status</th>
                    <th className="text-center p-4 text-purple-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {advertisers.map(adv => (
                    <tr key={adv.id} className="border-b border-gray-700 hover:bg-gray-900/50 transition">
                      <td className="p-4 text-white font-semibold">{adv.name}</td>
                      <td className="p-4 text-gray-400 text-sm">{adv.email}</td>
                      <td className="p-4 text-right text-yellow-400 font-bold">{adv.coins} 🪙</td>
                      <td className="p-4 text-center text-white">{adv.adsCount}</td>
                      <td className="p-4 text-center">
                        <span className={`font-semibold ${adv.pendingAds > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                          {adv.pendingAds}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`font-semibold ${adv.approvedAds > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                          {adv.approvedAds}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          adv.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : adv.status === 'registered'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {adv.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setSelectedAdvertiserAds(adv)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition"
                          >
                            View Ads
                          </button>
                          <button
                            onClick={() => { setSelectedAdvertiser(adv); setShowCoinModal(true) }}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs transition"
                          >
                            Add Coins
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'wallets' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Coin Management</h3>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-6">
              <p className="text-blue-300 mb-2">💡 Quick Add Coins</p>
              <p className="text-gray-400 text-sm">Select an advertiser from the Advertisers tab and click "Add Coins", or use the cards below.</p>
            </div>
            {advertisers.map(adv => (
              <div key={adv.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white font-semibold text-lg">{adv.name}</p>
                    <p className="text-gray-400 text-sm">{adv.email}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>Total ads: <span className="text-white">{adv.adsCount}</span></span>
                      <span>Pending: <span className="text-yellow-400">{adv.pendingAds}</span></span>
                      <span>Live: <span className="text-green-400">{adv.approvedAds}</span></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Current Balance</p>
                    <p className="text-yellow-400 font-bold text-2xl">{adv.coins} 🪙</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedAdvertiser(adv); setShowCoinModal(true) }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                >
                  + Add Coins
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'coin-requests' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Pending Coin Requests
              {pendingCoinRequests.length > 0 && <span className="ml-3 text-yellow-400 text-base">({pendingCoinRequests.length} pending)</span>}
            </h3>
            {pendingCoinRequests.length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No pending coin requests</p>
              </div>
            ) : (
              pendingCoinRequests.map(req => (
                <div key={req.id} className="bg-gray-900/50 border border-yellow-500/20 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white font-semibold text-lg">{req.userName}</p>
                      <p className="text-gray-400 text-sm">{req.userEmail}</p>
                      <p className="text-gray-500 text-xs mt-1">{new Date(req.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold text-2xl">{req.coinsRequested} 🪙</p>
                      <p className="text-gray-400 text-xs">Requested</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveCoinRequest(req)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                      ✓ Approve & Add Coins
                    </button>
                    <button
                      onClick={() => handleRejectCoinRequest(req.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Advertiser Ads Detail Modal */}
      {selectedAdvertiserAds && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6 max-w-3xl w-full mt-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedAdvertiserAds.name}&apos;s Ads</h3>
                <p className="text-gray-400 text-sm">{selectedAdvertiserAds.email}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-gray-400">Total: <span className="text-white font-semibold">{selectedAdvertiserAds.adsCount}</span></span>
                  <span className="text-yellow-400">Pending: <span className="font-semibold">{selectedAdvertiserAds.pendingAds}</span></span>
                  <span className="text-green-400">Live: <span className="font-semibold">{selectedAdvertiserAds.approvedAds}</span></span>
                  <span className="text-pink-400">Coins: <span className="font-semibold">{selectedAdvertiserAds.coins} 🪙</span></span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAdvertiserAds(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {ads.filter(ad => ad.advertiser?.id?.toString() === selectedAdvertiserAds.id?.toString()).length === 0 ? (
                <p className="text-gray-400 text-center py-8">No ads found for this advertiser</p>
              ) : (
                ads
                  .filter(ad => ad.advertiser?.id?.toString() === selectedAdvertiserAds.id?.toString())
                  .map(ad => (
                    <AdCard
                      key={ad.id}
                      ad={ad}
                      onApprove={handleApproveAd}
                      onReject={handleRejectAd}
                      showActions={ad.status === 'pending'}
                    />
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coin Modal */}
      {showCoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-6">Add Coins to Advertiser</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Advertiser</p>
                <p className="text-white font-semibold">{selectedAdvertiser?.name}</p>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Number of Coins</label>
                <input
                  type="number"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Reason</label>
                <select
                  value={coinReason}
                  onChange={(e) => setCoinReason(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="bonus">Sign-up Bonus</option>
                  <option value="promotion">Promotional Bonus</option>
                  <option value="refund">Refund</option>
                  <option value="reward">Reward</option>
                  <option value="purchase">Purchase Verification</option>
                </select>
              </div>

              <div className="bg-purple-900/30 rounded-lg p-4 mt-4">
                <p className="text-gray-400 text-sm">Coins to add:</p>
                <p className="text-yellow-400 font-bold text-xl">{coinAmount || 0} 🪙</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCoinModal(false)
                    setSelectedAdvertiser(null)
                    setCoinAmount('')
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCoins}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                >
                  Confirm & Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
