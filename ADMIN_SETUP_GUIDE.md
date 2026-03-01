# Super Admin Setup Guide

## Overview

This guide walks you through setting up your Super Admin account and accessing the Admin Dashboard.

## Step 1: Add Environment Variable (Backend)

Edit your `.env` file in the `backend/` folder and add:

```env
ADMIN_SETUP_KEY=TRUSTED_ESCORT_SETUP_KEY_2024
```

You can change this to a more secure key. Keep it safe and secret.

## Step 2: Create Your Admin Account

You have **two options** to create the initial admin account:

### Option A: Using the Setup Endpoint (Recommended)

Make a POST request to create your admin account. Use any HTTP client like Postman, cURL, or your application:

**Endpoint:** `POST https://trustedescort-backend.onrender.com/api/auth/admin/setup`

**Request Body:**
```json
{
  "email": "trusted7061@gmail.com",
  "password": "Kold800*",
  "setupKey": "TRUSTED_ESCORT_SETUP_KEY_2024"
}
```

**Your Admin Credentials:**
- **Email:** trusted7061@gmail.com
- **Password:** Kold800*
- **Setup Key:** TRUSTED_ESCORT_SETUP_KEY_2024 (from .env)

**Note:** The backend is deployed on Render at trustedescort-backend.onrender.com

**Success Response:**
```json
{
  "success": true,
  "message": "Super admin account created/updated successfully",
  "admin": {
    "id": "user_id_here",
    "email": "admin@trustedescort.in",
    "role": "admin"
  }
}
```

### Option B: Manual Database Entry

If you prefer to set up directly in MongoDB:

1. Go to MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
2. Navigate to your database cluster
3. Find the `User` collection
4. Insert a new document:

```json
{
  "_id": ObjectId(),
  "email": "admin@trustedescort.in",
  "passwordHash": "$2b$10$...[bcrypt_hash_of_your_password]",
  "displayName": "Super Admin",
  "role": "admin",
  "isEmailVerified": true,
  "authProvider": "local",
  "adminCreatedAt": new Date(),
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

**Note:** You need to generate a bcrypt hash for the password. You can use an online bcrypt generator or Node.js:
```javascript
const bcrypt = require('bcryptjs');
const password = 'YourSecurePassword123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

## Step 3: Log In to Admin Dashboard

### Navigate to Admin Login

Go to: `https://trustedescort.in/admin/login` (or your frontend URL)

**Or** directly access the admin login page:
```
https://trustedescort.vercel.app/admin/login
```

### Enter Your Credentials

- **Email:** trusted7061@gmail.com
- **Password:** Kold800*

**Note:** These credentials are also displayed at the bottom of the login page for quick reference.

### Successful Login

After successful login, you'll be redirected to the Super Admin Dashboard.

## Admin Dashboard Features

### 1. Pending Ads Tab
- View all pending ad approvals
- Click "View Details" to see full ad information
- **Approve** ads to make them visible on the platform
- **Reject** ads with optional rejection reason

### 2. Coin Purchases Tab
- Review pending coin purchase requests from users
- Approve coin purchases to credit user wallets
- View transaction amounts and dates

### 3. Statistics Tab
- Monitor total ads posted (pending/approved/rejected)
- Track total coins distributed
- View recent activities

## Admin API Endpoints

### Authentication

**Admin Login:**
```
POST /api/auth/admin/login
Body: { email, password }
Response: { token, refreshToken, user }
```

**Get Admin Info (Protected):**
```
GET /api/auth/admin/me
Headers: { Authorization: "Bearer <token>" }
```

### Ad Management

**Get Pending Ads:**
```
GET /api/ads/admin/pending-ads
Headers: { Authorization: "Bearer <token>" }
```

**Approve Ad:**
```
POST /api/ads/admin/ads/:adId/approve
Headers: { Authorization: "Bearer <token>" }
```

**Reject Ad:**
```
POST /api/ads/admin/ads/:adId/reject
Headers: { Authorization: "Bearer <token>" }
Body: { rejectionReason: "reason" }
```

### Coin Management

**Get Pending Coin Purchases:**
```
GET /api/ads/admin/coin-purchases
Headers: { Authorization: "Bearer <token>" }
```

**Approve Coin Purchase:**
```
POST /api/ads/admin/coins/approve-purchase
Headers: { Authorization: "Bearer <token>" }
Body: { walletId, coins }
```

**Manually Add Coins:**
```
POST /api/ads/admin/coins/add
Headers: { Authorization: "Bearer <token>" }
Body: { userId, coins, reason: "admin-adjustment" }
```

**Get Admin Statistics:**
```
GET /api/ads/admin/stats
Headers: { Authorization: "Bearer <token>" }
```

## Security Notes

⚠️ **Important:**

1. **Use HTTPS** - Always use HTTPS for admin access
2. **Strong Password** - Use a password with at least 8 characters including uppercase, lowercase, numbers, and symbols
3. **Keep Setup Key Secure** - The setup key is only used once. After admin is created, it's not needed
4. **Token Expiration** - Admin JWT tokens expire in 24 hours. You'll need to log in again
5. **Change Default Values** - Change all default environment variables in production

## Troubleshooting

### "Invalid setup key" Error

- Check that the `setupKey` in your request matches the `ADMIN_SETUP_KEY` in `.env`
- Ensure you've deployed the backend after updating `.env`

### "Admin access required" Error

- Ensure your user account has `role: "admin"` in the database
- Check that you're sending a valid JWT token in the Authorization header

### "Admin account already exists" Error

- An admin account has already been created
- Use the login endpoint instead: `POST /api/auth/admin/login`

### 404 Not Found at /admin/dashboard

- Make sure you've added the admin routes to `App.jsx`
- Check that you're using the frontend URL (Vercel), not the backend API URL
- Ensure `AdminLogin.jsx` and `SuperAdminDashboard.jsx` files exist in `src/pages/`

## Next Steps

1. ✅ Set up your admin account
2. ✅ Log in to the admin dashboard
3. ✅ Approve/reject test ads
4. ✅ Manage user coins
5. ✅ Monitor platform statistics

## Support

If you need help:
1. Check the troubleshooting section above
2. Verify all files are in the correct locations
3. Ensure environment variables are set correctly
4. Check browser console for errors (F12)
5. Check backend logs on Render dashboard

---

**Last Updated:** 2024
**Admin Dashboard Version:** 1.0
