const express = require('express');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const InterviewSession = require('../models/InterviewSession');
const { generateQuestionsFromResume, evaluateAnswer } = require('../services/aiService');

const router = express.Router();

router.post('/start', auth, async (req, res) => {
  try {
    const { mode } = req.body;
    if (!['test', 'live'].includes(mode)) {
      return res.status(400).json({ success: false, message: 'Mode must be test or live.' });
    }

    const resume = await Resume.findOne({ user: req.user.userId }).sort({ createdAt: -1 });
    if (!resume) return res.status(404).json({ success: false, message: 'Upload resume before starting interview.' });

    const resumeSummary = {
      skills: resume.skills,
      education: resume.education,
      projects: resume.projects,
      profileSnippet: resume.extractedText.slice(0, 1500)
    };

    const questions = await generateQuestionsFromResume(resumeSummary);

    const session = await InterviewSession.create({
      user: req.user.userId,
      resume: resume._id,
      mode,
      questions,
      responses: []
    });

    return res.json({ success: true, sessionId: session._id, questions });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not start interview.', error: error.message });
  }
});

router.post('/answer', auth, async (req, res) => {
  try {
    const { sessionId, question, answer } = req.body;
    const session = await InterviewSession.findOne({ _id: sessionId, user: req.user.userId });
    if (!session) return res.status(404).json({ success: false, message: 'Interview session not found.' });

    const feedback = await evaluateAnswer(question, answer);

    session.responses.push({ question, answer, feedback });

    const scores = session.responses.map((item) => item.feedback.score || 0);
    const average = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    session.summary.totalScore = average;
    session.summary.strengths = ['Communication clarity', 'Technical relevance'].slice(0, average > 75 ? 2 : 1);
    session.summary.weaknesses = average >= 75 ? ['Add stronger metrics in examples'] : ['Need structured STAR-style responses'];
    session.summary.suggestions = [
      'Use concise and impact-driven answers.',
      'Practice one project story with measurable results.'
    ];

    await session.save();

    return res.json({ success: true, feedback, runningScore: average });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not evaluate answer.', error: error.message });
  }
});

router.get('/report/:sessionId', auth, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.sessionId, user: req.user.userId });
    if (!session) return res.status(404).json({ success: false, message: 'Report not found.' });

    return res.json({ success: true, report: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not fetch report.', error: error.message });
  }
});

module.exports = router;
