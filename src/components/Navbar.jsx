import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentUser, logoutUser } from '../services/profileService'
import InstallAppButton from './InstallAppButton'

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser()
      setCurrentUser(user)
    }

    checkAuth()

    // Listen for authentication changes
    const handleAuthChange = (event) => {
      setCurrentUser(event.detail.user)
    }

    const handleStorageChange = (event) => {
      if (event.key === 'currentUser') {
        checkAuth()
      }
    }

    window.addEventListener('authChanged', handleAuthChange)
    window.addEventListener('focus', checkAuth)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('authChanged', handleAuthChange)
      window.removeEventListener('focus', checkAuth)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Close user menu when clicking outside or changing route
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  useEffect(() => {
    setShowUserMenu(false)
    setIsOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logoutUser()
    setShowUserMenu(false)
    setIsOpen(false)
    navigate('/')
  }

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Escorts', path: '/escorts' },
    { name: 'About', path: '/about' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-dark-bg/95 backdrop-blur-md border-b border-gold/20' : 'bg-dark-bg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center cursor-pointer"
            >
              <img 
                src="/images/logo.png" 
                alt="Trusted Escort" 
                className="h-14 w-auto object-contain"
              />
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ color: '#D4AF37' }}
                  className={`font-sans text-sm transition-colors ${
                    isActive(item.path) ? 'text-gold' : 'text-gray-300 hover:text-gold'
                  }`}
                >
                  {item.name}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <InstallAppButton />
            {currentUser ? (
              <div className="relative user-menu-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gold border border-gold/50 rounded-lg hover:bg-gold/10 transition"
                >
                  <span>👤</span>
                  <span>{currentUser.businessName || currentUser.email}</span>
                  <span className="text-xs">▼</span>
                </motion.button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-dark-card border border-gold/20 rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      <Link to="/account" onClick={() => setShowUserMenu(false)}>
                        <div className="px-4 py-3 hover:bg-dark-hover text-gray-300 hover:text-gold transition text-sm">
                          👤 My Account
                        </div>
                      </Link>
                      <Link to="/post-requirement" onClick={() => setShowUserMenu(false)}>
                        <div className="px-4 py-3 hover:bg-dark-hover text-gray-300 hover:text-gold transition text-sm">
                          📝 Post Requirement
                        </div>
                      </Link>
                      <Link to="/advertiser-dashboard" onClick={() => setShowUserMenu(false)}>
                        <div className="px-4 py-3 hover:bg-dark-hover text-gray-300 hover:text-gold transition text-sm">
                          📊 Dashboard
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 hover:bg-dark-hover text-gray-300 hover:text-red-400 transition text-sm border-t border-gold/10"
                      >
                        🚪 Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/signin">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm text-gold border border-gold/50 rounded-lg hover:bg-gold/10 transition"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
            <Link to="/booking">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold text-sm"
              >
                Book Now
              </motion.button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-dark-hover"
          >
            <div className="space-y-1.5">
              <motion.div
                animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
                className="w-6 h-0.5 bg-gold"
              />
              <motion.div
                animate={{ opacity: isOpen ? 0 : 1 }}
                className="w-6 h-0.5 bg-gold"
              />
              <motion.div
                animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
                className="w-6 h-0.5 bg-gold"
              />
            </div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden md:hidden"
        >
          <div className="py-4 space-y-3 border-t border-gold/20">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
              >
                <motion.div
                  whileHover={{ x: 5 }}
                  className={`font-sans text-sm py-2 px-4 rounded transition-colors ${
                    isActive(item.path)
                      ? 'text-gold bg-dark-hover'
                      : 'text-gray-300 hover:text-gold'
                  }`}
                >
                  {item.name}
                </motion.div>
              </Link>
            ))}
            {currentUser ? (
              <>
                <Link to="/post-requirement" onClick={() => setIsOpen(false)}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full px-4 py-2 text-sm text-gold border border-gold/50 rounded-lg hover:bg-gold/10 transition font-sans"
                  >
                    📝 Post Requirement
                  </motion.button>
                </Link>
                <Link to="/advertiser-dashboard" onClick={() => setIsOpen(false)}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full px-4 py-2 text-sm text-gold border border-gold/50 rounded-lg hover:bg-gold/10 transition font-sans"
                  >
                    📊 Dashboard
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm text-red-400 border border-red-400/50 rounded-lg hover:bg-red-400/10 transition font-sans"
                >
                  🚪 Logout
                </motion.button>
              </>
            ) : (
              <Link to="/signin" onClick={() => setIsOpen(false)}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="w-full px-4 py-2 text-sm text-gold border border-gold/50 rounded-lg hover:bg-gold/10 transition font-sans"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
            <Link to="/booking" onClick={() => setIsOpen(false)}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="btn-gold w-full text-sm"
              >
                Book Now
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}

export default Navbar
