const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Wallet = require('../models/Wallet');
const AdPosting = require('../models/AdPosting');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify user is authenticated
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No authorization token' });
  }
  // TODO: Add JWT verification
  req.userId = req.body.userId || req.query.userId;
  next();
};

// Middleware to verify super admin
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Admin verification failed' });
  }
};

// ==========================================
// WALLET / COIN ENDPOINTS
// ==========================================

// Get user wallet and coin balance
router.get('/wallet/balance', authMiddleware, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.userId });
    
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId });
      await wallet.save();
    }
    
    res.json({
      coins: wallet.coins,
      totalEarned: wallet.totalCoinsEarned,
      totalSpent: wallet.totalCoinsSpent,
      transactions: wallet.transactions.slice(-10) // Last 10 transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch wallet', error: error.message });
  }
});

// Get full transaction history
router.get('/wallet/transactions', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      return res.json({ transactions: [], total: 0 });
    }
    
    const transactions = wallet.transactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice((page - 1) * limit, page * limit);
    
    res.json({
      transactions,
      total: wallet.transactions.length,
      page,
      limit
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// Initiate coin purchase - returns payment gateway info
router.post('/wallet/purchase-coins', [
  body('coinsAmount').isIn([50, 100, 250, 500, 1000]).withMessage('Invalid coin amount'),
  body('paymentMethod').isIn(['gpay']).withMessage('Invalid payment method')
], authMiddleware, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { coinsAmount, paymentMethod } = req.body;
    
    // Calculate price based on coins
    // 1 coin = ₹10 (example rate)
    const priceInPaisa = coinsAmount * 10 * 100; // Convert to paise for Google Pay
    
    // Create a pending transaction
    const wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      const newWallet = new Wallet({ userId: req.userId });
      await newWallet.save();
    }
    
    // Generate unique transaction ID
    const transactionId = `TXN_${Date.now()}_${req.userId}`;
    
    res.json({
      success: true,
      transactionId,
      amount: priceInPaisa / 100,
      coins: coinsAmount,
      paymentMethod,
      // Return Google Pay payload
      googlePayPayload: {
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: {
          merchantName: 'Trusted Escort',
          merchantId: process.env.GOOGLE_PAY_MERCHANT_ID || '12345678901234567890'
        },
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD', 'VISA']
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'example',
                gatewayMerchantId: process.env.GOOGLE_PAY_MERCHANT_ID
              }
            }
          }
        ],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: (priceInPaisa / 100).toString(),
          currencyCode: 'INR'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initiate purchase', error: error.message });
  }
});

// Confirm coin purchase after payment
router.post('/wallet/confirm-purchase', [
  body('transactionId').notEmpty().withMessage('Transaction ID required'),
  body('coinsAmount').isInt({ min: 1 }).withMessage('Invalid coins amount'),
  body('paymentStatus').isIn(['success', 'failed']).withMessage('Invalid payment status')
], authMiddleware, async (req, res) => {
  try {
    const { transactionId, coinsAmount, paymentStatus } = req.body;
    
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId });
    }
    
    if (paymentStatus === 'success') {
      wallet.coins += coinsAmount;
      wallet.totalCoinsEarned += coinsAmount;
      
      wallet.transactions.push({
        type: 'purchase',
        coins: coinsAmount,
        description: `Purchased ${coinsAmount} coins`,
        reference: 'coin-purchase',
        paymentMethod: 'gpay',
        transactionId,
        status: 'completed'
      });
      
      await wallet.save();
      res.json({ success: true, coins: wallet.coins, message: 'Coins added successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to confirm purchase', error: error.message });
  }
});

// Request coins from admin (Advertiser)
router.post('/request-coins', [
  body('coinsRequested').isIn([200, 500, 1000]).withMessage('Invalid coin amount')
], authMiddleware, async (req, res) => {
  try {
    const { coinsRequested } = req.body;

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId });
      await wallet.save();
    }

    // Add a pending transaction for admin review
    wallet.transactions.push({
      type: 'admin-add',
      coins: coinsRequested,
      description: `Coin request for ${coinsRequested} coins`,
      reference: 'manual',
      status: 'pending',
      createdAt: new Date()
    });

    await wallet.save();

    res.json({
      success: true,
      message: `Requested ${coinsRequested} coins. Admin will review and approve your request.`,
      coinsRequested
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to request coins', error: error.message });
  }
});

