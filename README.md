# TrustedAds - Ad Management Platform

## Project Overview
TrustedAds is a Node.js web application for managing advertisements. It features a dual-dashboard system — one for **Advertisers** (users who post ads) and one for **Admins** (who approve or reject ads before they go live).

---

## Tech Stack
| Layer        | Technology                        |
|--------------|-----------------------------------|
| Runtime      | Node.js                           |
| Framework    | Express.js                        |
| Templating   | EJS                               |
| Database     | MongoDB (Mongoose ODM)            |
| Auth         | express-session + bcrypt          |
| File Upload  | Multer                            |
| UI           | Bootstrap 5 + Custom CSS + AOS animations |

---

## Features

### 1. Public Landing Page
- Hero section with call-to-action
- How-it-works section
- Featured approved ads showcase
- Login / Register links

### 2. Authentication
- User registration (role: advertiser)
- Login / Logout
- Session-based auth with role guards
- Admin seeded via env or first-run

### 3. Advertiser Dashboard
- Overview stats (total ads, approved, pending, rejected)
- **Create New Ad** form with:
  - Ad Title
  - Ad Description (rich details)
  - Ad Category / Type (Banner, Video, Popup, Native, Social Media)
  - Target Audience
  - Ad Image upload (with preview)
  - Start Date & End Date (scheduling)
  - Budget (optional)
  - Landing URL
- View all submitted ads with status badges (Pending / Approved / Rejected)
- Edit or delete pending ads

### 4. Admin Dashboard
- Overview stats (total users, total ads, pending, approved, rejected)
- Manage Ads: list all ads with filters (status, type, date)
- View ad detail with image preview
- Approve / Reject ads with optional admin notes
- Manage Users: list all advertisers

---

## Folder Structure
```
trustednew/
├── README.md
├── package.json
├── .env
├── app.js                    # Express app entry point
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── User.js               # User schema (advertiser / admin)
│   └── Ad.js                 # Ad schema
├── routes/
│   ├── auth.js               # Login, Register, Logout
│   ├── admin.js              # Admin dashboard & ad management
│   ├── advertiser.js         # Advertiser dashboard & ad CRUD
│   └── public.js             # Landing page & public ad feed
├── middleware/
│   └── auth.js               # isAuthenticated, isAdmin, isAdvertiser
├── public/
│   ├── css/
│   │   └── style.css         # Custom styles
│   ├── js/
│   │   └── main.js           # Client-side scripts
│   └── uploads/              # Uploaded ad images
└── views/
    ├── layouts/
    │   └── main.ejs           # Base layout
    ├── partials/
    │   ├── navbar.ejs
    │   ├── footer.ejs
    │   └── flash.ejs
    ├── landing.ejs
    ├── auth/
    │   ├── login.ejs
    │   └── register.ejs
    ├── advertiser/
    │   ├── dashboard.ejs
    │   ├── create-ad.ejs
    │   ├── edit-ad.ejs
    │   └── my-ads.ejs
    └── admin/
        ├── dashboard.ejs
        ├── ads.ejs
        ├── ad-detail.ejs
        └── users.ejs
```

---

## Environment Variables (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/trustedads
SESSION_SECRET=your-super-secret-key
ADMIN_EMAIL=admin@trustedads.com
ADMIN_PASSWORD=Admin@123
```

---

## How to Run
```bash
# 1. Install MongoDB (if not installed)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# 2. Install dependencies
npm install

# 3. Start the app
npm start        # or: npm run dev (with nodemon)

# 4. Open browser
# http://localhost:3000
```

### Default Admin Login
- Email: `admin@trustedads.com`
- Password: `Admin@123`

---

## Status
- [x] README created
- [x] Project initialized
- [x] Models built (User + Ad)
- [x] Auth system (login, register, sessions)
- [x] Advertiser dashboard (create/edit/delete ads, status tracking)
- [x] Admin dashboard (approve/reject ads, manage users)
- [x] UI polished (Bootstrap 5, gradient theme, AOS animations)
