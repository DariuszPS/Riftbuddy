// ========================================
// RiftBuddy — vanilla JS, no dependencies
// Supabase REST API via fetch()
// ========================================

const SUPABASE_URL = 'https://tfrtuagccocllridypls.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcnR1YWdjY29jbGxyaWR5cGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTY2NzAsImV4cCI6MjA5MDg3MjY3MH0.0KtXPEg5Sn-8q-fdkQinPhDKFo81zf3kgV8YSkscFhk';

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY,
  'Prefer': 'return=minimal'
};

function dbInsert(table, data) {
  return fetch(SUPABASE_URL + '/rest/v1/' + table, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(data)
  });
}

// ========================================
// Waitlist form
// ========================================
const waitlistForm = document.getElementById('waitlist-form');
const emailInput   = document.getElementById('email-input');
const formMessage  = document.getElementById('form-message');

waitlistForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = emailInput.value.trim();
  if (!email || !email.includes('@')) {
    emailInput.style.borderColor = '#EF4444';
    emailInput.focus();
    return;
  }
  emailInput.style.borderColor = '';

  const btn = waitlistForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  formMessage.textContent = '';
  formMessage.className = 'form-message';

  try {
    const res = await dbInsert('waitlist', { email });
    if (res.status === 409 || res.status === 422) {
      formMessage.textContent = "You're already on the waitlist!";
      formMessage.classList.add('success');
    } else if (res.ok || res.status === 201) {
      formMessage.textContent = "\uD83E\uDD1C\uD83E\uDD1B You're on the list! We'll let you know when RiftBuddy launches.";
      formMessage.classList.add('success');
      emailInput.value = '';
    } else {
      throw new Error('status ' + res.status);
    }
  } catch (err) {
    console.error('Waitlist error:', err);
    formMessage.textContent = 'Oops! Something went wrong. Try again?';
    formMessage.classList.add('error');
  } finally {
    btn.disabled = false;
  }
});

// ========================================
// Vote buttons
// ========================================
var STORAGE_KEY = 'riftbuddy_votes';

function loadVotes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch (e) { return {}; }
}

function saveVotes(votes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

function restoreVoteStates() {
  var votes = loadVotes();
  Object.keys(votes).forEach(function(feature) {
    var card = document.querySelector('.feature-card[data-feature="' + feature + '"]');
    if (!card) return;
    card.querySelectorAll('.vote-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.vote === votes[feature]);
    });
  });
}

document.querySelectorAll('.vote-btn').forEach(function(btn) {
  btn.addEventListener('click', async function(e) {
    e.preventDefault();
    var button  = e.currentTarget;
    var card    = button.closest('.feature-card');
    var feature = card.dataset.feature;
    var voteType = button.dataset.vote;
    var votes   = loadVotes();
    var buttons = card.querySelectorAll('.vote-btn');

    // Same button clicked again → deselect
    if (votes[feature] === voteType) {
      delete votes[feature];
      saveVotes(votes);
      buttons.forEach(function(b) { b.classList.remove('active'); });
      return;
    }

    // Optimistic UI update first
    votes[feature] = voteType;
    saveVotes(votes);
    buttons.forEach(function(b) { b.classList.remove('active'); });
    button.classList.add('active');

    // Then send to Supabase (fire and forget)
    try {
      await dbInsert('votes', { feature: feature, vote_type: voteType });
    } catch (err) {
      console.error('Vote error:', err);
    }
  });
});

restoreVoteStates();

// ========================================
// Feedback form
// ========================================
var feedbackForm    = document.getElementById('feedback-form');
var feedbackMessage = document.getElementById('feedback-message');
var feedbackStatus  = document.getElementById('feedback-message-status');

feedbackForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  var message = feedbackMessage.value.trim();
  if (!message) {
    feedbackMessage.style.borderColor = '#EF4444';
    feedbackMessage.focus();
    return;
  }
  feedbackMessage.style.borderColor = '';

  var btn = feedbackForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  feedbackStatus.textContent = '';
  feedbackStatus.className = 'form-message';

  try {
    var res = await dbInsert('feedback', { message: message });
    if (res.ok || res.status === 201) {
      feedbackStatus.textContent = '\uD83E\uDD1C\uD83E\uDD1B Thanks for the idea! We read every single one.';
      feedbackStatus.classList.add('success');
      feedbackMessage.value = '';
    } else {
      throw new Error('status ' + res.status);
    }
  } catch (err) {
    console.error('Feedback error:', err);
    feedbackStatus.textContent = 'Oops! Something went wrong. Try again?';
    feedbackStatus.classList.add('error');
  } finally {
    btn.disabled = false;
  }
});
