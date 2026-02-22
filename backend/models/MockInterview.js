const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['technical', 'hr', 'behavioral', 'system-design', 'coding'],
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  feedback: {
    type: String,
    trim: true
  },
  strengths: {
    type: String,
    trim: true
  },
  improvements: {
    type: String,
    trim: true
  },
  interviewer: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
