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
const compactMotion = window.matchMedia('(max-width: 720px)').matches;

root.classList.add('js');

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

if (!reduceMotion) {
  document.querySelectorAll('.dust').forEach((dust, index) => {
    makeDust(dust, compactMotion ? (index === 3 ? 11 : 7) : (index === 3 ? 24 : 15));
  });
}

function setActive(index) {
  const section = sections[index];
  if (!section) return;

  sections.forEach((item, i) => item.classList.toggle('is-active', i === index));
  railLinks.forEach((link, i) => {
    const active = i === index;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
  dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  topLinks.forEach(link => link.classList.toggle('active', link.hash === `#${section.id}`));
  railFill.style.transform = `scaleY(${index / (sections.length - 1)})`;
  themeMeta?.setAttribute('content', getComputedStyle(section).getPropertyValue('--accent').trim() || '#05070d');
}

const chapterObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) setActive(Number(entry.target.dataset.chapter));
  }
}, { rootMargin: '-48% 0px -48% 0px', threshold: 0 });
sections.forEach(section => chapterObserver.observe(section));

let scrollTicking = false;
function updateScrollProgress() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / max));
  progressFill.style.transform = `scaleX(${progress})`;
  topbar.classList.toggle('scrolled', window.scrollY > 24);
  scrollTicking = false;
}
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(updateScrollProgress);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollProgress();

// A real, opt-in procedural ambient bed. Browsers require a user gesture before audio starts.
const soundButton = document.querySelector('.sound-toggle');
let audioContext = null;
let masterGain = null;
let soundEnabled = false;

function createAmbientAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return false;

  audioContext = audioContext || new AudioContext();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0;

  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 420;
  filter.Q.value = 0.7;

  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 0.007;
  lfo.connect(lfoGain).connect(masterGain.gain);

  [55, 82.41, 110].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = index === 1 ? 'triangle' : 'sine';
    oscillator.frequency.value = frequency;
    oscillator.detune.value = index * 3;
    gain.gain.value = index === 0 ? 0.5 : 0.2;
    oscillator.connect(gain).connect(filter);
    oscillator.start();
  });

  filter.connect(masterGain).connect(audioContext.destination);
  lfo.start();
  return true;
}

function rampAudio(target, duration = 0.8) {
  if (!audioContext || !masterGain) return;
  const now = audioContext.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(target, now + duration);
}

soundButton.addEventListener('click', async () => {
  if (!audioContext && !createAmbientAudio()) {
    soundButton.querySelector('span').textContent = 'Unavailable';
    soundButton.disabled = true;
    return;
  }

  if (audioContext.state === 'suspended') await audioContext.resume();
  soundEnabled = !soundEnabled;
  rampAudio(soundEnabled ? 0.035 : 0);
  soundButton.classList.toggle('enabled', soundEnabled);
  soundButton.querySelector('span').textContent = soundEnabled ? 'Sound on' : 'Sound off';
  soundButton.setAttribute('aria-label', soundEnabled ? 'Disable ambient sound' : 'Enable ambient sound');
});

document.addEventListener('visibilitychange', () => {
  if (!soundEnabled) return;
  rampAudio(document.hidden ? 0 : 0.035, 0.35);
});

async function loadAnime() {
  try {
    return await import('https://cdn.jsdelivr.net/npm/animejs@4.5.0/+esm');
  } catch (firstError) {
    console.warn('Primary Anime.js CDN unavailable; trying fallback.', firstError);
    return import('https://esm.sh/animejs@4.5.0');
  }
}

if (!reduceMotion) {
  loadAnime().then(({ animate, createTimeline, onScroll, stagger }) => {
    createTimeline({ defaults: { ease: 'outExpo' } })
      .add('.site-brand', { opacity: [0, 1], y: [-14, 0], duration: 900 })
      .add('.top-nav a, .sound-toggle', { opacity: [0, 1], y: [-10, 0], delay: stagger(75), duration: 700 }, '-=650')
      .add('.chapter-0 .chapter-number, .chapter-0 .chapter-eyebrow, .chapter-0 .chapter-title, .chapter-0 .chapter-body, .chapter-0 .story-link', {
        opacity: [0, 1], y: [30, 0], delay: stagger(90), duration: 1000
      }, '-=420')
      .add('.chapter-0 .scene-frame', {
        opacity: [0, 1], scale: [0.94, 1], rotate: ['0.9deg', '0deg'], duration: 1300
      }, '-=1000');

    sections.forEach((section, index) => {
      const image = section.querySelector('.scene-image');
      const frame = section.querySelector('.scene-frame');
      const ambient = section.querySelector('.chapter-ambient');
      const copy = section.querySelectorAll('.chapter-number, .chapter-eyebrow, .chapter-title, .chapter-body, .story-link');
      const dust = section.querySelectorAll('.dust span');
      const scrollPlayback = { target: section, enter: 'top bottom', leave: 'bottom top', sync: true };

      animate(image, {
        y: compactMotion ? ['-3%', '3%'] : ['-8%', '8%'],
        scale: compactMotion ? [1.07, 1.02] : [1.12, 1.02],
        ease: 'linear',
        autoplay: onScroll(scrollPlayback)
      });

      animate(ambient, {
        y: compactMotion ? [-12, 12] : [-34, 34],
        scale: [1.08, 1.02],
        ease: 'linear',
        autoplay: onScroll(scrollPlayback)
      });

      if (!compactMotion) {
        animate(frame, {
          y: [34, -34],
          rotate: index % 2 ? ['-0.8deg', '0.8deg'] : ['0.8deg', '-0.8deg'],
          ease: 'linear',
          autoplay: onScroll(scrollPlayback)
        });
      }

      if (index > 0) {
        animate(copy, {
          opacity: [0.16, 1],
          y: compactMotion ? [30, 0] : [58, -8],
          delay: stagger(compactMotion ? 28 : 50),
          ease: 'outQuart',
          autoplay: onScroll({ target: section, enter: 'top+=70 bottom', leave: 'bottom-=20 top', sync: 0.35 })
        });
      }

      if (dust.length) {
        animate(dust, {
          y: [18, -34],
          x: [-6, 6],
          opacity: [0.08, 0.7, 0.08],
          delay: stagger(75),
          duration: 4200,
          frameRate: 30,
          loop: true,
          alternate: true,
          ease: 'inOutSine'
        });
      }
    });

    if (!compactMotion) {
      animate('.orbit-one', { rotate: '1turn', duration: 28000, frameRate: 30, loop: true, ease: 'linear' });
      animate('.orbit-two', { rotate: '-1turn', duration: 36000, frameRate: 30, loop: true, ease: 'linear' });
    }
    root.classList.add('anime-ready');
  }).catch(error => {
    console.warn('Anime.js could not load. The story remains fully readable without motion.', error);
    root.classList.add('anime-fallback');
  });
}
