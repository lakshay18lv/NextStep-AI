const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    score: { type: Number, required: true, min: 0, max: 100 },
    feedback: { type: String, required: true, trim: true },
    domain: { type: String, required: true, trim: true },
    difficulty: { type: String, required: true, trim: true },
    questions: [{ type: String, required: true }],
    answers: [{ type: String, required: true }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
