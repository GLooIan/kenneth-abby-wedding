document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('rsvp-form');
  var envelope = document.getElementById('rsvp-envelope');
  var confirmationHeading = document.getElementById('confirmation-heading');
  var confirmationText = document.getElementById('confirmation-text');
  var attendYes = document.getElementById('attend-yes');
  var attendNo = document.getElementById('attend-no');
  var submitBtn = form.querySelector('.rsvp-submit');

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Letter-by-letter animation for the heading ----
  function splitIntoLetters(el) {
    var text = el.textContent;
    el.textContent = '';
    el.setAttribute('aria-label', text);
    Array.from(text).forEach(function (char, i) {
      var span = document.createElement('span');
      span.className = 'letter-in';
      span.style.animationDelay = (i * 45) + 'ms';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
    });
  }

  if (!prefersReducedMotion) {
    var heading = document.querySelector('.rsvp-heading');
    if (heading) splitIntoLetters(heading);

    var eyebrow = document.querySelector('.rsvp-eyebrow');
    var subheading = document.querySelector('.rsvp-subheading');
    if (eyebrow) eyebrow.classList.add('fade-in-up');
    if (subheading) {
      subheading.classList.add('fade-in-up');
      subheading.style.animationDelay = '0.15s';
    }
  }

  // ---- Staggered entrance animation for form fields ----
  if (!prefersReducedMotion) {
    var animatedEls = form.querySelectorAll('.field-group, .rsvp-submit');
    animatedEls.forEach(function (el, i) {
      el.style.animationDelay = (0.5 + i * 0.07) + 's';
      el.classList.add('field-animate-in');
    });
  }

  function updateDecliningState() {
    if (attendNo.checked) {
      form.classList.add('is-declining');
    } else {
      form.classList.remove('is-declining');
    }
  }

  attendYes.addEventListener('change', updateDecliningState);
  attendNo.addEventListener('change', updateDecliningState);
  updateDecliningState();

  // ---- Google Form connection ----
  var GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLScGIYQOt0uVgjjl3juvkaE8UPEMPQ9cTrG2wtDBftO2iYdl5A/formResponse';

  var ENTRY_IDS = {
    fullName:   'entry.721916912',
    attending:  'entry.1935838042',
    guestCount: 'entry.423935781',
    message:    'entry.1628782527'
  };

  function submitToGoogleForm(data) {
    var formData = new URLSearchParams();
    formData.append(ENTRY_IDS.fullName, data.fullName);
    formData.append(ENTRY_IDS.attending, data.attending);
    formData.append(ENTRY_IDS.guestCount, data.guestCount);
    formData.append(ENTRY_IDS.message, data.message);

    // no-cors: Google Forms doesn't send CORS headers back,
    // so we can't read the response — but the submission still goes through.
    return fetch(GOOGLE_FORM_ACTION, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (submitBtn.classList.contains('is-sealing')) return;

    var name = document.getElementById('full-name').value.trim() || 'there';
    var isAttending = attendYes.checked;
    var firstName = name.split(' ')[0];

    var guestSelect = document.getElementById('guest-count');
    var guestLabel = guestSelect.options[guestSelect.selectedIndex].text; // "Just Me" or "Me + 1"

    var payload = {
      fullName: name,
      attending: isAttending ? 'Joyfully Accepts' : 'Regretfully Declines',
      guestCount: isAttending ? guestLabel : 'Just Me',
      message: document.getElementById('message').value.trim()
    };

    submitBtn.classList.add('is-sealing');
    submitBtn.disabled = true;

    submitToGoogleForm(payload)
      .catch(function (err) {
        console.error('RSVP submission error:', err);
      })
      .finally(function () {
        function reveal() {
          if (isAttending) {
            confirmationHeading.textContent = 'Thank You, ' + firstName + '!';
            confirmationText.textContent = "Your reply has been received. We can't wait to celebrate with you.";
          } else {
            confirmationHeading.textContent = 'We\'ll Miss You';
            confirmationText.textContent = 'Thank you for letting us know, ' + firstName + '. You\'ll be in our hearts on the day.';
          }
          envelope.classList.add('is-sealed');
        }

        if (prefersReducedMotion) {
          reveal();
        } else {
          setTimeout(reveal, 450);
        }
      });
  });
});

// Makes any element with id="back-link" go back to the actual previous
// page in the browser's history (e.g. mainpage -> rsvp -> back to mainpage,
// or details -> rsvp -> back to details), instead of always going to one
// fixed page.
document.addEventListener('DOMContentLoaded', function () {
  var backLink = document.getElementById('back-link');
  if (!backLink) return;

  backLink.addEventListener('click', function (e) {
    if (window.history.length > 1) {
      e.preventDefault();
      window.history.back();
    }
  });
});