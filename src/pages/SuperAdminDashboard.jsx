import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/apiService'

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingLogout, setLoadingLogout] = useState(false)
  const [stats, setStats] = useState({
    totalAds: 0,
    totalUsers: 0,
    totalLocations: 1057,
    activeAds: 0
  })
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is logged in
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
        // Fetch dashboard stats
        fetchDashboardStats()
      } catch (err) {
        console.error('Error parsing admin user:', err)
        setError('Session error. Please login again.')
        navigate('/admin/login')
      }
    }
    setLoading(false)
  }, [navigate])

  const fetchDashboardStats = async () => {
    try {
      // Try to fetch stats from API
      // This would normally come from backend endpoints
      const token = localStorage.getItem('authToken')
      // For now, use placeholder data
      setStats({
        totalAds: 468,
        totalUsers: 0,
        totalLocations: 1057,
        activeAds: 468
      })
    } catch (err) {
      console.log('Could not fetch stats:', err.message)
      // Use default stats if API fails
    }
  }

  const handleLogout = async () => {
    setLoadingLogout(true)
    try {
      // Clear tokens
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('adminUser')
      
      // Redirect to login
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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-300 text-sm">
                Welcome, <span className="text-purple-400 font-semibold">{adminUser.displayName || adminUser.email}</span>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Admin!</h2>
            <p className="text-gray-400">You are logged in as: <span className="text-purple-400">{adminUser.email}</span></p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Ads */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Ads</p>
                <p className="text-3xl font-bold text-blue-400">{stats.totalAds}</p>
              </div>
              <div className="text-4xl opacity-30">📝</div>
            </div>
          </div>

          {/* Active Ads */}
          <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Ads</p>
                <p className="text-3xl font-bold text-green-400">{stats.activeAds}</p>
              </div>
              <div className="text-4xl opacity-30">✓</div>
            </div>
          </div>

          {/* Total Locations */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border border-purple-500/30 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Locations</p>
                <p className="text-3xl font-bold text-purple-400">{stats.totalLocations}</p>
              </div>
              <div className="text-4xl opacity-30">📍</div>
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-gradient-to-br from-pink-900/30 to-pink-900/10 border border-pink-500/30 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-pink-400">{stats.totalUsers}</p>
              </div>
              <div className="text-4xl opacity-30">👥</div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1 - Ads */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition">
            <div className="text-4xl mb-2">📝</div>
            <h3 className="text-lg font-semibold text-white mb-2">Manage Ads</h3>
            <p className="text-gray-400 text-sm mb-4">View and manage all posted advertisements</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition">
              Go to Ads →
            </button>
          </div>

          {/* Card 2 - Users */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="text-lg font-semibold text-white mb-2">Manage Users</h3>
            <p className="text-gray-400 text-sm mb-4">View user profiles and manage accounts</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition">
              Go to Users →
            </button>
          </div>

          {/* Card 3 - Locations */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition">
            <div className="text-4xl mb-2">📍</div>
            <h3 className="text-lg font-semibold text-white mb-2">Manage Locations</h3>
            <p className="text-gray-400 text-sm mb-4">Update location pages and content</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition">
              Go to Locations →
            </button>
          </div>

          {/* Card 4 - Analytics */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
            <p className="text-gray-400 text-sm mb-4">View site traffic and user statistics</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition">
              View Analytics →
            </button>
          </div>

          {/* Card 5 - Settings */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition">
            <div className="text-4xl mb-2">⚙️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Settings</h3>
            <p className="text-gray-400 text-sm mb-4">Configure system settings and preferences</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition">
              Go to Settings →
            </button>
          </div>

          {/* Card 6 - API Docs */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition">
            <div className="text-4xl mb-2">📚</div>
            <h3 className="text-lg font-semibold text-white mb-2">API Documentation</h3>
            <p className="text-gray-400 text-sm mb-4">View API endpoints and integration docs</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition">
              View Docs →
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3">📋 Admin Information</h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li>✓ Role: <span className="text-purple-400 font-medium uppercase">{adminUser.role}</span></li>
            <li>✓ Email: <span className="text-purple-400 font-medium">{adminUser.email}</span></li>
            <li>✓ User ID: <span className="text-purple-400 font-medium">{adminUser.id}</span></li>
            <li>✓ Token expires in 24 hours</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
