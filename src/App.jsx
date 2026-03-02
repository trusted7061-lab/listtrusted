import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AgeVerificationModal from './components/AgeVerificationModal'
import WhatsAppButton from './components/WhatsAppButton'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import Home from './pages/Home'
import HomeSimple from './pages/HomeSimple'
import Escorts from './pages/Companions'
import CompanionProfile from './pages/CompanionProfile'
import Booking from './pages/Booking'
import About from './pages/About'
import Contact from './pages/Contact'
import SignIn from './pages/SignIn'
import Register from './pages/Register'
import Account from './pages/Account'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ResendConfirmation from './pages/ResendConfirmation'
import AdvertiserSignup from './pages/AdvertiserSignup'
import AdvertiserDashboard from './pages/AdvertiserDashboard'
import PostRequirement from './pages/PostRequirement'
import Location from './pages/Location'
import FAQ from './pages/FAQ'
import AdminLogin from './pages/AdminLogin'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import CoinPurchase from './pages/CoinPurchase'
import PostAd from './pages/PostAd'
import PromoteAd from './pages/PromoteAd'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'

function App() {
  const [isAgeVerified, setIsAgeVerified] = useState(false)

  useEffect(() => {
    const verified = localStorage.getItem('ageVerified')
    if (verified === 'true') {
      setIsAgeVerified(true)
    }
  }, [])

  const handleAgeVerification = () => {
    localStorage.setItem('ageVerified', 'true')
    setIsAgeVerified(true)
  }

  return (
    <HelmetProvider>
      <Router>
        {!isAgeVerified && <AgeVerificationModal onVerify={handleAgeVerification} />}
        
        <div className="flex flex-col min-h-screen">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home-simple" element={<HomeSimple />} />
              <Route path="/escorts" element={<Escorts />} />
              <Route path="/escorts/in/:city" element={<Location />} />
              <Route path="/escorts/:slug" element={<CompanionProfile />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/resend-confirmation" element={<ResendConfirmation />} />
              <Route path="/advertiser-signup" element={<AdvertiserSignup />} />
              <Route path="/advertiser-dashboard" element={<AdvertiserDashboard />} />
              <Route path="/post-requirement" element={<PostRequirement />} />
              <Route path="/coin-purchase" element={<CoinPurchase />} />
              <Route path="/post-ad" element={<PostAd />} />
              <Route path="/promote-ad" element={<PromoteAd />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/superadmin-dashboard" element={<SuperAdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
        
        <WhatsAppButton />
        <PWAInstallPrompt />
      </Router>
    </HelmetProvider>
  )
}

export default App