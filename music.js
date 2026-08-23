(function () {
  const audio = document.getElementById('bg-music');
  const toggleBtn = document.getElementById('music-toggle');
  const STORAGE_KEY = 'bgMusicState';

  audio.volume = 0.3;
  audio.loop = true;

  function saveState() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      src: audio.currentSrc || audio.src,
      time: audio.currentTime,
      playing: !audio.paused
    }));
  }

  function attemptPlay() {
    // Muted autoplay is allowed everywhere without a click. Start muted,
    // then unmute right after — browsers treat "unmute an already-playing
    // element" very differently from "start sound from a fresh play()",
    // so this gets audio going automatically on load/back-nav without
    // waiting for a tap in most browsers (Chrome, Edge, Firefox).
    // iOS Safari may still hold it muted until a real tap — that's an
    // OS-level restriction no script can fully bypass.
    audio.muted = true;
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        audio.muted = false;
        toggleBtn.classList.add('is-playing');
      }).catch(() => {
        toggleBtn.classList.remove('is-playing');
      });
    }
  }

  function safeSetTime(time) {
    try {
      // Only trust the saved time if it's a sane, finite number
      // and (once known) within this page's track duration.
      if (!isFinite(time) || time < 0) return;
      if (isFinite(audio.duration) && time >= audio.duration) return;
      audio.currentTime = time;
    } catch (e) {
      // Ignore — some browsers throw if metadata isn't ready yet.
    }
  }

  function restoreState() {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) {
      attemptPlay(); // first page of the session
      return;
    }

    const { src, time, playing } = JSON.parse(saved);
    const sameTrack = src && (audio.currentSrc || audio.src).endsWith(src.split('/').pop());

    const applyTimeAndPlay = () => {
      if (sameTrack) safeSetTime(time);
      if (playing) attemptPlay();
    };

    if (audio.readyState >= 1) {
      // Metadata (duration) already available.
      applyTimeAndPlay();
    } else {
      // Wait for duration to be known before seeking, so safeSetTime's
      // range check is accurate instead of guessing.
      audio.addEventListener('loadedmetadata', applyTimeAndPlay, { once: true });
    }
  }

  toggleBtn.addEventListener('click', () => {
    audio.paused ? attemptPlay() : (audio.pause(), toggleBtn.classList.remove('is-playing'));
    saveState();
  });

  audio.addEventListener('timeupdate', saveState);
  window.addEventListener('pagehide', saveState);
  document.addEventListener('visibilitychange', saveState);

  // Handles back/forward navigation served from the browser's bfcache —
  // DOMContentLoaded doesn't fire again on a bfcache restore, so without
  // this the audio stays paused after the browser auto-suspends it.
  window.addEventListener('pageshow', function (event) {
    if (event.persisted && audio.paused) {
      attemptPlay();
    }
  });

  // Fallback: if autoplay was blocked, start on the visitor's first interaction
  ['click', 'touchstart', 'keydown'].forEach(evt => {
    document.addEventListener(evt, function once() {
      if (audio.paused) attemptPlay();
    }, { once: true });
  });

  restoreState();
})();