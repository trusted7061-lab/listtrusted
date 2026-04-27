require('dotenv').config();
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const connectDB = require('./config/db');
const { setLocals } = require('./middleware/auth');
const User = require('./models/User');
const seedCityAds = require('./seeds/cityAds');

const app = express();
app.set('trust proxy', 1); // Required for secure cookies behind Vercel/reverse proxy

// ── Compression (gzip all HTML/JSON/CSS/JS responses) ───────────────────────
app.use(compression({ level: 6, threshold: 1024 }));

// ── Security / performance headers ───────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ── View engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Interceptor for XML responses: remove set-cookie header ──────────────────
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    // Check if response is XML
    if (typeof data === 'string' && (data.trim().startsWith('<?xml') || req.path.endsWith('.xml'))) {
      res.removeHeader('set-cookie');
    }
    return originalSend.call(this, data);
  };
  next();
});

// ── Static files with long-lived cache ──────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  immutable: true,
  setHeaders(res, filePath) {
    // EJS views / HTML should never be cached at the CDN level
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// ── Session ───────────────────────────────────────────────────────────────────
const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
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
app.use((req, res, next) => {
  connectDB()
    .catch(err => {
      console.error('DB connect middleware error:', err.message);
      // Don't block the request — let route handlers handle DB errors individually
    });
  next();
});

// ── Health check (debug) ─────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const status = { env: process.env.NODE_ENV, mongoUri: !!process.env.MONGODB_URI, timestamp: new Date().toISOString() };
  try {
    await connectDB();
    status.db = 'connected';
  } catch (err) {
    status.db = 'error';
    status.error = err.message;
  }
  res.json(status);
});

// ── Legacy URL redirects (/escorts/in/:slug → /escorts-service/:slug) ─────────
app.get('/escorts/in/:slug', (req, res) => {
  res.redirect(301, `/escorts-service/${req.params.slug}`);
});
app.get('/escorts/in', (req, res) => {
  res.redirect(301, '/escorts-service/');
});

// ── Legacy /location/:slug redirects ────────────────────────────────────────
app.get('/location/:slug', (req, res) => {
  res.redirect(301, `/escorts-service/${req.params.slug}`);
});
app.get('/location', (req, res) => {
  res.redirect(301, '/escorts-service/');
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', require('./routes/sitemap'));
app.use('/', require('./routes/public'));
app.use('/escorts-service', require('./routes/escorts-service'));
app.use('/auth', require('./routes/auth'));
app.use('/advertiser', require('./routes/advertiser'));
app.use('/admin', require('./routes/admin'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found', noindex: true });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  // Only send error response, don't redirect to avoid infinite redirect loops
  const referer = req.get('Referrer');
  const referrerPath = referer ? new URL(referer).pathname : null;
  
  // Prevent redirecting to the same page that caused the error
  if (referrerPath && referrerPath === req.originalUrl) {
    return res.status(500).render('404', { 
      title: 'Error', 
      noindex: true,
      error: 'An error occurred processing your request. Please try again.'
    });
  }
  
  if (req.flash) req.flash('error', err.message || 'An unexpected error occurred. Please try again.');
  res.redirect(referer || '/');
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
