const express = require('express');
const MockInterview = require('../models/MockInterview');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all interviews
router.get('/', auth, async (req, res) => {
  try {
    const interviews = await MockInterview.find({ userId: req.userId })
      .sort({ date: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get('/stats', auth, async (req, res) => {
  try {
    const interviews = await MockInterview.find({ userId: req.userId })
      .sort({ date: 1 });
    
    const totalInterviews = interviews.length;
    const averageRating = totalInterviews > 0
      ? (interviews.reduce((sum, i) => sum + i.rating, 0) / totalInterviews).toFixed(1)
      : 0;
    
    // Rating over time for chart
    const ratingHistory = interviews.map(i => ({
      date: i.date,
      rating: i.rating,
      type: i.type
    }));

    // Type distribution
    const typeDistribution = {};
    interviews.forEach(i => {
      typeDistribution[i.type] = (typeDistribution[i.type] || 0) + 1;
    });

    res.json({
      totalInterviews,
      averageRating: parseFloat(averageRating),
      ratingHistory,
      typeDistribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add interview
router.post('/', auth, async (req, res) => {
  try {
    const interview = new MockInterview({
      ...req.body,
      userId: req.userId
    });
    await interview.save();
    res.status(201).json(interview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update interview
router.put('/:id', auth, async (req, res) => {
  try {
    const interview = await MockInterview.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json(interview);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete interview
router.delete('/:id', auth, async (req, res) => {
  try {
    const interview = await MockInterview.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    res.json({ message: 'Interview deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
