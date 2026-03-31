const token = localStorage.getItem('token');
if (!token) window.location.href = '/';

const uploadBtn = document.getElementById('uploadBtn');
const resumeInput = document.getElementById('resumeInput');
const uploadMessage = document.getElementById('uploadMessage');
const loading = document.getElementById('loading');
const resumePreview = document.getElementById('resumePreview');

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '/';
});

async function loadLatestResume() {
  const res = await fetch('/api/resume/latest', { headers: { Authorization: `Bearer ${token}` } });
  if (res.ok) {
    const data = await res.json();
    resumePreview.textContent = `File: ${data.resume.fileName}\n\nSkills: ${data.resume.skills.join(', ') || 'Not detected'}\n\n${data.resume.preview}`;
  }
}
loadLatestResume();

uploadBtn.addEventListener('click', async () => {
  const file = resumeInput.files[0];
  if (!file) {
    uploadMessage.textContent = 'Please choose a file first.';
    uploadMessage.style.color = '#fca5a5';
    return;
  }

  const formData = new FormData();
  formData.append('resume', file);

  loading.classList.remove('hidden');
  const res = await fetch('/api/resume/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const data = await res.json();
  loading.classList.add('hidden');

  if (!data.success) {
    uploadMessage.style.color = '#fca5a5';
    uploadMessage.textContent = data.message;
    return;
  }

  uploadMessage.style.color = '#86efac';
  uploadMessage.textContent = data.message;
  resumePreview.textContent = `File: ${data.resume.fileName}\n\nSkills: ${data.resume.skills.join(', ') || 'Not detected'}\n\n${data.resume.preview}`;
});

function startInterview(mode) {
  localStorage.setItem('interviewMode', mode);
  window.location.href = '/interview.html';
}

document.getElementById('testModeBtn').addEventListener('click', () => startInterview('test'));
document.getElementById('liveModeBtn').addEventListener('click', () => startInterview('live'));
