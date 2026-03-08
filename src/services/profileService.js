// Profile management service using backend API
import { authAPI } from './apiService'

// ============ CORE UTILITIES ============

// Storage keys (defined here so all functions can use them)
const PROFILES_KEY = 'advertiserProfiles'
const USERS_KEY = 'localUsers'
const TRANSACTIONS_KEY = 'coinTransactions'

// Safe localStorage getter — prevents JSON.parse crashes from corrupted data
const safeGet = (key, fallback = []) => {
  try {
    const val = localStorage.getItem(key)
    if (val === null) return fallback
    return JSON.parse(val) ?? fallback
  } catch {
    return fallback
  }
}

// Hash a password using SHA-256 (browser crypto API, async)
const hashPassword = async (password) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Helper: Check if identifier is email or phone
const isEmail = (identifier) => identifier && identifier.includes('@')
const isPhone = (identifier) => identifier && /^[6-9]\d{9}$/.test(identifier.replace(/[\s\-\+]/g, '').replace(/^91/, ''))

// User authentication functions
export const registerUser = async (userData) => {
  try {
    const response = await authAPI.register(userData)
    // Return response with verification method info
    return {
      ...response,
      emailSent: response.emailSent || false,
      smsSent: response.smsSent || false,
      verificationMethod: response.verificationMethod || (userData.email ? 'email' : 'phone'),
      identifier: response.identifier || userData.email || userData.phone
    }
  } catch (error) {
    // Fallback to localStorage for development
    console.warn('Backend registration failed, using localStorage fallback:', error.message)
    
    const users = safeGet(USERS_KEY)
    const identifier = userData.email || userData.phone
    const existingUser = users.find(u => u.email === userData.email || u.phone === userData.phone)
    if (existingUser) {
      throw new Error('User already exists')
    }

    // Hash password before storing — never save plain text
    const passwordHash = userData.password ? await hashPassword(userData.password) : null
    const { password: _pw, ...safeUserData } = userData

    const newUser = {
      id: Date.now().toString(),
      ...safeUserData,
      passwordHash,
      isVerified: true,
      isEmailVerified: !!userData.email,
      isPhoneVerified: !!userData.phone,
      coins: userData.userType === 'advertiser' ? 500 : 0,
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
    
    // Store coins locally for advertiser
    if (userData.userType === 'advertiser') {
      localStorage.setItem('userCoins', '500')
    }
    
    // Auto-login the user
    localStorage.setItem('currentUser', JSON.stringify(newUser))
    localStorage.setItem('authToken', 'local-token-' + newUser.id)
    
    return {
      ...newUser,
      emailSent: !!userData.email,
      smsSent: !!userData.phone,
      verificationMethod: userData.email ? 'email' : 'phone',
      identifier: identifier,
      message: 'User registered successfully (localStorage fallback)'
    }
  }
}

export const loginUser = async (identifier, password) => {
  try {
    const response = await authAPI.login(identifier, password)

    // If login requires verification, return special response
    if (response.requiresVerification) {
      return {
        requiresVerification: true,
        verificationMethod: response.verificationMethod,
        identifier: response.identifier,
        user: response.user,
        verificationSent: response.verificationSent
      }
    }

    // Store auth token
    if (response.token) {
      localStorage.setItem('authToken', response.token)
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    }

    // Store user data
    const userData = response.user
    localStorage.setItem('currentUser', JSON.stringify(userData))

    // Dispatch custom event to notify login
    window.dispatchEvent(new CustomEvent('authChanged', {
      detail: { user: userData, isAuthenticated: true }
    }))

    return userData
  } catch (error) {
    // Fallback to localStorage when backend is unavailable
    console.warn('Backend login failed, using localStorage fallback:', error.message)
    
    const users = safeGet(USERS_KEY)
    const user = users.find(u => 
      (u.email && u.email.toLowerCase() === identifier.toLowerCase()) || 
      (u.phone && u.phone === identifier)
    )
    
    if (!user) {
      // Check if it's a network error vs actual invalid credentials
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        throw new Error('Server unavailable. Please register first or try again later.')
      }
      throw new Error('Invalid email/phone or password')
    }
    
    // Verify password — support hashed (new) and legacy plain-text (old)
    if (user.passwordHash) {
      const inputHash = await hashPassword(password)
      if (user.passwordHash !== inputHash) {
        throw new Error('Invalid email/phone or password')
      }
    } else if (user.password) {
      if (user.password !== password) {
        throw new Error('Invalid email/phone or password')
      }
      // Migrate legacy plain-text password to hash
      const allUsers = safeGet(USERS_KEY)
      const idx = allUsers.findIndex(u => u.id === user.id)
      if (idx !== -1) {
        allUsers[idx].passwordHash = await hashPassword(password)
        delete allUsers[idx].password
        localStorage.setItem(USERS_KEY, JSON.stringify(allUsers))
      }
    }
    
    // Store user data
    localStorage.setItem('currentUser', JSON.stringify(user))
    localStorage.setItem('authToken', 'local-token-' + user.id)
    
    // Restore coin balance from stored user
    if (user.coins) {
      localStorage.setItem('userCoins', String(user.coins))
    }
    
    // Dispatch custom event to notify login
    window.dispatchEvent(new CustomEvent('authChanged', {
      detail: { user: user, isAuthenticated: true }
    }))
    
    return user
  }
}

