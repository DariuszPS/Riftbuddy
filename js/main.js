import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ========================================
// RiftBuddy Pre-release JavaScript
// Supabase integration + localStorage voting
// ========================================

const SUPABASE_URL = 'https://tfrtuagccocllridypls.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcnR1YWdjY29jbGxyaWR5cGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTY2NzAsImV4cCI6MjA5MDg3MjY3MH0.0KtXPEg5Sn-8q-fdkQinPhDKFo81zf3kgV8YSkscFhk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================================
// Waitlist Form Handler
// ========================================
const waitlistForm = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email-input');
const formMessage = document.getElementById('form-message');

waitlistForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const submitButton = waitlistForm.querySelector('button[type="submit"]');

  submitButton.disabled = true;
  formMessage.textContent = '';
  formMessage.className = 'form-message';

  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email }])
      .select();

    if (error) {
      if (error.code === '23505') {
        formMessage.textContent = "You're already on the waitlist!";
        formMessage.classList.add('success');
      } else {
        throw error;
      }
    } else {
      formMessage.textContent = "🤜🤛 You're on the list! We'll let you know when RiftBuddy launches.";
      formMessage.classList.add('success');
      emailInput.value = '';
    }
  } catch (error) {
    console.error('Waitlist error:', error);
    formMessage.textContent = 'Oops! Something went wrong. Try again?';
    formMessage.classList.add('error');
  } finally {
    submitButton.disabled = false;
  }
});

// ========================================
// Feature Voting Handler
// ========================================
const STORAGE_KEY = 'riftbuddy_votes';

function loadVotes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveVotes(votes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

function restoreVoteStates() {
  const votes = loadVotes();
  Object.keys(votes).forEach(feature => {
    const voteType = votes[feature];
    const card = document.querySelector(`.feature-card[data-feature="${feature}"]`);
    if (card) {
      card.querySelectorAll('.vote-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.vote === voteType);
      });
    }
  });
}

document.querySelectorAll('.vote-btn').forEach(button => {
  button.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const card = btn.closest('.feature-card');
    const feature = card.dataset.feature;
    const voteType = btn.dataset.vote;

    const votes = loadVotes();
    const previousVote = votes[feature];

    // Clicking same button again → deselect
    if (previousVote === voteType) {
      delete votes[feature];
      saveVotes(votes);
      card.querySelectorAll('.vote-btn').forEach(b => b.classList.remove('active'));
      return;
    }

    const buttons = card.querySelectorAll('.vote-btn');
    buttons.forEach(b => b.disabled = true);

    try {
      const { error } = await supabase
        .from('votes')
        .insert([{ feature, vote_type: voteType }]);

      if (error) throw error;

      votes[feature] = voteType;
      saveVotes(votes);

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      buttons.forEach(b => b.disabled = false);
    }
  });
});

restoreVoteStates();

// ========================================
// Feedback Form Handler
// ========================================
const feedbackForm = document.getElementById('feedback-form');
const feedbackMessage = document.getElementById('feedback-message');
const feedbackEmail = document.getElementById('feedback-email');
const feedbackStatus = document.getElementById('feedback-message-status');

feedbackForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const message = feedbackMessage.value.trim();
  const email = feedbackEmail.value.trim() || null;
  const submitButton = feedbackForm.querySelector('button[type="submit"]');

  submitButton.disabled = true;
  feedbackStatus.textContent = '';
  feedbackStatus.className = 'form-message';

  try {
    const { error } = await supabase
      .from('feedback')
      .insert([{ message, email }]);

    if (error) throw error;

    feedbackStatus.textContent = '🤜🤛 Thanks for the idea! We read every single one.';
    feedbackStatus.classList.add('success');
    feedbackMessage.value = '';

  } catch (error) {
    console.error('Feedback error:', error);
    feedbackStatus.textContent = 'Oops! Something went wrong. Try again?';
    feedbackStatus.classList.add('error');
  } finally {
    submitButton.disabled = false;
  }
});

console.log('🎮 RiftBuddy pre-release page loaded');
