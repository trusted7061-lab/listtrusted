require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo').MongoStore;
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const connectDB = require('./config/db');
const { setLocals } = require('./middleware/auth');
const User = require('./models/User');
const seedCityAds = require('./seeds/cityAds');

const app = express();

// DB ready promise — resolved once on first invocation
let dbReady = null;

async function initDB() {
  if (dbReady) return dbReady;
  dbReady = (async () => {
    const mongoUri = await connectDB();
    return mongoUri;
  })();
  return dbReady;
}

async function startApp() {
  // Connect to MongoDB (returns resolved URI)
  const mongoUri = await connectDB();

  // View engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(expressLayouts);
  app.set('layout', 'layouts/main');

  // Body parsing
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Static files
  app.use(express.static(path.join(__dirname, 'public')));

  // Session
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions'
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      sameSite: 'lax'
    }
  }));

  // Flash messages
  app.use(flash());

  // Set locals (user info + flash)
  app.use(setLocals);

  // Routes
  app.use('/', require('./routes/public'));
  app.use('/escorts-service', require('./routes/escorts-service'));
  app.use('/', require('./routes/sitemap'));
  app.use('/auth', require('./routes/auth'));
  app.use('/advertiser', require('./routes/advertiser'));
  app.use('/admin', require('./routes/admin'));

  // 404
  app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
  });

  // Seed in background — don't block Vercel cold starts
  seedAdmin().catch(err => console.error('Seed admin failed:', err));
  seedCityAds().catch(err => console.error('Seed city ads failed:', err));
}

// Seed admin user
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

startApp()
  .then(() => {
    // Only bind a port when running locally (not on Vercel serverless)
    if (require.main === module) {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    }
  })
  .catch(err => {
    console.error('Failed to start app:', err);
    if (require.main === module) process.exit(1);
  });

// Export for Vercel serverless
module.exports = app;
