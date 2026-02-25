import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event for later use
      setDeferredPrompt(e)
      // Show install button
      setShowInstallButton(true)
      // Show banner after 3 seconds if not interacted
      setTimeout(() => setShowBanner(true), 3000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallButton(false)
      setShowBanner(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setShowInstallButton(false)
      setShowBanner(false)
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstallButton(false)
    setShowBanner(false)
  }

  // Don't show anything if app is already installed or no button should be shown
  if (isInstalled || !showInstallButton) {
    return null
  }

  return (
    <>
      {/* Banner that appears after 3 seconds */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
            className="fixed bottom-20 left-4 z-40 md:bottom-6 md:left-6"
          >
            <div className="bg-gradient-to-r from-gold/20 to-purple-600/20 border border-gold/50 backdrop-blur-md rounded-lg p-4 max-w-xs shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-gold font-bold mb-1">📱 Install App</h3>
                  <p className="text-gray-300 text-sm">
                    Get instant access to Trusted Escort on your home screen!
                  </p>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gold transition text-lg leading-none"
                >
                  ✕
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallClick}
                className="w-full mt-3 bg-gradient-to-r from-gold to-gold/80 hover:from-gold/90 hover:to-gold/70 text-dark-bg font-bold py-2 rounded-lg transition-all"
              >
                Install Now
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Install Button in Navbar (visible immediately on desktop) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleInstallClick}
        className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm bg-gold/10 border border-gold/50 text-gold rounded-lg hover:bg-gold/20 transition-colors"
        title="Download Trusted Escort as an app"
      >
        <span>📱</span>
        <span className="hidden xl:inline">Install App</span>
      </motion.button>
    </>
  )
}

export default InstallAppButton
