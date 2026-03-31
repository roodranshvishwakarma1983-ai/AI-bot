const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const { extractTextFromFile, analyzeResumeText } = require('../services/resumeParser');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Only PDF and DOCX files are allowed.'));
    cb(null, true);
  }
});

router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a resume file.' });

    const extractedText = await extractTextFromFile(req.file.path);
    const analysis = analyzeResumeText(extractedText);

    const resume = await Resume.create({
      user: req.user.userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      extractedText,
      skills: analysis.skills,
      education: analysis.education,
      projects: analysis.projects
    });

    return res.json({
      success: true,
      message: 'Resume uploaded and analyzed successfully.',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        skills: resume.skills,
        education: resume.education,
        projects: resume.projects,
        preview: extractedText.slice(0, 800)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Resume upload failed.', error: error.message });
  }
});

router.get('/latest', auth, async (req, res) => {
  const resume = await Resume.findOne({ user: req.user.userId }).sort({ createdAt: -1 });
  if (!resume) return res.status(404).json({ success: false, message: 'No resume uploaded yet.' });

  return res.json({
    success: true,
    resume: {
      id: resume._id,
      fileName: resume.fileName,
      skills: resume.skills,
      education: resume.education,
      projects: resume.projects,
      preview: resume.extractedText.slice(0, 800)
    }
  });
});

module.exports = router;