// ==========================================
// AD POSTING ENDPOINTS
// ==========================================

// Get coin cost for time slot
router.get('/ads/coin-cost', (req, res) => {
  const timeSlot = req.query.timeSlot; // morning, afternoon, night
  
  const costMap = {
    'morning': 5,     // 6 AM - 12 PM
    'afternoon': 8,   // 12 PM - 6 PM
    'night': 10       // 6 PM - 6 AM
  };
  
  if (!costMap[timeSlot]) {
    return res.status(400).json({ message: 'Invalid time slot' });
  }
  
  res.json({
    timeSlot,
    coinsRequired: costMap[timeSlot],
    description: {
      'morning': '6:00 AM - 12:00 PM',
      'afternoon': '12:00 PM - 6:00 PM',
      'night': '6:00 PM - 6:00 AM'
    }[timeSlot]
  });
});

// Post new ad
router.post('/ads/create', [
  body('title').notEmpty().trim().isLength({ max: 100 }).withMessage('Valid title required'),
  body('description').notEmpty().trim().isLength({ max: 2000 }).withMessage('Valid description required'),
  body('category').isIn(['escort-service', 'companion', 'events', 'other']).withMessage('Invalid category'),
  body('timeSlot').isIn(['morning', 'afternoon', 'night']).withMessage('Invalid time slot'),
  body('location').notEmpty().trim().withMessage('Location required'),
  body('city').notEmpty().trim().withMessage('City required'),
  body('contact.phone').isMobilePhone('any').withMessage('Valid phone required'),
  body('contact.whatsapp').optional().isMobilePhone('any').withMessage('Valid whatsapp number'),
  body('contact.email').isEmail().withMessage('Valid email required')
], authMiddleware, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, category, timeSlot, location, city, state, contact, pricing, images } = req.body;
    
    // Get user wallet
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId });
      await wallet.save();
    }
    
    // Determine coin cost
    const coinCost = { 'morning': 5, 'afternoon': 8, 'night': 10 }[timeSlot];
    
    // Check if user has enough coins
    let isPremium = false;
    if (wallet.coins >= coinCost) {
      isPremium = true;
      wallet.coins -= coinCost;
      wallet.totalCoinsSpent += coinCost;
      
      wallet.transactions.push({
        type: 'spend',
        coins: -coinCost,
        description: `Posted ad: ${title} (${timeSlot})`,
        reference: 'ad-posting',
        paymentMethod: 'system',
        status: 'completed'
      });
    }
    
    // Create ad posting
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days expiry
    
    const adPosting = new AdPosting({
      userId: req.userId,
      title,
      description,
      category,
      timeSlot,
      location,
      city,
      state,
      contact,
      pricing,
      images: images || [],
      coinsUsed: isPremium ? coinCost : 0,
      isPremium,
      startDate: now,
      endDate: now,
      expiresAt: expiryDate,
      status: 'pending', // Needs admin approval
      adminApprovalStatus: 'pending',
      metadata: {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        deviceType: 'mobile' // Can be enhanced
      }
    });
    
    await adPosting.save();
    await wallet.save();
    
    res.status(201).json({
      success: true,
      adId: adPosting._id,
      message: isPremium 
        ? `Ad posted with premium placement (${coinCost} coins used)`
        : 'Ad posted. It will appear after admin approval.',
      isPremium,
      coinsUsed: coinCost,
      remainingCoins: wallet.coins,
      status: 'pending'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to post ad', error: error.message });
  }
});

// Get user's ads
router.get('/ads/my-ads', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const ads = await AdPosting.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-metadata');
    
    const total = await AdPosting.countDocuments({ userId: req.userId });
    
    res.json({ ads, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ads' });
  }
});

// Delete/deactivate user's own ad
router.delete('/ads/:adId', authMiddleware, async (req, res) => {
  try {
    const ad = await AdPosting.findById(req.params.adId);
    
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }
    
    if (ad.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this ad' });
    }
    
    // Refund coins if ad was premium and not yet approved
    if (ad.isPremium && ad.adminApprovalStatus === 'pending') {
      const wallet = await Wallet.findOne({ userId: req.userId });
      wallet.coins += ad.coinsUsed;
      wallet.transactions.push({
        type: 'refund',
        coins: ad.coinsUsed,
        description: `Refund for deleted ad: ${ad.title}`,
        reference: 'ad-posting',
        status: 'completed'
      });
      await wallet.save();
    }
    
    ad.status = 'inactive';
    await ad.save();
    
    res.json({ success: true, message: 'Ad deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete ad' });
  }
});

