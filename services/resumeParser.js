const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const SKILL_KEYWORDS = [
  'javascript', 'typescript', 'react', 'node.js', 'node', 'express', 'mongodb', 'sql',
  'python', 'java', 'c++', 'machine learning', 'deep learning', 'tensorflow', 'pytorch',
  'aws', 'docker', 'kubernetes', 'html', 'css', 'next.js', 'git', 'data structures', 'algorithms'
];

function extractSectionLines(text, starters) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const output = [];
  let active = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    const isStarter = starters.some((item) => lower.includes(item));

    if (isStarter) {
      active = true;
      continue;
    }

    if (active && /^(experience|skills|projects|education|certification|summary)$/i.test(line)) {
      active = false;
    }

    if (active) output.push(line);
  }

  return output.slice(0, 8);
}

async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  }

  throw new Error('Unsupported file type. Please upload PDF or DOCX.');
}

function analyzeResumeText(text) {
  const lower = text.toLowerCase();

  const skills = SKILL_KEYWORDS.filter((skill) => lower.includes(skill));
  const education = extractSectionLines(text, ['education', 'academic']);
  const projects = extractSectionLines(text, ['project', 'projects']);

  return {
    skills: [...new Set(skills)],
    education,
    projects
  };
}

module.exports = { extractTextFromFile, analyzeResumeText };
