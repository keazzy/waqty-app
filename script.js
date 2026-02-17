// ─── Config ───
const EDGE_FN_URL = 'https://spjlyhmgqtkcqhpvgxci.supabase.co/functions/v1/waitlist-signup';

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

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span>';
  errorMsg.hidden = true;

  try {
    const res = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    submitBtn.disabled = false;
    submitBtn.textContent = 'Get early access';

    if (!res.ok) {
      if (data.code === 'DUPLICATE') {
        showError("You've already signed up! Check your email for the link.");
      } else {
        showError(data.error || 'Something went wrong. Try again.');
      }
      return;
    }

    showSuccess();
  } catch (err) {
    console.error('Submit error:', err);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Get early access';
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
