import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingLogout, setLoadingLogout] = useState(false)
  const [activeTab, setActiveTab] = useState('ads') // ads, advertisers, wallets
  const [error, setError] = useState('')

  // Mock data - Replace with API calls
  const [ads, setAds] = useState([
    {
      id: 1,
      title: 'Premium Escort Services Delhi',
      advertiser: { name: 'John Advertiser', email: 'john@ads.com', id: 101 },
      status: 'pending',
      coins: 50,
      location: 'New Delhi',
      createdAt: '2026-03-01',
      image: '👤'
    },
    {
      id: 2,
      title: 'Bangalore Elite Companions',
      advertiser: { name: 'Sarah Marketing', email: 'sarah@ads.com', id: 102 },
      status: 'approved',
      coins: 100,
      location: 'Bangalore',
      createdAt: '2026-02-28',
      image: '👤'
    }
  ])

  const [advertisers, setAdvertisers] = useState([
    { id: 101, name: 'John Advertiser', email: 'john@ads.com', coins: 450, adsCount: 5, status: 'active' },
    { id: 102, name: 'Sarah Marketing', email: 'sarah@ads.com', coins: 1200, adsCount: 8, status: 'active' },
    { id: 103, name: 'Mike Promotions', email: 'mike@ads.com', coins: 150, adsCount: 2, status: 'inactive' }
  ])

  const [stats, setStats] = useState({
    totalAds: 468,
    pendingAds: 2,
    approvedAds: 466,
    activeAdvertisers: 150,
    totalCoinsDistributed: 15000,
    totalLocations: 1057
  })

  const [showCoinModal, setShowCoinModal] = useState(false)
  const [selectedAdvertiser, setSelectedAdvertiser] = useState(null)
  const [coinAmount, setCoinAmount] = useState('')
  const [coinReason, setCoinReason] = useState('bonus')

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
      }
    }
    setLoading(false)
  }, [navigate])

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

  const handleApproveAd = (adId) => {
    setAds(ads.map(ad => 
      ad.id === adId ? { ...ad, status: 'approved' } : ad
    ))
    setStats({ ...stats, pendingAds: stats.pendingAds - 1, approvedAds: stats.approvedAds + 1 })
  }

  const handleRejectAd = (adId) => {
    setAds(ads.filter(ad => ad.id !== adId))
    setStats({ ...stats, pendingAds: stats.pendingAds - 1, totalAds: stats.totalAds - 1 })
  }

  const handleAddCoins = () => {
    if (!selectedAdvertiser || !coinAmount) {
      setError('Please select advertiser and enter coin amount')
      return
    }

    setAdvertisers(advertisers.map(adv =>
      adv.id === selectedAdvertiser.id
        ? { ...adv, coins: adv.coins + parseInt(coinAmount) }
        : adv
    ))

    setShowCoinModal(false)
    setSelectedAdvertiser(null)
    setCoinAmount('')
    setCoinReason('bonus')
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
          <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Active Advertisers</p>
            <p className="text-2xl font-bold text-purple-400">{stats.activeAdvertisers}</p>
          </div>
          <div className="bg-pink-900/30 border border-pink-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Coins Distributed</p>
            <p className="text-2xl font-bold text-pink-400">{stats.totalCoinsDistributed.toLocaleString()}</p>
          </div>
          <div className="bg-orange-900/30 border border-orange-500/30 rounded-lg p-4">
            <p className="text-gray-400 text-xs mb-1">Locations</p>
            <p className="text-2xl font-bold text-orange-400">{stats.totalLocations}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-purple-500/30">
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
        </div>

        {/* Tab Content */}
        {activeTab === 'ads' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Pending Ads for Approval</h3>
            {ads.filter(ad => ad.status === 'pending').length === 0 ? (
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8 text-center">
                <p className="text-gray-400">No pending ads to review</p>
              </div>
            ) : (
              ads.filter(ad => ad.status === 'pending').map(ad => (
                <div key={ad.id} className="bg-gray-900/50 border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/50 transition">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Ad Title</p>
                      <p className="text-white font-semibold">{ad.title}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Advertiser</p>
                      <p className="text-white font-semibold">{ad.advertiser.name}</p>
                      <p className="text-xs text-gray-500">{ad.advertiser.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Location</p>
                      <p className="text-white font-semibold">{ad.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Coins Used</p>
                      <p className="text-white font-semibold text-lg text-yellow-400">{ad.coins} 🪙</p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleApproveAd(ad.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleRejectAd(ad.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                    >
                      ✕ Reject & Refund Coins
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'advertisers' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Advertiser Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="text-left p-4 text-purple-400">Name</th>
                    <th className="text-left p-4 text-purple-400">Email</th>
                    <th className="text-right p-4 text-purple-400">Coins Balance</th>
                    <th className="text-right p-4 text-purple-400">Active Ads</th>
                    <th className="text-center p-4 text-purple-400">Status</th>
                    <th className="text-center p-4 text-purple-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {advertisers.map(adv => (
                    <tr key={adv.id} className="border-b border-gray-700 hover:bg-gray-900/50 transition">
                      <td className="p-4 text-white font-semibold">{adv.name}</td>
                      <td className="p-4 text-gray-400">{adv.email}</td>
                      <td className="p-4 text-right text-yellow-400 font-bold">{adv.coins} 🪙</td>
                      <td className="p-4 text-right text-white">{adv.adsCount}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          adv.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {adv.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedAdvertiser(adv)
                            setShowCoinModal(true)
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition"
                        >
                          Add Coins
                        </button>
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
              <p className="text-gray-400 text-sm">Select an advertiser from the Advertisers tab and click "Add Coins" to distribute coins.</p>
            </div>
            {advertisers.map(adv => (
              <div key={adv.id} className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-white font-semibold text-lg">{adv.name}</p>
                    <p className="text-gray-400 text-sm">{adv.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Current Balance</p>
                    <p className="text-yellow-400 font-bold text-2xl">{adv.coins}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedAdvertiser(adv)
                    setShowCoinModal(true)
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                >
                  + Add Coins
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
