import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { registerUser, googleAuth } from '../services/profileService'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '659176711562-sa17ejtofqclu20c6ib55qrf3hgfkmjq.apps.googleusercontent.com'

export default function AdvertiserSignup() {
  const navigate = useNavigate()
  const googleBtnRef = useRef(null)
  const [step, setStep] = useState(1) // 1 = details, 2 = verify
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [verifyIdentifier, setVerifyIdentifier] = useState('')

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
          text: 'signup_with',
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
      setError(err.message || 'Google sign-up failed.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email && !form.phone) {
      setError('Please enter an email or phone number.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        businessName: form.name,
        displayName: form.name,
        password: form.password,
        userType: 'advertiser',
        ...(form.email && { email: form.email }),
        ...(form.phone && { phone: form.phone }),
      }
      const result = await registerUser(payload)
      if (result.requiresVerification || result.verificationMethod) {
        setVerifyIdentifier(result.identifier || form.email || form.phone)
        setStep(2)
      } else {
        navigate('/advertiser-dashboard')
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    'Free listing — goes live in minutes',
    'Reach clients across 500+ cities',
    'Google Sign-In for quick access',
    'Dashboard with live ad stats',
    'Direct WhatsApp & call contact',
  ]

  return (
    <>
      <Helmet>
        <title>Advertiser Sign Up – TrustedEsco</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-dark-bg flex items-stretch">
        {/* Left panel – benefits */}
        <div className="hidden lg:flex flex-col justify-center w-5/12 bg-dark-card border-r border-gold/10 px-12 py-20">
          <Link to="/" className="text-2xl font-serif font-bold text-gold mb-12">TrustedEsco</Link>
          <h2 className="font-serif text-4xl font-bold text-white mb-4">Grow Your <span className="text-gold">Business</span></h2>
          <p className="text-gray-400 leading-relaxed mb-8 text-sm">Join thousands of independent companions who trust TrustedEsco to connect them with genuine clients across India.</p>
          <ul className="space-y-3">
            {benefits.map(b => (
              <li key={b} className="flex items-start gap-3 text-gray-300 text-sm">
                <span className="text-gold mt-0.5 text-base">✓</span> {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Right panel – form */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8 lg:hidden">
              <Link to="/" className="text-2xl font-serif font-bold text-gold">TrustedEsco</Link>
            </div>

            {step === 1 ? (
              <>
                <h1 className="text-white text-2xl font-serif font-semibold mb-1">Create Advertiser Account</h1>
                <p className="text-gray-400 text-sm mb-7">Free to start — no credit card required</p>

                <div className="card-glass p-8 rounded-2xl">
                  {/* Google Sign Up */}
                  <div className="mb-6">
                    <p className="text-gray-400 text-xs text-center mb-3">Sign up with Google</p>
                    {googleLoading ? (
                      <div className="flex items-center justify-center h-11 bg-dark-card rounded-lg">
                        <span className="text-gold text-sm">Loading…</span>
                      </div>
                    ) : (
                      <div ref={googleBtnRef} className="w-full" />
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-gold/15" />
                    <span className="text-gray-500 text-xs">or sign up with email</span>
                    <div className="flex-1 h-px bg-gold/15" />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-xs mb-1.5">Business / Display Name</label>
                      <input
                        type="text"
                        placeholder="Your name or business name"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-gold/20 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs mb-1.5">Email Address</label>
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-gold/20 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs mb-1.5">Phone Number <span className="text-gray-600">(optional)</span></label>
                      <input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-gold/20 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          type={showPass ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={form.password}
                          onChange={e => setForm({ ...form, password: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-gold/20 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-sm pr-12 transition-colors"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold text-xs">{showPass ? 'Hide' : 'Show'}</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-xs mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="Re-enter password"
                        value={form.confirm}
                        onChange={e => setForm({ ...form, confirm: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-gold/20 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-sm transition-colors"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                        <p className="text-red-400 text-xs">{error}</p>
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="btn-gold w-full py-3 rounded-lg text-sm font-semibold disabled:opacity-60">
                      {loading ? 'Creating account…' : 'Create Free Account'}
                    </button>
                  </form>

                  <p className="text-center text-xs text-gray-500 mt-5">
                    Already have an account?{' '}
                    <Link to="/sign-in" className="text-gold hover:underline">Sign in</Link>
                  </p>
                </div>
              </>
            ) : (
              /* Step 2: Verification */
              <div className="card-glass p-8 rounded-2xl text-center">
                <div className="text-4xl mb-4">📧</div>
                <h2 className="font-serif text-2xl font-semibold text-white mb-3">Verify Your Account</h2>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  We've sent a verification code to <span className="text-gold font-medium">{verifyIdentifier}</span>. Check your inbox and click the link to activate your account.
                </p>
                <p className="text-gray-500 text-xs mb-6">Didn't receive it? Check your spam folder or contact support.</p>
                <Link to="/sign-in" className="btn-gold px-8 py-3 rounded-lg text-sm font-semibold inline-block">
                  Proceed to Sign In
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}