// Google OAuth Sign In/Up
export const googleAuth = async (credential, userType) => {
  try {
    const response = await authAPI.googleAuth(credential, userType)

    // Store auth tokens
    if (response.accessToken) {
      localStorage.setItem('authToken', response.accessToken)
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    }

    // Store user data + coins
    const userData = response.user
    localStorage.setItem('currentUser', JSON.stringify(userData))
    if (typeof userData?.coins === 'number') {
      localStorage.setItem('userCoins', String(userData.coins))
    }

    // Dispatch custom event to notify login
    window.dispatchEvent(new CustomEvent('authChanged', {
      detail: { user: userData, isAuthenticated: true }
    }))

    return userData
  } catch (error) {
    console.error('Google auth backend error:', error.message)
    throw new Error('Sign-in failed. Please check your connection and try again.')
  }
}

// Login with verification support
export const initiateLoginWithVerification = async (identifier, password) => {
  try {
    const response = await authAPI.login(identifier, password)

    if (response.requiresVerification) {
      return {
        id: response.user.id,
        email: response.user.email,
        phone: response.user.phone,
        businessName: response.user.businessName,
        verificationMethod: response.verificationMethod,
        identifier: response.identifier,
        requiresVerification: true
      }
    }

    // If already verified, complete login
    if (response.token) {
      localStorage.setItem('authToken', response.token)
      localStorage.setItem('currentUser', JSON.stringify(response.user))

      window.dispatchEvent(new CustomEvent('authChanged', {
        detail: { user: response.user, isAuthenticated: true }
      }))

      return response.user
    }

    throw new Error('Unexpected login response')
  } catch (error) {
    throw new Error(error.message || 'Login failed')
  }
}

export const completeLoginWithVerification = async (identifier, code) => {
  try {
    const response = await authAPI.completeLogin(identifier, code)

    // Store auth token
    if (response.token) {
      localStorage.setItem('authToken', response.token)
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken)
    }

    // Store user data + coins (verify endpoint now returns coins)
    const userData = response.user
    localStorage.setItem('currentUser', JSON.stringify(userData))
    if (typeof userData?.coins === 'number') {
      localStorage.setItem('userCoins', String(userData.coins))
    }

    // Dispatch custom event to notify login
    window.dispatchEvent(new CustomEvent('authChanged', {
      detail: { user: userData, isAuthenticated: true }
    }))

    return userData
  } catch (error) {
    throw new Error(error.message || 'Verification failed')
  }
}

export const logoutUser = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('currentUser')
  localStorage.removeItem('userCoins')

  // Dispatch custom event to notify logout
  window.dispatchEvent(new CustomEvent('authChanged', {
    detail: { user: null, isAuthenticated: false }
  }))
}

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser')
  return userStr ? JSON.parse(userStr) : null
}

