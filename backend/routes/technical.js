const express = require('express');
const TechnicalSkill = require('../models/TechnicalSkill');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all subjects
router.get('/', auth, async (req, res) => {
  try {
    const skills = await TechnicalSkill.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
router.get('/stats', auth, async (req, res) => {
  try {
    const skills = await TechnicalSkill.find({ userId: req.userId });
    
    let totalTopics = 0;
    let completedTopics = 0;
    
    skills.forEach(skill => {
      totalTopics += skill.topics.length;
      completedTopics += skill.topics.filter(t => t.completed).length;
    });

    const overallCompletion = totalTopics > 0 
      ? Math.round((completedTopics / totalTopics) * 100) 
      : 0;

    res.json({
      totalSubjects: skills.length,
      totalTopics,
      completedTopics,
      overallCompletion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new subject
router.post('/', auth, async (req, res) => {
  try {
    const skill = new TechnicalSkill({
      ...req.body,
      userId: req.userId
    });
    await skill.save();
    res.status(201).json(skill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add topic to subject
router.post('/:id/topics', auth, async (req, res) => {
  try {
    const skill = await TechnicalSkill.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!skill) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    skill.topics.push(req.body);
    await skill.save();
    res.json(skill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle topic completion
router.patch('/:id/topics/:topicId', auth, async (req, res) => {
  try {
    const skill = await TechnicalSkill.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!skill) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    const topic = skill.topics.id(req.params.topicId);
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    topic.completed = !topic.completed;
    topic.completedAt = topic.completed ? new Date() : null;
    await skill.save();
    res.json(skill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete topic
router.delete('/:id/topics/:topicId', auth, async (req, res) => {
  try {
    const skill = await TechnicalSkill.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!skill) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    
    skill.topics = skill.topics.filter(t => t._id.toString() !== req.params.topicId);
    await skill.save();
    res.json(skill);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete subject
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await TechnicalSkill.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!skill) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json({ message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
