const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});

const technicalSkillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  topics: [topicSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for completion percentage
technicalSkillSchema.virtual('completionPercentage').get(function() {
  if (this.topics.length === 0) return 0;
  const completed = this.topics.filter(t => t.completed).length;
  return Math.round((completed / this.topics.length) * 100);
});

technicalSkillSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TechnicalSkill', technicalSkillSchema);
