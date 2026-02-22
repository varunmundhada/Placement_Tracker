const express = require('express');
const User = require('../models/User');
const Email = require('../models/Email');
const auth = require('../middleware/auth');
const gmailService = require('../services/gmailService');

const router = express.Router();

// Get Gmail connection status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({
      connected: user.gmail?.connected || false,
      email: user.gmail?.email || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get OAuth URL
router.get('/auth-url', auth, async (req, res) => {
  try {
    const authUrl = gmailService.getAuthUrl(req.userId.toString());
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.redirect(`${process.env.FRONTEND_URL}/emails?error=missing_params`);
    }

    // Exchange code for tokens
    const tokens = await gmailService.getTokens(code);

    // Get user email from Google
    gmailService.setCredentials(tokens);
    const { google } = require('googleapis');
    const oauth2 = google.oauth2({ version: 'v2', auth: gmailService.oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Update user with Gmail tokens
    await User.findByIdAndUpdate(userId, {
      gmail: {
        connected: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(tokens.expiry_date),
        email: userInfo.data.email
      }
    });

    res.redirect(`${process.env.FRONTEND_URL}/emails?connected=true`);
  } catch (error) {
    console.error('Gmail OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/emails?error=auth_failed`);
  }
});

// Disconnect Gmail
router.post('/disconnect', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, {
      gmail: {
        connected: false,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        email: null
      }
    });

    // Optionally delete cached emails
    await Email.deleteMany({ userId: req.userId });

    res.json({ message: 'Gmail disconnected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync emails from Gmail
router.post('/sync', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user.gmail?.connected) {
      return res.status(400).json({ error: 'Gmail not connected' });
    }

    // Refresh token if needed
    const newTokens = await gmailService.refreshTokenIfNeeded(user);
    if (newTokens) {
      user.gmail.accessToken = newTokens.accessToken;
      user.gmail.tokenExpiry = newTokens.tokenExpiry;
      await user.save();
    }

    // Fetch emails
    const emails = await gmailService.fetchEmails(user.gmail.accessToken);

    // Save to database
    let newCount = 0;
    for (const emailData of emails) {
      const category = gmailService.categorizeEmail(emailData);
      const company = gmailService.extractCompany(emailData);

      try {
        await Email.findOneAndUpdate(
          { userId: req.userId, gmailId: emailData.gmailId },
          {
            ...emailData,
            userId: req.userId,
            category,
            company,
            fetchedAt: new Date()
          },
          { upsert: true, new: true }
        );
        newCount++;
      } catch (err) {
        // Skip duplicates
        if (err.code !== 11000) {
          console.error('Error saving email:', err);
        }
      }
    }

    res.json({
      message: `Synced ${newCount} placement-related emails`,
      count: newCount
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all placement emails
router.get('/', auth, async (req, res) => {
  try {
    const { category, starred, search } = req.query;
    const query = { userId: req.userId };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (starred === 'true') {
      query.starred = true;
    }

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { from: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const emails = await Email.find(query)
      .sort({ date: -1 })
      .limit(100);

    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get email stats
router.get('/stats', auth, async (req, res) => {
  try {
    const emails = await Email.find({ userId: req.userId });

    const stats = {
      total: emails.length,
      unread: emails.filter(e => !e.isRead).length,
      byCategory: {},
      byCompany: {},
      recent: emails.filter(e => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return e.date > weekAgo;
      }).length
    };

    // Count by category
    emails.forEach(email => {
      stats.byCategory[email.category] = (stats.byCategory[email.category] || 0) + 1;
      if (email.company) {
        stats.byCompany[email.company] = (stats.byCompany[email.company] || 0) + 1;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle starred
router.patch('/:id/star', auth, async (req, res) => {
  try {
    const email = await Email.findOne({ _id: req.params.id, userId: req.userId });
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    email.starred = !email.starred;
    await email.save();
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const email = await Email.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update category manually
router.patch('/:id/category', auth, async (req, res) => {
  try {
    const { category } = req.body;
    const email = await Email.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { category },
      { new: true }
    );
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete email from tracker
router.delete('/:id', auth, async (req, res) => {
  try {
    const email = await Email.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json({ message: 'Email removed from tracker' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
