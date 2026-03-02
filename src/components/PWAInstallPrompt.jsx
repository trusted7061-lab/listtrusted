import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showManualPrompt, setShowManualPrompt] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;
    
    if (isInstalled) {
      return; // Don't show prompt if already installed
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Show manual prompt after 15 seconds if native prompt didn't appear
    const timer = setTimeout(() => {
      if (!deferredPrompt) {
        setShowManualPrompt(true)
      }
    }, 15000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [deferredPrompt])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setShowManualPrompt(false)
  }

  // Native install prompt
  if (showPrompt && deferredPrompt) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-gold/30 p-4 shadow-2xl"
        >
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-gold font-bold text-lg">📱 Install App</h3>
              <p className="text-gray-400 text-sm">Get the best experience - install on your device!</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleDismiss}
                className="px-4 py-2 bg-dark-hover border border-gold/20 text-gray-400 rounded-lg hover:text-gold transition"
              >
                Not Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleInstall}
                className="px-6 py-2 bg-gold text-black font-bold rounded-lg hover:bg-gold/90 transition"
              >
                Install
              </motion.button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Manual prompt for mobile browsers without install support
  if (showManualPrompt && (window.innerWidth < 768 || /iPhone|iPad|Android/i.test(navigator.userAgent))) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-gold/30 p-4 shadow-2xl"
        >
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-gold font-bold text-lg">📱 Download Our App</h3>
              <p className="text-gray-400 text-sm">Tap the share button and select "Add to Home Screen"</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleDismiss}
              className="px-4 py-2 bg-dark-hover border border-gold/20 text-gray-400 rounded-lg hover:text-gold transition flex-shrink-0"
            >
              ✕
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return null
}
