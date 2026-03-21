require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const connectDB = require('./config/db');
const { setLocals } = require('./middleware/auth');
const User = require('./models/User');
const seedCityAds = require('./seeds/cityAds');

const app = express();

// ── View engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Static files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Session ───────────────────────────────────────────────────────────────────
const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: 'lax'
  }
};
// Only use MongoStore when a URI is available; fall back to in-memory otherwise
if (process.env.MONGODB_URI) {
  const MongoStore = require('connect-mongo').default;
  sessionOptions.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  });
}
app.use(session(sessionOptions));

// ── Flash + locals ────────────────────────────────────────────────────────────
app.use(flash());
app.use(setLocals);

// ── Ensure DB is connected before any route handler runs ─────────────────────
// bufferCommands:false means queries fail immediately when not connected,
// so we must explicitly await the connection on every cold-start request.
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connect middleware error:', err.message);
    // Don't block the request — let route handlers handle DB errors individually
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', require('./routes/public'));
app.use('/escorts-service', require('./routes/escorts-service'));
app.use('/', require('./routes/sitemap'));
app.use('/auth', require('./routes/auth'));
app.use('/advertiser', require('./routes/advertiser'));
app.use('/admin', require('./routes/admin'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// ── Database connection (non-blocking — Mongoose buffers queries until ready) ─
connectDB()
  .then(() => {
    seedAdmin().catch(err => console.error('Seed admin failed:', err));
    seedCityAds().catch(err => console.error('Seed city ads failed:', err));
  })
  .catch(err => console.error('DB connection failed:', err));

// ── Seed admin ────────────────────────────────────────────────────────────────
async function seedAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });
      console.log('Admin user seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding admin:', err.message);
  }
}

// ── Local server (not used on Vercel) ─────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
