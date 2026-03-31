const landing = document.getElementById('landing');
const authSection = document.getElementById('authSection');

// -------- Three.js lightweight "man with bag" animation --------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('threeCanvas'), alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 4, 3);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const man = new THREE.Group();
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
const bagMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12 });

const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.35), bodyMat);
body.position.y = 1.1;
const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), new THREE.MeshStandardMaterial({ color: 0xfaccb4 }));
head.position.y = 1.95;
const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), bodyMat);
const leg2 = leg1.clone();
leg1.position.set(-0.18, 0.35, 0);
leg2.position.set(0.18, 0.35, 0);
const bag = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.5, 0.22), bagMat);
bag.position.set(0.55, 1.05, 0);

man.add(body, head, leg1, leg2, bag);
man.position.x = -3.4;
scene.add(man);

camera.position.z = 5;
let tick = 0;
let bagPlaced = false;

function animate() {
  requestAnimationFrame(animate);
  tick += 0.03;

  if (man.position.x < 0) {
    man.position.x += 0.03;
    leg1.rotation.x = Math.sin(tick * 8) * 0.4;
    leg2.rotation.x = -Math.sin(tick * 8) * 0.4;
  } else if (!bagPlaced) {
    bag.position.set(0.85, 0.25, 0.2);
    bagPlaced = true;

    setTimeout(() => {
      landing.classList.add('hidden');
      authSection.classList.remove('hidden');
    }, 800);
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// -------- Auth flow --------
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authSubmit = document.getElementById('authSubmit');
const toggleAuth = document.getElementById('toggleAuth');
const nameInput = document.getElementById('name');
const authMessage = document.getElementById('authMessage');

let isLogin = true;

toggleAuth.addEventListener('click', () => {
  isLogin = !isLogin;
  authTitle.textContent = isLogin ? 'Welcome Back' : 'Create Account';
  authSubmit.textContent = isLogin ? 'Login' : 'Register';
  toggleAuth.textContent = isLogin ? 'Register' : 'Login';
  nameInput.classList.toggle('hidden', isLogin);
  authMessage.textContent = '';
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  };

  if (!isLogin) payload.name = nameInput.value;

  const route = isLogin ? '/api/auth/login' : '/api/auth/register';

  const res = await fetch(route, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();

  if (!data.success) {
    authMessage.style.color = '#fca5a5';
    authMessage.textContent = data.message;
    return;
  }

  if (isLogin) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/dashboard.html';
  } else {
    authMessage.style.color = '#86efac';
    authMessage.textContent = 'Registration successful. Please login now.';
    toggleAuth.click();
  }
});
