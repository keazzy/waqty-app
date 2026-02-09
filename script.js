// ─── Supabase Config ───
const SUPABASE_URL = 'https://spjlyhmgqtkcqhpvgxci.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwamx5aG1ncXRrY3FocHZneGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MzYzODIsImV4cCI6MjA4MTIxMjM4Mn0.CJz-iTGuoKCmhRQc0vausUPPLR2341GL8JCncMk9i1k';

// ─── Init Supabase client ───
let db = null;
try {
  const { createClient } = window.supabase || {};
  if (createClient) {
    db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (err) {
  console.error('Supabase init failed:', err);
}

// ─── Elements ───
const form = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email-input');
const submitBtn = document.getElementById('submit-btn');
const errorMsg = document.getElementById('error-msg');
const overlay = document.getElementById('overlay');

// ─── Form Submit ───
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.toLowerCase().trim();
  if (!email) return;

  if (!db) {
    showError('Service unavailable. Try again later.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = '...';
  errorMsg.hidden = true;

  try {
    const { error } = await db
      .from('waitlist')
      .insert({ email });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Notify me';

    if (error) {
      if (error.code === '23505') {
        showError("You're already on the list!");
      } else {
        showError('Something went wrong. Try again.');
      }
      return;
    }

    showSuccess();
  } catch (err) {
    console.error('Submit error:', err);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Notify me';
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

// ─── Show success overlay ───
function showSuccess() {
  overlay.hidden = false;
  overlay.classList.add('visible');
}

// ─── Close overlay on click ───
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    overlay.hidden = true;
    overlay.classList.remove('visible');
    emailInput.value = '';
  }
});
