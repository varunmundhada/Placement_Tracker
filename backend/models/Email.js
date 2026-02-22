const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gmailId: {
    type: String,
    required: true
  },
  threadId: {
    type: String
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String
  },
  subject: {
    type: String,
    required: true
  },
  snippet: {
    type: String
  },
  body: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  labels: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['application', 'interview', 'offer', 'rejection', 'assessment', 'other'],
    default: 'other'
  },
  company: {
    type: String
  },
  starred: {
    type: Boolean,
    default: false
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for unique emails per user
emailSchema.index({ userId: 1, gmailId: 1 }, { unique: true });

module.exports = mongoose.model('Email', emailSchema);
