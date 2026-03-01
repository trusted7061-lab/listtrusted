# Admin Account Setup Instructions

## Setup Summary

Your admin account is ready to be activated. Here's what you need to do:

### Credentials
- **Email:** trusted7061@gmail.com
- **Password:** Kold800*

### Step 1: Create Admin Account in Database

You need to initialize the admin account by calling the backend setup endpoint. Here are three methods:

#### Method 1: Using cURL (Recommended)

Run this command in your terminal:

```bash
curl -X POST https://trustedescort-backend.onrender.com/api/auth/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trusted7061@gmail.com",
    "password": "Kold800*",
    "setupKey": "TRUSTED_ESCORT_SETUP_KEY_2024"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Super admin account created/updated successfully",
  "admin": {
    "id": "...",
    "email": "trusted7061@gmail.com",
    "role": "admin"
  }
}
```

#### Method 2: Using Postman

1. Open Postman
2. Create a new POST request
3. URL: `https://trustedescort-backend.onrender.com/api/auth/admin/setup`
4. Headers:
   - Content-Type: application/json
5. Body (raw JSON):
```json
{
  "email": "trusted7061@gmail.com",
  "password": "Kold800*",
  "setupKey": "TRUSTED_ESCORT_SETUP_KEY_2024"
}
```
6. Click Send

#### Method 3: Direct MongoDB Access

If the API endpoint is not responding, you can manually insert the admin user into MongoDB:

1. Log in to MongoDB Atlas: https://www.mongodb.com/cloud/atlas
2. Go to your Database Cluster → Collections
3. Find the "User" collection
4. Click Insert Document
5. Paste this JSON (replace the password hash):

```json
{
  "email": "trusted7061@gmail.com",
  "passwordHash": "$2b$10$u3r1T3/z0K3V5j7R9g8M3eJ1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z",
  "displayName": "Super Admin",
  "role": "admin",
  "isEmailVerified": true,
  "authProvider": "local",
  "adminCreatedAt": ISODate("2026-03-01T00:00:00Z"),
  "createdAt": ISODate("2026-03-01T00:00:00Z"),
  "updatedAt": ISODate("2026-03-01T00:00:00Z")
}
```

To generate the correct password hash, use Node.js:
```javascript
const bcrypt = require('bcryptjs');
const password = 'Kold800*';
const hash = await bcrypt.hash(password, 10);
console.log(hash); // Use this hash value in MongoDB
```

### Step 2: Configure Vercel Environment Variables

The frontend needs to know where the backend API is located:

1. Go to Vercel: https://vercel.com/dashboard
2. Select your "trustedescort" project
3. Go to Settings → Environment Variables
4. Add this variable:
   - **Name:** VITE_API_URL
   - **Value:** https://trustedescort-backend.onrender.com/api
   - **Environments:** Production, Preview, Development
5. Save and re-deploy

### Step 3: Login to Admin Dashboard

Once the admin account is created and environment variables are set:

1. Go to: https://trustedescort.in/admin/login
2. Enter credentials:
   - **Email:** trusted7061@gmail.com
   - **Password:** Kold800*
3. Click Login

You should be redirected to the Admin Dashboard showing:
- Total Ads: 468
- Active Ads: 468
- Total Locations: 1,057
- Total Users: 0

### Dashboard Features

The admin dashboard provides:
- ✅ Admin stats overview
- 📝 Manage Ads (to be implemented)
- 👥 Manage Users (to be implemented)
- 📍 Manage Locations (to be implemented)
- 📊 Analytics (to be implemented)
- ⚙️ Settings (to be implemented)
- 📚 API Docs (to be implemented)
- 🚪 Logout functionality

### Troubleshooting

**Problem: "Invalid admin credentials"**
- Make sure the admin account was successfully created
- Check that email and password are exactly correct (case-sensitive)
- Try the cURL command again

**Problem: "API timeout" or "Cannot reach API"**
- Check that the backend is running on Render: https://trustedescort-backend.onrender.com/api/health
- Verify VITE_API_URL environment variable is set in Vercel
- Re-deploy the frontend after setting environment variables

**Problem: "Admin account already exists"**
- This means the setup was already successful
- Just try logging in with your credentials

### Important Notes

- The admin setup key is: `TRUSTED_ESCORT_SETUP_KEY_2024`
- Only the first admin account can be created this way
- After creation, additional admins can be managed via the dashboard (when that feature is implemented)
- Tokens expire in 24 hours - you'll need to login again after that
