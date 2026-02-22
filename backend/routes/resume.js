const express = require('express');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');

const router = express.Router();

// Default resume sections
const defaultSections = [
  { name: 'Contact Information', status: 'pending' },
  { name: 'Professional Summary', status: 'pending' },
  { name: 'Education', status: 'pending' },
  { name: 'Skills', status: 'pending' },
  { name: 'Projects', status: 'pending' },
  { name: 'Work Experience', status: 'pending' },
  { name: 'Certifications', status: 'pending' },
  { name: 'Achievements', status: 'pending' }
];

// Get resume
router.get('/', auth, async (req, res) => {
  try {
    let resume = await Resume.findOne({ userId: req.userId });
    
    // Create default resume if not exists
    if (!resume) {
      resume = new Resume({
        userId: req.userId,
        sections: defaultSections
      });
      await resume.save();
    }
    
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update section status
router.patch('/sections/:sectionId', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    const section = resume.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    section.status = req.body.status;
    section.notes = req.body.notes || section.notes;
    section.updatedAt = new Date();
    await resume.save();
    res.json(resume);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add custom section
router.post('/sections', auth, async (req, res) => {
  try {
    let resume = await Resume.findOne({ userId: req.userId });
    
    if (!resume) {
      resume = new Resume({
        userId: req.userId,
        sections: defaultSections
      });
    }
    
    resume.sections.push({
      name: req.body.name,
      status: 'pending',
      notes: req.body.notes
    });
    await resume.save();
    res.json(resume);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete section
router.delete('/sections/:sectionId', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.userId });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    resume.sections = resume.sections.filter(
      s => s._id.toString() !== req.params.sectionId
    );
    await resume.save();
    res.json(resume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
