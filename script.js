// ─── Config ───
const EDGE_FN_URL = 'https://spjlyhmgqtkcqhpvgxci.supabase.co/functions/v1/waitlist-signup';
const SUBMIT_LABEL = 'Join the beta';
// How long the thank-you stays up before the beta page opens.
const BETA_DELAY = 1800;

// ─── Elements ───
const form = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email-input');
const submitBtn = document.getElementById('submit-btn');
const errorMsg = document.getElementById('error-msg');
const overlay = document.getElementById('overlay');
const toastMsg = document.getElementById('toast-msg');
const betaLink = document.getElementById('beta-link');
let betaTimer = 0;

// ─── The nav is clear over the sky and frosts once the page scrolls ───
const nav = document.querySelector('.nav');
const frostNav = () => nav.classList.toggle('scrolled', window.scrollY > 8);
frostNav();
window.addEventListener('scroll', frostNav, { passive: true });

// ─── Statistics: count presses of the links marked with data-track ───
const track = (name, props) => { if (window.waqtyTrack) window.waqtyTrack(name, props); };
document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-track]');
  if (link) track(link.dataset.track, { placement: link.dataset.placement });
});

// ─── Light and dark: the toggle plays the sky through to night, or back ───
const themeToggle = document.querySelector('.theme-toggle');
const labelToggle = () => {
  themeToggle.setAttribute('aria-label', window.waqtySky.isDark() ? 'Switch to light mode' : 'Switch to dark mode');
};
if (themeToggle && window.waqtySky) {
  labelToggle();
  themeToggle.addEventListener('click', () => {
    window.waqtySky.toggle();
    labelToggle();
    track('theme_toggle', { to: window.waqtySky.isDark() ? 'dark' : 'light' });
  });
}

// ─── Stars, drawn once. The same ones every visit, as in the app. ───
const starCanvas = document.querySelector('.stars');
let starWidth = 0;
function drawStars() {
  const { width, height } = starCanvas.getBoundingClientRect();
  if (!width || Math.round(width) === starWidth) return;
  starWidth = Math.round(width);
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  starCanvas.width = width * scale;
  starCanvas.height = height * scale;
  const ctx = starCanvas.getContext('2d');
  ctx.scale(scale, scale);

  let seed = 7;
  const random = () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const count = Math.min(420, Math.max(120, Math.round(width * height / 2400)));
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = 0.3 + random() * 0.6;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(random() * width, random() * height, 0.4 + random() * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }
}
if (starCanvas) {
  drawStars();
  window.addEventListener('resize', drawStars, { passive: true });
}

// ─── Ease sections in as they scroll into view ───
const risers = document.querySelectorAll('.rise');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  risers.forEach((el) => io.observe(el));
} else {
  risers.forEach((el) => el.classList.add('in'));
}

// ─── Form Submit ───
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.toLowerCase().trim();
  if (!email) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span>';
  errorMsg.hidden = true;

  try {
    const res = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // `platform` tells the function this is an Android sign-up, not an
      // iPhone beta request.
      body: JSON.stringify({ email, platform: 'android' }),
    });

    const data = await res.json();

    submitBtn.disabled = false;
    submitBtn.textContent = SUBMIT_LABEL;

    // Someone already on the list still gets taken to the beta.
    if (!res.ok && data.code === 'DUPLICATE') {
      track('android_beta_signup', { result: 'already_joined' });
      showSuccess('You are already on the list. Opening the Android beta.');
      return;
    }

    if (!res.ok) {
      track('android_beta_signup', { result: 'error' });
      showError(data.error || 'Something went wrong. Try again.');
      return;
    }

    // The email itself is never sent to the statistics.
    track('android_beta_signup', { result: 'joined' });

    showSuccess('You are on the list. Opening the Android beta.');
  } catch (err) {
    console.error('Submit error:', err);
    submitBtn.disabled = false;
    submitBtn.textContent = SUBMIT_LABEL;
    showError('Something went wrong. Try again.');
  }
});

// ─── Clear error on input ───
emailInput.addEventListener('input', () => {
  errorMsg.hidden = true;
});

// ─── Show error ───
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.hidden = false;
}

// ─── Say thank you, then open the Android beta page ───
function showSuccess(msg) {
  toastMsg.textContent = msg;
  overlay.hidden = false;
  overlay.classList.add('visible');
  clearTimeout(betaTimer);
  betaTimer = setTimeout(() => {
    window.location.href = betaLink.href;
  }, BETA_DELAY);
}

// ─── Close overlay on click or Escape. This also stops the beta page opening. ───
function closeOverlay() {
  clearTimeout(betaTimer);
  overlay.hidden = true;
  overlay.classList.remove('visible');
  emailInput.value = '';
}

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeOverlay();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !overlay.hidden) closeOverlay();
});
