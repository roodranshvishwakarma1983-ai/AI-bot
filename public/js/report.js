const token = localStorage.getItem('token');
const sessionId = localStorage.getItem('sessionId');
if (!token || !sessionId) window.location.href = '/dashboard.html';

function fillList(id, items = []) {
  const ul = document.getElementById(id);
  ul.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
}

async function loadReport() {
  const res = await fetch(`/api/interview/report/${sessionId}`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();

  if (!data.success) return;

  document.getElementById('finalScore').textContent = `${data.report.summary.totalScore}/100`;
  fillList('strengths', data.report.summary.strengths);
  fillList('weaknesses', data.report.summary.weaknesses);
  fillList('suggestions', data.report.summary.suggestions);
}

document.getElementById('backInterviewBtn').addEventListener('click', () => (window.location.href = '/interview.html'));
loadReport();
