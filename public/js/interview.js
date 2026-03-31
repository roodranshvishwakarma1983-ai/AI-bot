const token = localStorage.getItem('token');
const mode = localStorage.getItem('interviewMode') || 'test';
if (!token) window.location.href = '/';

const modeTitle = document.getElementById('modeTitle');
const chatBox = document.getElementById('chatBox');
const answerInput = document.getElementById('answerInput');
const submitAnswerBtn = document.getElementById('submitAnswerBtn');
const micBtn = document.getElementById('micBtn');
const wave = document.getElementById('wave');

modeTitle.textContent = mode === 'live' ? 'Live Mode (Voice Interview)' : 'Test Mode (Text Interview)';
if (mode === 'live') micBtn.classList.remove('hidden');

let questions = [];
let currentIndex = 0;
let sessionId = null;

function addBubble(text, type = 'ai') {
  const div = document.createElement('div');
  div.className = `bubble ${type}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function startSession() {
  addBubble('Initializing your interview... Please wait.', 'ai');
  const res = await fetch('/api/interview/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mode })
  });
  const data = await res.json();

  if (!data.success) {
    addBubble(data.message, 'feedback');
    return;
  }

  sessionId = data.sessionId;
  localStorage.setItem('sessionId', sessionId);
  questions = data.questions;
  askCurrentQuestion();
}

function askCurrentQuestion() {
  if (currentIndex >= questions.length) {
    addBubble('Interview completed! Click "View Report" to see detailed analysis.', 'feedback');
    return;
  }

  const question = questions[currentIndex];
  addBubble(`Q${currentIndex + 1}: ${question}`, 'ai');
  if (mode === 'live' && 'speechSynthesis' in window) {
    speechSynthesis.speak(new SpeechSynthesisUtterance(question));
  }
}

async function submitAnswer() {
  const answer = answerInput.value.trim();
  if (!answer || currentIndex >= questions.length) return;

  const question = questions[currentIndex];
  addBubble(answer, 'user');
  answerInput.value = '';

  const res = await fetch('/api/interview/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ sessionId, question, answer })
  });
  const data = await res.json();

  if (data.success) {
    const f = data.feedback;
    addBubble(`Feedback: Score ${f.score}/100 | Confidence: ${f.confidence} | ${f.tips}`, 'feedback');
  } else {
    addBubble(data.message, 'feedback');
  }

  currentIndex += 1;
  askCurrentQuestion();
}

submitAnswerBtn.addEventListener('click', submitAnswer);

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  micBtn.addEventListener('click', () => {
    wave.classList.remove('hidden');
    recognition.start();
  });

  recognition.onresult = (event) => {
    answerInput.value = event.results[0][0].transcript;
    wave.classList.add('hidden');
  };

  recognition.onerror = () => wave.classList.add('hidden');
  recognition.onend = () => wave.classList.add('hidden');
}

document.getElementById('backBtn').addEventListener('click', () => (window.location.href = '/dashboard.html'));
document.getElementById('viewReportBtn').addEventListener('click', () => (window.location.href = '/report.html'));

startSession();
