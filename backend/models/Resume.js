const mongoose = require('mongoose');

const resumeSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  sections: [resumeSectionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for completion percentage
resumeSchema.virtual('completionPercentage').get(function() {
  if (this.sections.length === 0) return 0;
  const completed = this.sections.filter(s => s.status === 'completed').length;
  return Math.round((completed / this.sections.length) * 100);
});

resumeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Resume', resumeSchema);