export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken')
  const user = getCurrentUser()
  return !!(token && user)
}

// Verify code (supports email or phone)
export const verifyCode = async (identifier, code) => {
  try {
    const response = await authAPI.verify(identifier, code)
    return response
  } catch (error) {
    throw new Error(error.message || 'Verification failed')
  }
}

// Legacy: verify email code
export const verifyEmailCode = async (email, code) => {
  return verifyCode(email, code)
}

// Resend verification code (supports email or phone)
export const resendVerificationCode = async (identifier, method) => {
  try {
    const response = await authAPI.resendVerification(identifier, method)
    return response
  } catch (error) {
    throw new Error(error.message || 'Failed to resend code')
  }
}

// Forgot password (supports email or phone)
export const forgotPassword = async (identifier) => {
  try {
    const response = await authAPI.forgotPassword(identifier)
    return response
  } catch (error) {
    throw new Error(error.message || 'Failed to send reset code')
  }
}

// Reset password
export const resetPassword = async (identifier, code, newPassword) => {
  try {
    const response = await authAPI.resetPassword(identifier, code, newPassword)
    return response
  } catch (error) {
    throw new Error(error.message || 'Failed to reset password')
  }
}

// Get user profile from backend
export const getUserProfile = async () => {
  try {
    const response = await authAPI.getProfile()
    return response
  } catch (error) {
    // Fallback to localStorage for development
    console.warn('Backend profile fetch failed, using localStorage fallback:', error.message)
    
    const user = getCurrentUser()
    if (user) {
      return {
        ...user,
        isVerified: true,
        createdAt: user.createdAt || new Date().toISOString()
      }
    }
    
    throw new Error('No user data available')
  }
}

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    // Try to update via backend API
    const response = await authAPI.updateProfile(profileData)
    return response
  } catch (error) {
    // Fallback to localStorage for development
    console.warn('Backend profile update failed, using localStorage fallback:', error.message)
    
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User must be logged in to update profile')
    }
    
    // Update user data in localStorage
    const users = safeGet(USERS_KEY)
    const userIndex = users.findIndex(u => u.id === user.id)
    
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        ...profileData,
        updatedAt: new Date().toISOString()
      }
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
      localStorage.setItem('currentUser', JSON.stringify(users[userIndex]))
    }
    
    return { success: true, message: 'Profile updated successfully' }
  }
}

// Legacy profile management functions (using localStorage)
// TODO: Move these to backend API

// Create or update a profile/ad
export const createProfile = (profileData, adId = null) => {
  const user = getCurrentUser()
  if (!user) {
    throw new Error('User must be logged in to create a profile')
  }

  const profiles = safeGet(PROFILES_KEY)

  // Only update existing ad if adId is explicitly provided
  // Otherwise always create a new ad (allows multiple ads per user)
  let existingProfileIndex = adId 
    ? profiles.findIndex(p => p.id === adId && p.userId === user.id)
    : -1 // Always create new when no adId provided

  // Calculate expiry date (30 days from now)
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 30)

  const newProfile = {
    id: existingProfileIndex >= 0 ? profiles[existingProfileIndex].id : Date.now().toString(),
    userId: user.id,
    ...profileData,
    status: profileData.status || 'active', // active, paused, expired
    createdAt: existingProfileIndex >= 0 ? profiles[existingProfileIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: existingProfileIndex >= 0 ? profiles[existingProfileIndex].expiresAt : expiryDate.toISOString(),
    verified: true,
    rating: existingProfileIndex >= 0 ? profiles[existingProfileIndex].rating : 4.5,
    reviews: existingProfileIndex >= 0 ? profiles[existingProfileIndex].reviews : 0,
    views: existingProfileIndex >= 0 ? profiles[existingProfileIndex].views : 0,
    responseTime: '< 30 min',
    availability: profileData.availability || 'Available'
  }

  if (existingProfileIndex >= 0) {
    profiles[existingProfileIndex] = newProfile
  } else {
    profiles.push(newProfile)
  }

  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))

  // Dispatch custom event to notify profile changes
  window.dispatchEvent(new CustomEvent('profilesUpdated', { detail: newProfile }))

  return newProfile
}