// ==========================================
// SUPER ADMIN ENDPOINTS
// ==========================================

// Get pending ads for approval
router.get('/admin/pending-ads', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const ads = await AdPosting.find({ adminApprovalStatus: 'pending' })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'email phone displayName');
    
    const total = await AdPosting.countDocuments({ adminApprovalStatus: 'pending' });
    
    res.json({ ads, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending ads', error: error.message });
  }
});

// Approve ad
router.post('/admin/ads/:adId/approve', adminMiddleware, async (req, res) => {
  try {
    const ad = await AdPosting.findByIdAndUpdate(
      req.params.adId,
      {
        adminApprovalStatus: 'approved',
        status: 'approved',
        approvedBy: req.userId,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }
    
    res.json({ success: true, message: 'Ad approved', ad });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve ad', error: error.message });
  }
});

// Reject ad
router.post('/admin/ads/:adId/reject', [
  body('rejectionReason').notEmpty().trim().withMessage('Reason required')
], adminMiddleware, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    const ad = await AdPosting.findById(req.params.adId);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }
    
    // Refund coins if it was premium
    if (ad.isPremium) {
      const wallet = await Wallet.findOne({ userId: ad.userId });
      wallet.coins += ad.coinsUsed;
      wallet.transactions.push({
        type: 'refund',
        coins: ad.coinsUsed,
        description: `Refund for rejected ad: ${ad.title} - ${rejectionReason}`,
        reference: 'ad-posting',
        status: 'completed'
      });
      await wallet.save();
    }
    
    ad.adminApprovalStatus = 'rejected';
    ad.status = 'rejected';
    ad.rejectionReason = rejectionReason;
    ad.approvedBy = req.userId;
    await ad.save();
    
    res.json({ success: true, message: 'Ad rejected', ad });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject ad', error: error.message });
  }
});

// Get coin purchase requests for approval
router.get('/admin/coin-purchases', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    // Get all wallets with pending transactions
    const wallets = await Wallet.find({
      'transactions.status': 'pending',
      'transactions.type': 'purchase'
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'email phone displayName');
    
    const total = await Wallet.countDocuments({
      'transactions.status': 'pending',
      'transactions.type': 'purchase'
    });
    
    res.json({ wallets, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch coin purchases' });
  }
});

// Approve/Confirm coin purchase (Admin)
router.post('/admin/coins/approve-purchase', [
  body('walletId').notEmpty().withMessage('Wallet ID required'),
  body('transactionId').notEmpty().withMessage('Transaction ID required'),
  body('approved').isBoolean().withMessage('Approval status required')
], adminMiddleware, async (req, res) => {
  try {
    const { walletId, transactionId, approved } = req.body;
    
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }
    
    const transaction = wallet.transactions.find(t => t.transactionId === transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (approved) {
      transaction.status = 'completed';
      res.json({ success: true, message: 'Coin purchase approved', wallet });
    } else {
      transaction.status = 'failed';
      res.json({ success: true, message: 'Coin purchase rejected', wallet });
    }
    
    await wallet.save();
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve purchase', error: error.message });
  }
});

// Manually add coins to user (Admin only)
router.post('/admin/coins/add', [
  body('userId').notEmpty().withMessage('User ID required'),
  body('coins').isInt({ min: 1 }).withMessage('Valid coins required'),
  body('reason').notEmpty().trim().withMessage('Reason required')
], adminMiddleware, async (req, res) => {
  try {
    const { userId, coins, reason } = req.body;
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
    }
    
    wallet.coins += coins;
    wallet.totalCoinsEarned += coins;
    wallet.transactions.push({
      type: 'admin-add',
      coins,
      description: `Admin added ${coins} coins - ${reason}`,
      reference: 'manual',
      status: 'completed'
    });
    
    await wallet.save();
    
    res.json({ success: true, message: `${coins} coins added to user`, wallet });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add coins', error: error.message });
  }
});

