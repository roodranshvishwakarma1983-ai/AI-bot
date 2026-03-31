const mongoose = require('mongoose');

const qaSchema = new mongoose.Schema(
  {
    question: String,
    answer: String,
    feedback: {
      score: Number,
      confidence: String,
      correctness: String,
      tips: String
    }
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    mode: { type: String, enum: ['test', 'live'], required: true },
    questions: { type: [String], default: [] },
    responses: { type: [qaSchema], default: [] },
    summary: {
      totalScore: { type: Number, default: 0 },
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      suggestions: { type: [String], default: [] }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