// Get all ads for a specific user
export const getUserAds = (userId = null) => {
  const user = userId ? { id: userId } : getCurrentUser()
  if (!user) return []
  
  const profiles = safeGet(PROFILES_KEY)
  return profiles.filter(p => p.userId === user.id)
}

// Get current user's ads
export const getCurrentUserAds = () => {
  return getUserAds()
}

// Update ad status (active, paused)
export const updateAdStatus = (adId, status) => {
  const user = getCurrentUser()
  if (!user) {
    throw new Error('User must be logged in to update ad status')
  }

  const profiles = safeGet(PROFILES_KEY)
  const adIndex = profiles.findIndex(p => p.id === adId && p.userId === user.id)

  if (adIndex === -1) {
    throw new Error('Ad not found')
  }

  profiles[adIndex].status = status
  profiles[adIndex].updatedAt = new Date().toISOString()

  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  window.dispatchEvent(new CustomEvent('profilesUpdated', { detail: profiles[adIndex] }))

  return profiles[adIndex]
}

// Delete an ad
export const deleteAd = (adId) => {
  const user = getCurrentUser()
  if (!user) {
    throw new Error('User must be logged in to delete an ad')
  }

  const profiles = safeGet(PROFILES_KEY)
  const updatedProfiles = profiles.filter(p => !(p.id === adId && p.userId === user.id))
  
  localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles))
  window.dispatchEvent(new CustomEvent('profilesUpdated', { detail: { deleted: adId } }))
  
  return { success: true }
}

// Duplicate an ad
export const duplicateAd = (adId) => {
  const user = getCurrentUser()
  if (!user) {
    throw new Error('User must be logged in to duplicate an ad')
  }

  const profiles = safeGet(PROFILES_KEY)
  const originalAd = profiles.find(p => p.id === adId && p.userId === user.id)

  if (!originalAd) {
    throw new Error('Ad not found')
  }

  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 30)

  const duplicatedAd = {
    ...originalAd,
    id: Date.now().toString(),
    name: `${originalAd.name} (Copy)`,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: expiryDate.toISOString(),
    views: 0
  }

  profiles.push(duplicatedAd)
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  window.dispatchEvent(new CustomEvent('profilesUpdated', { detail: duplicatedAd }))

  return duplicatedAd
}

// Get ad by ID
export const getAdById = (adId) => {
  const profiles = safeGet(PROFILES_KEY)
  return profiles.find(p => p.id === adId)
}

export const getProfile = (userId) => {
  const profiles = safeGet(PROFILES_KEY)
  return profiles.find(p => p.userId === userId)
}

export const getCurrentUserProfile = () => {
  const user = getCurrentUser()
  if (!user) return null
  return getProfile(user.id)
}

export const getAllProfiles = () => {
  const profiles = safeGet(PROFILES_KEY)
  return profiles.filter(p => p.status !== 'paused' && p.status !== 'expired')
}

export const getProfilesByLocation = (location) => {
  const profiles = getAllProfiles()
  if (location === 'all') return profiles
  return profiles.filter(p => p.location === location)
}

export const deleteProfile = (profileId) => {
  const profiles = safeGet(PROFILES_KEY)
  const updatedProfiles = profiles.filter(p => p.id !== profileId)
  localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles))
  
  // Dispatch custom event to notify profile changes
  window.dispatchEvent(new CustomEvent('profilesUpdated', { detail: { deleted: profileId } }))
}

export const deleteUserAccount = () => {
  const user = getCurrentUser()
  if (!user) {
    throw new Error('No user is currently logged in')
  }
  
  // Delete user's profile
  const profiles = safeGet(PROFILES_KEY)
  const updatedProfiles = profiles.filter(p => p.userId !== user.id)
  localStorage.setItem(PROFILES_KEY, JSON.stringify(updatedProfiles))
  
  // Dispatch custom event to notify profile changes
  window.dispatchEvent(new CustomEvent('profilesUpdated', { detail: { deletedUser: user.id } }))
  
  // Delete user account
  const users = safeGet(USERS_KEY)
  const updatedUsers = users.filter(u => u.id !== user.id)
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers))
  
  // Logout user
  logoutUser()
}

