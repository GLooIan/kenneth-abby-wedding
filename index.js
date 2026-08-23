// ================= PARTICLES =================
const canvas = document.getElementById("matchaParticles");
const ctx = canvas.getContext("2d", { alpha: true });

function setCanvasSize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
setCanvasSize();

let particlesArray = [];
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
const particleCount = isTouchDevice ? 28 : 55;

class Particle {
  constructor(randomY = true) {
    this.reset(randomY);
  }

  reset(randomY = true) {
    this.x       = Math.random() * canvas.width;
    this.y       = randomY ? Math.random() * canvas.height : canvas.height + 10;
    this.size    = Math.random() * 2.8 + 0.8;
    this.speedX  = (Math.random() - 0.5) * 0.28;
    this.speedY  = (Math.random() - 0.5) * 0.28;
    this.opacity = Math.random() * 0.38 + 0.08;
    this.color   = this.getRandomColor();
    this.twinkleSpeed  = Math.random() * 0.008 + 0.003;
    this.twinkleOffset = Math.random() * Math.PI * 2;
  }

  getRandomColor() {
    const colors = [
      '201, 154, 75',  // gold
      '169, 113, 74',  // sienna
      '182, 155, 125', // taupe
      '232, 213, 183', // champagne
      '107, 66, 38',   // dark brown
      '255, 250, 242'  // warm white
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update(t) {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < -10) this.x = canvas.width  + 10;
    if (this.x > canvas.width  + 10) this.x = -10;
    if (this.y < -10) this.y = canvas.height + 10;
    if (this.y > canvas.height + 10) this.y = -10;

    this.currentOpacity = this.opacity * (0.7 + 0.3 * Math.sin(t * this.twinkleSpeed + this.twinkleOffset));
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.currentOpacity ?? this.opacity})`;
    ctx.fill();
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < particleCount; i++) {
    particlesArray.push(new Particle(true));
  }
}

let frameCount = 0;
const skipFrames = isTouchDevice ? 1 : 0;

function animateParticles(timestamp) {
  requestAnimationFrame(animateParticles);

  frameCount++;
  if (frameCount % (skipFrames + 1) !== 0) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particlesArray.forEach(p => {
    p.update(timestamp);
    p.draw();
  });
}

initParticles();
requestAnimationFrame(animateParticles);

// ================= RESIZE =================
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    setCanvasSize();
    initParticles();
  }, 150);
});

// ================= FADE IN BACKGROUND =================
window.addEventListener('load', () => {
  const scene = document.querySelector('.flower-scene');
  if (scene) scene.classList.remove('not-loaded');
});

// ================= PREFETCH OPEN PAGE =================
const prefetchLink = document.createElement('link');
prefetchLink.rel  = 'prefetch';
prefetchLink.href = 'open.html';
document.head.appendChild(prefetchLink);

// ================= ENVELOPE PRESS FEEDBACK (mobile) =================
const envelopeLink = document.querySelector('.envelope-link');
if (envelopeLink) {
  envelopeLink.addEventListener('touchstart', () => {
    envelopeLink.classList.add('pressed');
  }, { passive: true });

  ['touchend', 'touchcancel'].forEach(evt => {
    envelopeLink.addEventListener(evt, () => {
      envelopeLink.classList.remove('pressed');
    }, { passive: true });
  });
}

// ================= FALLING PETALS =================
// Drawn as small CSS shapes instead of image files, since no petal
// PNGs are in the project yet. Swap this back to <img> tags if you
// add petal1.png / petal2.png / petal3.png later.
const petalColors = ['#C99A4B', '#E8D5B7', '#A9714A', '#FBF3E7'];

function spawnLeaf() {
  const leaf = document.createElement('span');

  const size     = 5 + Math.random() * 10;
  const startX   = Math.random() * 100;
  const duration = 7 + Math.random() * 6;
  const swayX    = 30 + Math.random() * 40;
  const delay    = Math.random() * 2;
  const color    = petalColors[Math.floor(Math.random() * petalColors.length)];

  leaf.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 1;
    width: ${size}px;
    height: ${size * 0.65}px;
    left: ${startX}vw;
    top: -60px;
    opacity: 0;
    background: ${color};
    border-radius: 50% 0 50% 0;
    filter: blur(${Math.random() * 0.5}px);
    animation: leafFall ${duration}s ${delay}s linear forwards;
    --sway: ${swayX}px;
  `;

  document.body.appendChild(leaf);
  leaf.addEventListener('animationend', () => {
    leaf.remove();
    setTimeout(spawnLeaf, 800 + Math.random() * 1500);
  });
}

const leafCount = 10;
for (let i = 0; i < leafCount; i++) {
  setTimeout(spawnLeaf, i * 800);
}