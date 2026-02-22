const express = require('express');
const AptitudeSession = require('../models/AptitudeSession');
const TechnicalSkill = require('../models/TechnicalSkill');
const Resume = require('../models/Resume');
const MockInterview = require('../models/MockInterview');
const auth = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview
router.get('/', auth, async (req, res) => {
  try {
    // Aptitude stats
    const aptitudeSessions = await AptitudeSession.find({ userId: req.userId });
    const totalQuestions = aptitudeSessions.reduce((sum, s) => sum + s.questionsSolved, 0);
    const totalCorrect = aptitudeSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const aptitudeAccuracy = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;

    // Technical skills stats
    const skills = await TechnicalSkill.find({ userId: req.userId });
    let totalTopics = 0;
    let completedTopics = 0;
    skills.forEach(skill => {
      totalTopics += skill.topics.length;
      completedTopics += skill.topics.filter(t => t.completed).length;
    });
    const technicalCompletion = totalTopics > 0 
      ? Math.round((completedTopics / totalTopics) * 100) 
      : 0;

    // Resume stats
    let resume = await Resume.findOne({ userId: req.userId });
    let resumeCompletion = 0;
    if (resume) {
      const completedSections = resume.sections.filter(s => s.status === 'completed').length;
      resumeCompletion = resume.sections.length > 0 
        ? Math.round((completedSections / resume.sections.length) * 100) 
        : 0;
    }

    // Interview stats
    const interviews = await MockInterview.find({ userId: req.userId });
    const averageRating = interviews.length > 0
      ? (interviews.reduce((sum, i) => sum + i.rating, 0) / interviews.length).toFixed(1)
      : 0;

    // Overall progress (weighted average)
    const overallProgress = Math.round(
      (aptitudeAccuracy * 0.25) + 
      (technicalCompletion * 0.35) + 
      (resumeCompletion * 0.2) + 
      ((parseFloat(averageRating) / 5) * 100 * 0.2)
    );

    // Recent activity
    const recentAptitude = await AptitudeSession.find({ userId: req.userId })
      .sort({ date: -1 }).limit(3);
    const recentInterviews = await MockInterview.find({ userId: req.userId })
      .sort({ date: -1 }).limit(3);

    res.json({
      overview: {
        overallProgress,
        aptitude: {
          sessions: aptitudeSessions.length,
          questions: totalQuestions,
          accuracy: aptitudeAccuracy
        },
        technical: {
          subjects: skills.length,
          totalTopics,
          completedTopics,
          completion: technicalCompletion
        },
        resume: {
          sections: resume ? resume.sections.length : 0,
          completion: resumeCompletion
        },
        interviews: {
          total: interviews.length,
          averageRating: parseFloat(averageRating)
        }
      },
      recentActivity: {
        aptitude: recentAptitude,
        interviews: recentInterviews
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
