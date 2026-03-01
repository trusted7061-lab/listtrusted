# Bulk Ad Generation Guide

This guide explains how to populate all 1,057+ locations with content (6 ads per location = 6,342+ ads).

## Why This Is Important

- **Every location page** needs content to rank in search
- **6 ads per location** ensures rich content for visitors
- **Prevents "no results"** pages that hurt SEO
- **Fills admin dashboard** with real data to manage

## Quick Start

### Option 1: From Backend Directory (Recommended)

```bash
cd backend
npm run seed:locations
```

### Option 2: Manual Node Script

```bash
cd backend
node generate-bulk-ads.js
```

## What It Does

1. ✅ Connects to MongoDB
2. ✅ Finds your admin account (trusted7061@gmail.com)
3. ✅ Reads all 1,057 approved locations from `approved-locations.txt`
4. ✅ Creates exactly 6 approved ads per location
5. ✅ First ad in each location is marked as Premium
6. ✅ All ads are auto-approved and show immediately

## Expected Results

- **6,342+ ads** created across all locations
- **Every location page** has minimum 6 escorts
- **Admin dashboard** shows real pending/approved counts
- **Ads visible instantly** on location pages

## Ad Details

Each generated ad includes:
- ✅ Realistic escort profile (name, age, body type)
- ✅ Location-specific title: "Name - Premium Companion in CityName"
- ✅ Services list (Companionship, Dinner, Hotel, Travel, Party)
- ✅ Descriptive text about the profile
- ✅ Placeholder image (high-res)
- ✅ 1 Premium ad per location for visibility

## Database Impact

**Before:**
- ~468 ads across system
- Most locations: 0 ads
- Empty location pages

**After:**
- ~6,810 total ads (468 + 6,342)
- Every location: 6+ ads
- All pages have rich content

## Monitoring Progress

The script displays real-time progress:
```
✅ Connected to MongoDB
✅ Found admin user: trusted7061@gmail.com
📂 Found 1057 locations
🎯 Generating 6 ads per location...
📊 Progress: 500/6342 (7.9%)
📊 Progress: 1000/6342 (15.8%)
... continues until 100%
```

## Verification

After running, verify it worked:

1. **Check MongoDB:**
   ```javascript
   db.adpostings.countDocuments({ adminApprovalStatus: 'approved' })
   // Should return: ~6810+
   ```

2. **Test Location Pages:**
   - Visit: https://trustedescort.in/escorts-in-mumbai
   - Should show: 6 featured escorts
   - Visit: https://trustedescort.in/escorts-in-bangalore
   - Should show: 6 featured escorts

3. **Admin Dashboard:**
   - Login: https://trustedescort.in/superadmin-dashboard
   - Credentials: trusted7061@gmail.com / Kold800*
   - Check: "Total Ads" should be ~6800+
   - Check: "Approved Ads" should be ~6800+

## Troubleshooting

### Script fails to connect MongoDB
- Verify `.env` has `MONGO_URI`
- Check MongoDB Atlas IP whitelist
- Ensure network connectivity

### Admin user not found
- Run setup: [ADMIN_ACCOUNT_SETUP.md](../ADMIN_ACCOUNT_SETUP.md)
- Or create manually in MongoDB

### approved-locations.txt not found
- Ensure file exists at root: `/approved-locations.txt`
- Should have 1,057 lines of location names

### Slow performance
- Normal for 6,300+ inserts
- Takes ~30-60 seconds depending on connection
- Process shown in real-time progress

## Reverting Changes

To delete all generated ads:

```bash
# From MongoDB shell
db.adpostings.deleteMany({
  userId: ObjectId("admin_user_id"),
  adminApprovalStatus: "approved"
})
```

Or delete newer ads (by date):
```bash
db.adpostings.deleteMany({ createdAt: { $gt: ISODate("2026-03-01") } })
```
