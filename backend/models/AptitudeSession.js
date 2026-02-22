const mongoose = require('mongoose');

const aptitudeSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  questionsSolved: {
    type: Number,
    required: true,
    min: 0
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  timeSpent: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
});

// Virtual for accuracy percentage
aptitudeSessionSchema.virtual('accuracy').get(function() {
  if (this.questionsSolved === 0) return 0;
  return Math.round((this.correctAnswers / this.questionsSolved) * 100);
});

aptitudeSessionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('AptitudeSession', aptitudeSessionSchema);
