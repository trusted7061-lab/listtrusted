import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const API_BASE = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5002/api')

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

  useEffect(() => {
    const stored = localStorage.getItem('currentUser')
    if (!stored) {
      navigate('/sign-in')
      return
    }
    setUser(JSON.parse(stored))
    fetchAds()
  }, [])

  const fetchAds = async () => {
    setLoadingAds(true)
    const token = localStorage.getItem('authToken')
    try {
      const res = await fetch(`${API_BASE}/ads/my-ads`, {
        headers: { Authorization: `Bearer ${token}` },
      })
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

  const handleDelete = async (adId) => {
    const token = localStorage.getItem('authToken')
    try {
      const res = await fetch(`${API_BASE}/ads/${adId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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
    { label: 'Rejected', value: rejectedAds, icon: '❌', color: 'border-red-400/30' },
  ]

  return (
    <>
      <Helmet>
        <title>Advertiser Dashboard – TrustedEsco</title>
        <meta name="robots" content="noindex" />
      </Helmet>

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
