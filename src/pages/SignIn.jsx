import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { loginUser, googleAuth } from '../services/profileService'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '659176711562-sa17ejtofqclu20c6ib55qrf3hgfkmjq.apps.googleusercontent.com'

export default function SignIn() {
  const navigate = useNavigate()
  const googleBtnRef = useRef(null)
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    const loadGSI = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
        })
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: googleBtnRef.current.offsetWidth || 340,
          text: 'signin_with',
          shape: 'rectangular',
        })
      }
    }
    if (window.google) {
      loadGSI()
    } else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = loadGSI
      document.head.appendChild(script)
    }
  }, [])

  const handleGoogleResponse = async (response) => {
    setGoogleLoading(true)
    setError('')
    try {
      await googleAuth(response.credential)
      navigate('/advertiser-dashboard')
    } catch (err) {
      setError(err.message || 'Google sign-in failed.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.identifier || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await loginUser(form.identifier, form.password)
      navigate('/advertiser-dashboard')
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Sign In – TrustedEsco Advertiser</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-serif font-bold text-gold">TrustedEsco</Link>
            <h1 className="text-white text-2xl font-serif font-semibold mt-3 mb-1">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in to your advertiser account</p>
          </div>

          <div className="card-glass p-8 rounded-2xl">
            {/* Google Sign In */}
            <div className="mb-6">
              <p className="text-gray-400 text-xs text-center mb-3">Sign in with Google</p>
              {googleLoading ? (
                <div className="flex items-center justify-center h-11 bg-dark-card rounded-lg">
                  <span className="text-gold text-sm">Signing in...</span>
                </div>
              ) : (
                <div ref={googleBtnRef} className="w-full" />
              )}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gold/15" />
              <span className="text-gray-500 text-xs">or sign in with email</span>
              <div className="flex-1 h-px bg-gold/15" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-xs mb-1.5">Email or Phone</label>
                <input
                  type="text"
                  placeholder="your@email.com or 9876543210"
                  value={form.identifier}
                  onChange={e => setForm({ ...form, identifier: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-gold/20 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-xs mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-gold/20 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-sm transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold text-xs"
                  >
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center justify-between mt-5 text-xs">
              <Link to="/forgot-password" className="text-gold hover:underline">Forgot password?</Link>
              <Link to="/advertiser-signup" className="text-gray-400 hover:text-gold">
                No account? <span className="text-gold">Sign up free</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
