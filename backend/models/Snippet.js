const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sourceCode: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'ebpl'
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'anonymous'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Snippet', snippetSchema);