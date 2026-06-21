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

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const setMobileMenu = open => {
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} menu`);
  mobileMenu.setAttribute('aria-hidden', String(!open));
};
menuToggle.addEventListener('click', () => setMobileMenu(!document.body.classList.contains('menu-open')));
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMobileMenu(false)));

const commandDialog = document.querySelector('.command-palette');
const commandTrigger = document.querySelector('.command-trigger');
const commandInput = commandDialog.querySelector('input');
const commandLinks = [...commandDialog.querySelectorAll('[data-command]')];
const openCommands = () => {
  if (!commandDialog.open) commandDialog.showModal();
  commandInput.value = '';
  commandLinks.forEach(link => { link.hidden = false; });
  requestAnimationFrame(() => commandInput.focus());
};
const closeCommands = () => { if (commandDialog.open) commandDialog.close(); };
commandTrigger.addEventListener('click', openCommands);
commandDialog.querySelector('.command-close').addEventListener('click', closeCommands);
commandDialog.addEventListener('click', event => { if (event.target === commandDialog) closeCommands(); });
commandLinks.forEach(link => link.addEventListener('click', closeCommands));
commandInput.addEventListener('input', () => {
  const query = commandInput.value.trim().toLowerCase();
  commandLinks.forEach(link => { link.hidden = !link.textContent.toLowerCase().includes(query); });
});
commandDialog.addEventListener('keydown', event => {
  if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
  event.preventDefault();
  const visibleLinks = commandLinks.filter(link => !link.hidden);
  if (!visibleLinks.length) return;
  const activeIndex = visibleLinks.indexOf(document.activeElement);
  const direction = event.key === 'ArrowDown' ? 1 : -1;
  const nextIndex = activeIndex === -1
    ? (direction === 1 ? 0 : visibleLinks.length - 1)
    : (activeIndex + direction + visibleLinks.length) % visibleLinks.length;
  visibleLinks[nextIndex].focus();
});

document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openCommands();
  }
  if (event.key === 'Escape') setMobileMenu(false);
});

const backTop = document.querySelector('.back-top');
backTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelectorAll('button, .button, .social-links a').forEach(element => {
  element.addEventListener('pointerdown', event => {
    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('i');
    ripple.className = 'click-ripple';
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    element.append(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  });
});
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll('section').forEach(section => {
  section.querySelectorAll('.reveal').forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 75}ms`);
  });
});
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
requestAnimationFrame(() => document.body.classList.add('page-ready'));
const mark = document.querySelector('.hero-mark');
const ambientOrb = document.querySelector('.ambient-orb');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress');

const navSections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const activeSectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${entry.target.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });
navSections.forEach(section => activeSectionObserver.observe(section));

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

let heroSpeedFrame = 0;
const setHeroOrbitSpeed = (targetSpeed, duration = 420) => {
  cancelAnimationFrame(heroSpeedFrame);
  const startingSpeeds = heroOrbitAnimations.map(animation => animation.playbackRate || 1);
  const startedAt = performance.now();

  const ease = value => 1 - Math.pow(1 - value, 3);
  const updateSpeed = now => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const easedProgress = ease(progress);
    heroOrbitAnimations.forEach((animation, index) => {
      animation.playbackRate = startingSpeeds[index] + (targetSpeed - startingSpeeds[index]) * easedProgress;
    });
    if (progress < 1) heroSpeedFrame = requestAnimationFrame(updateSpeed);
  };

  heroSpeedFrame = requestAnimationFrame(updateSpeed);
};

const pressHeroPlanet = () => {
  if (!mark || mark.classList.contains('planet-pressed')) return;
  mark.classList.add('planet-pressed');
  setHeroOrbitSpeed(4.25, 480);
  if ('vibrate' in navigator) navigator.vibrate([30, 20, 30]);
};

