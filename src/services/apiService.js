// API service for communicating with the backend
const API_BASE_URL = import.meta.env.DEV
  ? '/api'  // Use proxy in development
  : (import.meta.env.VITE_API_URL || 'http://localhost:5002/api'); // Use full URL in production

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      const error = new Error(errorData.error || `HTTP ${response.status}`);
      error.action = errorData.action;
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  // Register user (supports email or phone)
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Verify (supports email or phone)
  verify: async (identifier, code) => {
    return apiRequest('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ identifier, code }),
    });
  },

  // Legacy: Verify email
  verifyEmail: async (email, code) => {
    return apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  // Login (supports email or phone via 'identifier' field)
  login: async (identifier, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  // Google OAuth login/signup
  googleAuth: async (credential) => {
    return apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  // Complete login with verification
  completeLogin: async (identifier, code) => {
    return apiRequest('/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ identifier, code }),
    });
  },

  // Forgot password (supports email or phone)
  forgotPassword: async (identifier) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  // Reset password
  resetPassword: async (identifier, code, newPassword) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, code, newPassword }),
    });
  },

  // Resend verification code (supports email or phone)
  resendVerification: async (identifier, method) => {
    return apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ identifier, method }),
    });
  },

  // Get user profile
  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Admin login
  adminLogin: async (email, password) => {
    return apiRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// Email API functions (for testing)
export const emailAPI = {
  // Send verification email (test)
  sendVerification: async (email, userName) => {
    return apiRequest('/email/send-verification', {
      method: 'POST',
      body: JSON.stringify({ email, userName }),
    });
  },

  // Test email service
  test: async () => {
    return apiRequest('/email/test');
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest('/health');
};