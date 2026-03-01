import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/apiService'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      navigate('/superadmin-dashboard')
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      setLoading(false)
      return
    }

    if (formData.email.trim() === '') {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      console.log('Attempting admin login with:', formData.email)
      const response = await authAPI.adminLogin(formData.email, formData.password)
      
      console.log('Admin login response:', response)

      if (response && response.success) {
        // Store tokens
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('refreshToken', response.refreshToken)
        localStorage.setItem('adminUser', JSON.stringify(response.user))
        
        setSuccess('Login successful! Redirecting to dashboard...')
        
        // Redirect to admin dashboard
        setTimeout(() => {
          navigate('/superadmin-dashboard')
        }, 1500)
      } else if (response && response.token) {
        // Handle case where response doesn't have success flag but has token
        localStorage.setItem('authToken', response.token)
        localStorage.setItem('refreshToken', response.refreshToken || '')
        localStorage.setItem('adminUser', JSON.stringify(response.user || { email: formData.email, role: 'admin' }))
        
        setSuccess('Login successful! Redirecting to dashboard...')
        setTimeout(() => {
          navigate('/superadmin-dashboard')
        }, 1500)
      } else {
        setError(response?.message || 'Login failed. Please check your credentials.')
      }
    } catch (err) {
      console.error('Admin login error:', err)
      const errorMessage = err.message || 'Network error. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              Admin Login
            </h1>
            <p className="text-gray-400">Trusted Escort - Super Admin Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm">
                ✓ {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>Admin Only - Restricted Access</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-300 text-sm">
          <p className="font-semibold mb-2">🔐 Admin Portal</p>
          <p>This is a restricted area. Only authorized administrators can access this portal.</p>
        </div>

        {/* Demo Info */}
        <div className="mt-4 bg-gray-800/30 border border-gray-600/30 rounded-lg p-4 text-gray-300 text-xs">
          <p className="font-semibold mb-2">Default Admin Credentials:</p>
          <p>Email: <code className="bg-black/50 px-2 py-1 rounded">trusted7061@gmail.com</code></p>
          <p>Password: <code className="bg-black/50 px-2 py-1 rounded">Kold800*</code></p>
        </div>
      </div>
    </div>
  )
}