const releaseHeroPlanet = () => {
  if (!mark?.classList.contains('planet-pressed')) return;
  mark.classList.remove('planet-pressed');
  setHeroOrbitSpeed(1, 620);
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
  backTop.classList.toggle('visible', scrollY > innerHeight * .75);
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
  let pointerFrame = 0;
  addEventListener('pointermove', e => {
    pointerTarget.x = e.clientX;
    pointerTarget.y = e.clientY;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(renderPointer);
  });

  const renderPointer = () => {
    pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * .11;
    pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * .11;
    mark.style.translate = `${(pointerCurrent.x / innerWidth - .5) * 8}px ${(pointerCurrent.y / innerHeight - .5) * 8}px`;
    document.documentElement.style.setProperty('--cursor-x', `${pointerCurrent.x}px`);
    document.documentElement.style.setProperty('--cursor-y', `${pointerCurrent.y}px`);
    const stillMoving = Math.abs(pointerTarget.x - pointerCurrent.x) > .2 || Math.abs(pointerTarget.y - pointerCurrent.y) > .2;
    pointerFrame = stillMoving ? requestAnimationFrame(renderPointer) : 0;
  };

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
  let orbUsesViewport = false;
  const orbPadding = 38;

  const keepOrbInsideSafeArea = () => {
    const rect = ambientOrb.getBoundingClientRect();
    const viewportOffset = orbUsesViewport ? 0 : scrollY;
    const minX = orbPadding;
    const minY = viewportOffset + header.offsetHeight + orbPadding;
    const maxX = (orbUsesViewport ? innerWidth : document.documentElement.scrollWidth) - ambientOrb.offsetWidth - orbPadding;
    const maxY = (orbUsesViewport ? innerHeight : document.documentElement.scrollHeight) - ambientOrb.offsetHeight - orbPadding;
    const currentX = rect.left + (orbUsesViewport ? 0 : scrollX);
    const currentY = rect.top + viewportOffset;
    ambientOrb.style.left = `${Math.min(maxX, Math.max(minX, currentX))}px`;
    ambientOrb.style.top = `${Math.min(maxY, Math.max(minY, currentY))}px`;
    ambientOrb.style.right = 'auto';
    ambientOrb.style.bottom = 'auto';
  };

  ambientOrb.addEventListener('pointerdown', event => {
    const rect = ambientOrb.getBoundingClientRect();
    orbUsesViewport = getComputedStyle(ambientOrb).position === 'fixed';
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    ambientOrb.style.left = `${rect.left + (orbUsesViewport ? 0 : scrollX)}px`;
    ambientOrb.style.top = `${rect.top + (orbUsesViewport ? 0 : scrollY)}px`;
    ambientOrb.style.right = 'auto';
    ambientOrb.style.bottom = 'auto';
    ambientOrb.classList.add('dragging');
    setRingSpeed(5.5);
    if ('vibrate' in navigator) navigator.vibrate([30, 20, 30]);
    ambientOrb.setPointerCapture(event.pointerId);
  });

  ambientOrb.addEventListener('pointermove', event => {
    if (!ambientOrb.classList.contains('dragging')) return;
    const minX = orbPadding;
    const minY = (orbUsesViewport ? 0 : scrollY) + header.offsetHeight + orbPadding;
    const maxX = (orbUsesViewport ? innerWidth : document.documentElement.scrollWidth) - ambientOrb.offsetWidth - orbPadding;
    const maxY = (orbUsesViewport ? innerHeight : document.documentElement.scrollHeight) - ambientOrb.offsetHeight - orbPadding;
    const targetX = event.clientX + (orbUsesViewport ? 0 : scrollX) - dragOffsetX;
    const targetY = event.clientY + (orbUsesViewport ? 0 : scrollY) - dragOffsetY;
    ambientOrb.style.left = `${Math.min(maxX, Math.max(minX, targetX))}px`;
    ambientOrb.style.top = `${Math.min(maxY, Math.max(minY, targetY))}px`;
  });

  const stopDragging = event => {
    if (!ambientOrb.classList.contains('dragging')) return;
    ambientOrb.classList.remove('dragging');
    setRingSpeed(1);
    if ('vibrate' in navigator) navigator.vibrate(0);
    keepOrbInsideSafeArea();
    if (ambientOrb.hasPointerCapture(event.pointerId)) ambientOrb.releasePointerCapture(event.pointerId);
  };
  ambientOrb.addEventListener('pointerup', stopDragging);
  ambientOrb.addEventListener('pointercancel', stopDragging);
  addEventListener('resize', () => {
    orbUsesViewport = getComputedStyle(ambientOrb).position === 'fixed';
    keepOrbInsideSafeArea();
  }, { passive: true });
}
