const OpenAI = require('openai');

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

function fallbackQuestions(resumeSummary) {
  const skill = resumeSummary.skills[0] || 'your strongest technical skill';
  const project = resumeSummary.projects[0] || 'your most impactful project';

  return [
    `Tell me about yourself and why you are interested in this role.`,
    `You mentioned ${skill}. Explain one real-world challenge you solved using it.`,
    `Walk me through ${project} and your exact contribution.`,
    `Describe a situation where you handled deadline pressure in a team.`,
    `What are your strengths and one weakness you are actively improving?`
  ];
}

async function generateQuestionsFromResume(resumeSummary) {
  if (!client) return fallbackQuestions(resumeSummary);

  const prompt = `Create 6 interview questions from this resume summary. Return ONLY JSON array of strings.\n${JSON.stringify(
    resumeSummary
  )}`;

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: prompt,
      temperature: 0.7
    });

    const text = response.output_text || '[]';
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length) return parsed;
    return fallbackQuestions(resumeSummary);
  } catch (error) {
    return fallbackQuestions(resumeSummary);
  }
}

async function evaluateAnswer(question, answer) {
  if (!client) {
    const score = Math.max(55, Math.min(95, Math.floor((answer.length / 12) * 10)));
    return {
      score,
      confidence: score > 75 ? 'Good' : 'Average',
      correctness: score > 70 ? 'Mostly correct and relevant.' : 'Needs more depth and structure.',
      tips: 'Use STAR format and add measurable outcomes.'
    };
  }

  const prompt = `Evaluate interview answer. Return ONLY JSON object with keys: score (0-100), confidence, correctness, tips.\nQuestion: ${question}\nAnswer: ${answer}`;

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      input: prompt,
      temperature: 0.2
    });

    const parsed = JSON.parse(response.output_text || '{}');
    return {
      score: Number(parsed.score) || 70,
      confidence: parsed.confidence || 'Average',
      correctness: parsed.correctness || 'Reasonably relevant answer.',
      tips: parsed.tips || 'Add specifics and practical examples.'
    };
  } catch (error) {
    return {
      score: 68,
      confidence: 'Average',
      correctness: 'Partially correct answer.',
      tips: 'Focus on clarity, structure, and concise examples.'
    };
  }
}

module.exports = { generateQuestionsFromResume, evaluateAnswer };