// Helper function to convert image file to base64
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Search profiles
export const searchProfiles = (filters) => {
  let profiles = getAllProfiles()
  
  if (filters.location && filters.location !== 'all') {
    profiles = profiles.filter(p => p.location === filters.location)
  }
  
  if (filters.minAge) {
    profiles = profiles.filter(p => p.age >= filters.minAge)
  }
  
  if (filters.maxAge) {
    profiles = profiles.filter(p => p.age <= filters.maxAge)
  }
  
  if (filters.services && filters.services.length > 0) {
    profiles = profiles.filter(p => 
      filters.services.some(service => p.services?.includes(service))
    )
  }
  
  return profiles
}

// ============ COIN MANAGEMENT ============

const COIN_PACKAGES = [
  { id: 'pack-50', coins: 50, price: 99, popular: false },
  { id: 'pack-100', coins: 100, price: 179, popular: false, savings: '10%' },
  { id: 'pack-250', coins: 250, price: 399, popular: true, savings: '20%' },
  { id: 'pack-500', coins: 500, price: 699, popular: false, savings: '30%' },
  { id: 'pack-1000', coins: 1000, price: 1199, popular: false, savings: '40%' }
]

const UPI_ID = '7980393546@ybl'

// Get coin packages
export const getCoinPackages = () => COIN_PACKAGES

// Get UPI ID for payment
export const getUPIId = () => UPI_ID

// Get user's coin balance
export const getUserCoins = () => {
  const user = getCurrentUser()
  if (!user) return 0
  const users = safeGet(USERS_KEY)
  const currentUser = users.find(u => u.id === user.id)
  return currentUser?.coins || 0
}

// Add coins to user account
export const addCoins = (amount, transactionId, packageId) => {
  const user = getCurrentUser()
  if (!user) throw new Error('User not logged in')
  
  const users = safeGet(USERS_KEY)
  const userIndex = users.findIndex(u => u.id === user.id)
  
  if (userIndex === -1) throw new Error('User not found')
  
  // Add coins
  users[userIndex].coins = (users[userIndex].coins || 0) + amount
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  
  // Sync all coin keys
  const newBalance = users[userIndex].coins
  localStorage.setItem('userCoins', String(newBalance))
  localStorage.setItem('currentUser', JSON.stringify({ ...user, coins: newBalance }))
  
  // Record transaction
  const transactions = safeGet(TRANSACTIONS_KEY)
  transactions.push({
    id: Date.now().toString(),
    orderId: `TXN${Date.now()}`,
    userId: user.id,
    type: 'credit',
    amount,
    packageId,
    transactionId,
    status: 'completed',
    createdAt: new Date().toISOString()
  })
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
  
  // Dispatch event for UI update
  window.dispatchEvent(new CustomEvent('coinsUpdated', { detail: { coins: newBalance } }))
  
  return newBalance
}

// Deduct coins from user account
export const deductCoins = (amount, reason = 'ad_promotion') => {
  const user = getCurrentUser()
  if (!user) throw new Error('User not logged in')
  
  const currentCoins = getUserCoins()
  if (currentCoins < amount) throw new Error('Insufficient coins')
  
  const users = safeGet(USERS_KEY)
  const userIndex = users.findIndex(u => u.id === user.id)
  
  if (userIndex === -1) throw new Error('User not found')
  
  // Deduct coins
  users[userIndex].coins = currentCoins - amount
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  
  // Sync all coin keys
  const newBalance = users[userIndex].coins
  localStorage.setItem('userCoins', String(newBalance))
  localStorage.setItem('currentUser', JSON.stringify({ ...user, coins: newBalance }))
  
  // Record transaction
  const transactions = safeGet(TRANSACTIONS_KEY)
  transactions.push({
    id: Date.now().toString(),
    userId: user.id,
    type: 'debit',
    amount,
    reason,
    status: 'completed',
    createdAt: new Date().toISOString()
  })
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
  
  // Dispatch event for UI update
  window.dispatchEvent(new CustomEvent('coinsUpdated', { detail: { coins: newBalance } }))
  
  return newBalance
}

