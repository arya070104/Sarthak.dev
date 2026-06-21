import './style.css';
import './overrides.css';
document.querySelector('#year').textContent = new Date().getFullYear();
const toolbox = document.querySelector('.toolbox');
const originalTicker = document.querySelector('.ticker');
toolbox.classList.add('hero-toolbox');
originalTicker.replaceWith(toolbox);
const themeToggle = document.querySelector('.theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const setTheme = theme => {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  themeColor.setAttribute('content', dark ? '#261c17' : '#f2f0e9');
};
setTheme(document.documentElement.dataset.theme);
themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', nextTheme);
  setTheme(nextTheme);
});
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach((el, i) => { if (i < 6) el.style.transitionDelay = `${i * 65}ms`; observer.observe(el); });
const mark = document.querySelector('.hero-mark');
const ambientOrb = document.querySelector('.ambient-orb');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress');

// Persistent timelines keep their exact angle while playback speed changes.
const ringAnimations = [];
if (ambientOrb && !reducedMotion) {
  const ringAAnimation = ambientOrb.querySelector('.ring-a')?.animate([
    { transform: 'translate(-50%, -50%) rotateX(62deg) rotateZ(0deg)' },
    { transform: 'translate(-50%, -50%) rotateX(62deg) rotateZ(360deg)' },
  ], { duration: 11000, iterations: Infinity, easing: 'linear' });

  const ringBAnimation = ambientOrb.querySelector('.ring-b')?.animate([
    { transform: 'translate(-50%, -50%) rotateY(64deg) rotateZ(380deg)' },
    { transform: 'translate(-50%, -50%) rotateY(64deg) rotateZ(20deg)' },
  ], { duration: 15000, iterations: Infinity, easing: 'linear' });

  if (ringAAnimation) ringAnimations.push(ringAAnimation);
  if (ringBAnimation) ringAnimations.push(ringBAnimation);
}

const setRingSpeed = speed => ringAnimations.forEach(animation => {
  if (animation.updatePlaybackRate) animation.updatePlaybackRate(speed);
  else animation.playbackRate = speed;
});

const heroOrbitAnimations = [];
if (mark && !reducedMotion) {
  const firstOrbit = mark.querySelector('.orbit.one')?.animate([
    { transform: 'rotate(42deg)' },
    { transform: 'rotate(402deg)' },
  ], { duration: 14000, iterations: Infinity, easing: 'linear' });

  const secondOrbit = mark.querySelector('.orbit.two')?.animate([
    { transform: 'rotate(-32deg)' },
    { transform: 'rotate(-392deg)' },
  ], { duration: 18000, iterations: Infinity, easing: 'linear' });

  if (firstOrbit) heroOrbitAnimations.push(firstOrbit);
  if (secondOrbit) heroOrbitAnimations.push(secondOrbit);
}

const setHeroOrbitSpeed = speed => heroOrbitAnimations.forEach(animation => {
  if (animation.updatePlaybackRate) animation.updatePlaybackRate(speed);
  else animation.playbackRate = speed;
});

const pressHeroPlanet = () => {
  if (!mark || mark.classList.contains('planet-pressed')) return;
  mark.classList.add('planet-pressed');
  setHeroOrbitSpeed(5.5);
  if ('vibrate' in navigator) navigator.vibrate([30, 20, 30]);
};

const releaseHeroPlanet = () => {
  if (!mark?.classList.contains('planet-pressed')) return;
  mark.classList.remove('planet-pressed');
  setHeroOrbitSpeed(1);
  if ('vibrate' in navigator) navigator.vibrate(0);
};

if (mark) {
  mark.addEventListener('pointerdown', event => {
    pressHeroPlanet();
    mark.setPointerCapture(event.pointerId);
  });
  mark.addEventListener('pointerup', releaseHeroPlanet);
  mark.addEventListener('pointercancel', releaseHeroPlanet);
  mark.addEventListener('keydown', event => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      pressHeroPlanet();
    }
  });
  mark.addEventListener('keyup', event => {
    if (event.key === ' ' || event.key === 'Enter') releaseHeroPlanet();
  });
  mark.addEventListener('blur', releaseHeroPlanet);
}

const updateScrollUI = () => {
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${maxScroll > 0 ? scrollY / maxScroll : 0})`;
  header.classList.toggle('scrolled', scrollY > 24);
};
let scrollFrameRequested = false;
addEventListener('scroll', () => {
  if (scrollFrameRequested) return;
  scrollFrameRequested = true;
  requestAnimationFrame(() => {
    updateScrollUI();
    scrollFrameRequested = false;
  });
}, { passive: true });
updateScrollUI();

if (!reducedMotion && finePointer) {
  const pointerTarget = { x: innerWidth / 2, y: innerHeight / 2 };
  const pointerCurrent = { ...pointerTarget };
  addEventListener('pointermove', e => {
    pointerTarget.x = e.clientX;
    pointerTarget.y = e.clientY;
  });

  const renderPointer = () => {
    pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * .11;
    pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * .11;
    mark.style.translate = `${(pointerCurrent.x / innerWidth - .5) * 8}px ${(pointerCurrent.y / innerHeight - .5) * 8}px`;
    document.documentElement.style.setProperty('--cursor-x', `${pointerCurrent.x}px`);
    document.documentElement.style.setProperty('--cursor-y', `${pointerCurrent.y}px`);
    requestAnimationFrame(renderPointer);
  };
  requestAnimationFrame(renderPointer);

  document.querySelectorAll('.project-card, .featured').forEach(card => {
    card.classList.add('interactive-card');
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty('--pointer-x', `${x}px`);
      card.style.setProperty('--pointer-y', `${y}px`);
      card.style.transform = `perspective(1100px) rotateX(${(.5 - y / rect.height) * 3}deg) rotateY(${(x / rect.width - .5) * 3}deg) translateY(-3px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

if (ambientOrb) {
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  ambientOrb.addEventListener('pointerdown', event => {
    const rect = ambientOrb.getBoundingClientRect();
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    ambientOrb.style.left = `${rect.left}px`;
    ambientOrb.style.top = `${rect.top}px`;
    ambientOrb.style.right = 'auto';
    ambientOrb.style.bottom = 'auto';
    ambientOrb.classList.add('dragging');
    setRingSpeed(5.5);
    if ('vibrate' in navigator) navigator.vibrate([30, 20, 30]);
    ambientOrb.setPointerCapture(event.pointerId);
  });

  ambientOrb.addEventListener('pointermove', event => {
    if (!ambientOrb.classList.contains('dragging')) return;
    const maxX = innerWidth - ambientOrb.offsetWidth - 10;
    const maxY = innerHeight - ambientOrb.offsetHeight - 10;
    ambientOrb.style.left = `${Math.min(maxX, Math.max(10, event.clientX - dragOffsetX))}px`;
    ambientOrb.style.top = `${Math.min(maxY, Math.max(10, event.clientY - dragOffsetY))}px`;
  });

  const stopDragging = event => {
    if (!ambientOrb.classList.contains('dragging')) return;
    ambientOrb.classList.remove('dragging');
    setRingSpeed(1);
    if ('vibrate' in navigator) navigator.vibrate(0);
    if (ambientOrb.hasPointerCapture(event.pointerId)) ambientOrb.releasePointerCapture(event.pointerId);
  };
  ambientOrb.addEventListener('pointerup', stopDragging);
  ambientOrb.addEventListener('pointercancel', stopDragging);
}