// Get dashboard statistics (Admin)
router.get('/admin/stats', adminMiddleware, async (req, res) => {
  try {
    const pendingAds = await AdPosting.countDocuments({ adminApprovalStatus: 'pending' });
    const approvedAds = await AdPosting.countDocuments({ adminApprovalStatus: 'approved' });
    const rejectedAds = await AdPosting.countDocuments({ adminApprovalStatus: 'rejected' });
    
    const totalCoinsInSystem = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: '$coins' } } }
    ]);
    
    const totalSpent = await Wallet.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCoinsSpent' } } }
    ]);
    
    const recentAds = await AdPosting.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'email displayName');
    
    res.json({
      ads: {
        pending: pendingAds,
        approved: approvedAds,
        rejected: rejectedAds
      },
      coins: {
        circulatingCoins: totalCoinsInSystem[0]?.total || 0,
        totalSpent: totalSpent[0]?.total || 0
      },
      recentAds
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get all users with their stats (Admin)
router.get('/admin/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('_id email phone displayName businessName createdAt')
      .sort({ createdAt: -1 });
    
    // Get detailed stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ userId: user._id });
        const ads = await AdPosting.find({ userId: user._id });
        const pendingAds = ads.filter(a => a.adminApprovalStatus === 'pending');
        const approvedAds = ads.filter(a => a.adminApprovalStatus === 'approved');
        const rejectedAds = ads.filter(a => a.adminApprovalStatus === 'rejected');
        
        return {
          id: user._id,
          email: user.email,
          phone: user.phone || 'N/A',
          displayName: user.displayName || 'N/A',
          businessName: user.businessName || 'N/A',
          createdAt: user.createdAt,
          coins: wallet?.coins || 0,
          totalCoinsEarned: wallet?.totalCoinsEarned || 0,
          totalCoinsSpent: wallet?.totalCoinsSpent || 0,
          adsCount: {
            total: ads.length,
            pending: pendingAds.length,
            approved: approvedAds.length,
            rejected: rejectedAds.length
          },
          recentAds: ads.slice(0, 3).map(a => ({
            id: a._id,
            title: a.title,
            status: a.adminApprovalStatus,
            createdAt: a.createdAt
          }))
        };
      })
    );
    
    res.json({
      totalUsers: usersWithStats.length,
      users: usersWithStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

// Get advertiser coin requests with their ad statistics (Admin)
router.get('/admin/advertiser-coin-requests', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Get all advertisers sorted by most recent first
    const users = await User.find({ userType: 'advertiser', role: { $ne: 'admin' } })
      .select('_id email phone displayName businessName createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get detailed stats for each advertiser
    const advertisersWithStats = await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ userId: user._id });
        const ads = await AdPosting.find({ userId: user._id });
        
        // Calculate ad statistics
        const now = new Date();
        const activeAds = ads.filter(a => 
          a.adminApprovalStatus === 'approved' && 
          new Date(a.expiresAt) > now
        );
        const pendingAds = ads.filter(a => a.adminApprovalStatus === 'pending');
        const expiredAds = ads.filter(a => 
          new Date(a.expiresAt) < now
        );
        const rejectedAds = ads.filter(a => a.adminApprovalStatus === 'rejected');

        return {
          userId: user._id,
          email: user.email,
          phone: user.phone || 'N/A',
          displayName: user.displayName || 'N/A',
          businessName: user.businessName || 'N/A',
          joinedDate: user.createdAt,
          currentCoins: wallet?.coins || 0,
          totalCoinsEarned: wallet?.totalCoinsEarned || 0,
          totalCoinsSpent: wallet?.totalCoinsSpent || 0,
          adsStats: {
            total: ads.length,
            active: activeAds.length,
            pending: pendingAds.length,
            expired: expiredAds.length,
            rejected: rejectedAds.length
          },
          recentAds: ads.slice(0, 5).map(a => ({
            id: a._id,
            title: a.title,
            status: a.adminApprovalStatus,
            expiresAt: a.expiresAt,
            isPremium: a.isPremium,
            coinsUsed: a.coinsUsed,
            createdAt: a.createdAt
          }))
        };
      })
    );

    const total = await User.countDocuments({ userType: 'advertiser', role: { $ne: 'admin' } });

    res.json({
      total,
      page,
      limit,
      advertisers: advertisersWithStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch advertiser coin requests', error: error.message });
  }
});

module.exports = router;