// Get user's transaction history
export const getCoinTransactions = () => {
  const user = getCurrentUser()
  if (!user) return []
  
  const transactions = safeGet(TRANSACTIONS_KEY)
  return transactions.filter(t => t.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// Generate UPI payment link
export const generateUPILink = (amount, txnId) => {
  const upiId = getUPIId()
  const name = 'Trusted Escort'
  const note = `Coin Purchase - ${txnId}`
  
  // UPI deep link format
  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`
}

// ============ USER REQUIREMENTS ============

const REQUIREMENTS_KEY = 'userRequirements'

// Create a new requirement
export const createRequirement = (requirementData) => {
  const user = getCurrentUser()
  if (!user) {
    throw new Error('You must be logged in to post a requirement')
  }

  const requirements = safeGet(REQUIREMENTS_KEY)
  
  const newRequirement = {
    id: `req-${Date.now()}`,
    userId: user.id,
    userName: user.name || user.businessName || 'Anonymous',
    userPhone: requirementData.showContact ? user.phone : null,
    ...requirementData,
    status: 'active', // active, fulfilled, expired
    responses: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
  }
  
  requirements.push(newRequirement)
  localStorage.setItem(REQUIREMENTS_KEY, JSON.stringify(requirements))
  
  // Dispatch event
  window.dispatchEvent(new CustomEvent('requirementsUpdated', { detail: newRequirement }))
  
  return newRequirement
}

// Get all active requirements
export const getAllRequirements = () => {
  const requirements = safeGet(REQUIREMENTS_KEY)
  const now = new Date()
  
  // Filter out expired requirements and return active ones
  return requirements
    .filter(r => r.status === 'active' && new Date(r.expiresAt) > now)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// Get current user's requirements
export const getUserRequirements = () => {
  const user = getCurrentUser()
  if (!user) return []
  
  const requirements = safeGet(REQUIREMENTS_KEY)
  return requirements
    .filter(r => r.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// Update requirement status
export const updateRequirementStatus = (reqId, status) => {
  const user = getCurrentUser()
  if (!user) return false
  
  const requirements = safeGet(REQUIREMENTS_KEY)
  const index = requirements.findIndex(r => r.id === reqId && r.userId === user.id)
  
  if (index !== -1) {
    requirements[index].status = status
    requirements[index].updatedAt = new Date().toISOString()
    localStorage.setItem(REQUIREMENTS_KEY, JSON.stringify(requirements))
    window.dispatchEvent(new CustomEvent('requirementsUpdated'))
    return true
  }
  return false
}

// Delete a requirement
export const deleteRequirement = (reqId) => {
  const user = getCurrentUser()
  if (!user) return false
  
  const requirements = safeGet(REQUIREMENTS_KEY)
  const filtered = requirements.filter(r => !(r.id === reqId && r.userId === user.id))
  
  if (filtered.length !== requirements.length) {
    localStorage.setItem(REQUIREMENTS_KEY, JSON.stringify(filtered))
    window.dispatchEvent(new CustomEvent('requirementsUpdated'))
    return true
  }
  return false
}

// Get requirements by location
export const getRequirementsByLocation = (location) => {
  const requirements = getAllRequirements()
  if (!location || location === 'all') return requirements
  
  return requirements.filter(r => 
    r.location.toLowerCase() === location.toLowerCase()
  )
}

// Increment view count
export const incrementRequirementViews = (reqId) => {
  const requirements = safeGet(REQUIREMENTS_KEY)
  const index = requirements.findIndex(r => r.id === reqId)
  
  if (index !== -1) {
    requirements[index].views = (requirements[index].views || 0) + 1
    localStorage.setItem(REQUIREMENTS_KEY, JSON.stringify(requirements))
  }
}
