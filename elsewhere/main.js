const root = document.documentElement;
const sections = [...document.querySelectorAll('.chapter')];
const railLinks = [...document.querySelectorAll('.journey-rail a')];
const topLinks = [...document.querySelectorAll('.top-nav a')];
const dots = [...document.querySelectorAll('.progress-dots span')];
const railFill = document.querySelector('.rail-track span');
const progressFill = document.querySelector('.page-progress span');
const topbar = document.querySelector('.topbar');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const compact = window.matchMedia('(max-width: 720px)').matches;

root.classList.add('js');

async function loadWorldSprite() {
  const base = './public/assets-src/worlds-sprite.avif.part';
  const parts = await Promise.all(['000', '001', '002'].map(async suffix => {
    const response = await fetch(`${base}${suffix}`, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`World asset ${suffix} returned ${response.status}`);
    return (await response.text()).replace(/\s+/g, '');
  }));

  const encoded = parts.join('');
  if (!encoded.startsWith('AAAAIGZ0eXBhdmlm')) throw new Error('World image payload is invalid');
  root.style.setProperty('--world-sprite', `url("data:image/avif;base64,${encoded}")`);
  root.classList.add('sprite-ready');
}

loadWorldSprite().catch(error => {
  console.error('The cinematic image could not load.', error);
  root.classList.add('sprite-fallback');
});

function clamp(value, min = 0, max = 1) { return Math.min(max, Math.max(min, value)); }

function setActive(index) {
  const section = sections[index];
  if (!section) return;
  sections.forEach((item, i) => item.classList.toggle('is-active', i === index));
  railLinks.forEach((link, i) => {
    const active = i === index;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current');
  });
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  topLinks.forEach(link => link.classList.toggle('active', link.hash === `#${section.id}`));
  railFill.style.transform = `scaleY(${index / (sections.length - 1)})`;
  const accent = getComputedStyle(section).getPropertyValue('--accent').trim();
  if (accent) themeMeta?.setAttribute('content', accent);
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) setActive(Number(entry.target.dataset.chapter)); });
}, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
sections.forEach(section => observer.observe(section));

let ticking = false;
function updateParallax() {
  const viewport = window.innerHeight;
  const docMax = Math.max(1, document.documentElement.scrollHeight - viewport);
  progressFill.style.transform = `scaleX(${clamp(window.scrollY / docMax)})`;
  topbar.classList.toggle('scrolled', window.scrollY > 24);

  if (!reduceMotion) {
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom < -viewport * .25 || rect.top > viewport * 1.25) return;
      const progress = clamp((viewport - rect.top) / (viewport + rect.height));
      const centered = progress - .5;
      section.style.setProperty('--image-y', `${centered * (compact ? -42 : -110)}px`);
      section.style.setProperty('--ambient-y', `${centered * (compact ? 24 : 70)}px`);
      section.style.setProperty('--frame-y', `${centered * (compact ? -12 : -34)}px`);
      section.style.setProperty('--copy-y', `${centered * (compact ? 8 : 18)}px`);
    });
  }
  ticking = false;
}

function requestUpdate() {
  if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
}
window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', requestUpdate, { passive: true });
window.addEventListener('load', requestUpdate, { once: true });
requestUpdate();

function makeDust(container, count) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement('span');
    const size = 2 + (i % 3);
    dot.style.left = `${7 + ((i * 47) % 88)}%`;
    dot.style.top = `${5 + ((i * 31) % 90)}%`;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    fragment.appendChild(dot);
  }
  container.appendChild(fragment);
}
if (!reduceMotion) document.querySelectorAll('.dust').forEach((dust, i) => makeDust(dust, compact ? 7 : (i === 3 ? 24 : 15)));

async function loadAnime() {
  try { return await import('https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm'); }
  catch (error) { console.warn('Anime.js CDN unavailable; native parallax remains active.', error); return null; }
}

if (!reduceMotion) {
  loadAnime().then(anime => {
    if (!anime) { root.classList.add('anime-fallback'); return; }
    const { animate, createTimeline, stagger } = anime;
    createTimeline({ defaults: { ease: 'outExpo' } })
      .add('.site-brand', { opacity: [0, 1], y: [-14, 0], duration: 800 })
      .add('.top-nav a, .sound-toggle', { opacity: [0, 1], y: [-10, 0], delay: stagger(70), duration: 650 }, '-=560')
      .add('.chapter-0 .chapter-copy > *', { opacity: [0, 1], y: [28, 0], delay: stagger(85), duration: 900 }, '-=420')
      .add('.chapter-0 .scene-frame', { opacity: [0, 1], scale: [0.95, 1], duration: 1100 }, '-=900');
    animate('.orbit-one', { rotate: '1turn', duration: 28000, frameRate: 30, loop: true, ease: 'linear' });
    animate('.orbit-two', { rotate: '-1turn', duration: 36000, frameRate: 30, loop: true, ease: 'linear' });
    animate('.dust span', { y: [14, -30], opacity: [0.08, 0.7, 0.08], delay: stagger(65), duration: 4200, frameRate: 30, loop: true, alternate: true, ease: 'inOutSine' });
    root.classList.add('anime-ready');
  });
}

const soundButton = document.querySelector('.sound-toggle');
let audioContext = null;
let masterGain = null;
let enabled = false;
function createAmbientAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return false;
  audioContext = new AudioContext();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0;
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = 420; filter.Q.value = .7;
  [55, 82.41, 110].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = index === 1 ? 'triangle' : 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 0 ? .5 : .2;
    oscillator.connect(gain).connect(filter); oscillator.start();
  });
  filter.connect(masterGain).connect(audioContext.destination);
  return true;
}
function ramp(target) {
  const now = audioContext.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(target, now + .6);
}
soundButton.addEventListener('click', async () => {
  if (!audioContext && !createAmbientAudio()) return;
  if (audioContext.state === 'suspended') await audioContext.resume();
  enabled = !enabled; ramp(enabled ? .035 : 0);
  soundButton.classList.toggle('enabled', enabled);
  soundButton.querySelector('span').textContent = enabled ? 'Sound on' : 'Sound off';
  soundButton.setAttribute('aria-label', enabled ? 'Disable ambient sound' : 'Enable ambient sound');
});
