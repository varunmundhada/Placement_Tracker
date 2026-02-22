const express = require('express');
const AptitudeSession = require('../models/AptitudeSession');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all sessions for user
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await AptitudeSession.find({ userId: req.userId })
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get('/stats', auth, async (req, res) => {
  try {
    const sessions = await AptitudeSession.find({ userId: req.userId });
    
    const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsSolved, 0);
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalTime = sessions.reduce((sum, s) => sum + s.timeSpent, 0);
    const averageAccuracy = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;

    // Group by topic
    const topicStats = {};
    sessions.forEach(session => {
      if (!topicStats[session.topic]) {
        topicStats[session.topic] = {
          questions: 0,
          correct: 0,
          time: 0
        };
      }
      topicStats[session.topic].questions += session.questionsSolved;
      topicStats[session.topic].correct += session.correctAnswers;
      topicStats[session.topic].time += session.timeSpent;
    });

    res.json({
      totalSessions: sessions.length,
      totalQuestions,
      totalCorrect,
      totalTime,
      averageAccuracy,
      topicStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new session
router.post('/', auth, async (req, res) => {
  try {
    const session = new AptitudeSession({
      ...req.body,
      userId: req.userId
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update session
router.put('/:id', auth, async (req, res) => {
  try {
    const session = await AptitudeSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await AptitudeSession.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
