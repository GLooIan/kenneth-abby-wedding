(function () {
  const FAIRY_IMAGE = "assets/fairN.png";
  const FAIRY_COUNT = 20;         // how many fairies on screen
  const MIN_SIZE = 60;
  const MAX_SIZE = 110;
  const SPEED = 0.35;             // base drift speed (px/frame)
  const DIRECTION_CHANGE_CHANCE = 0.01; // chance per frame to pick a new heading
  const MIN_FLAP_SPEED = 0.6;     // seconds per flap cycle
  const MAX_FLAP_SPEED = 1.1;

  const layer = document.getElementById("fairy-layer");
  if (!layer) return;

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  class Fairy {
    constructor(index, gridCols, gridRows) {
      this.wrap = document.createElement("div");
      this.wrap.className = "fairy-wrap";

      this.img = document.createElement("img");
      this.img.className = "fairy";
      this.img.src = FAIRY_IMAGE;

      this.size = rand(MIN_SIZE, MAX_SIZE);
      this.wrap.style.width = this.size + "px";

      // give each fairy its own flap speed + slight delay so they're out of sync
      const flapDuration = rand(MIN_FLAP_SPEED, MAX_FLAP_SPEED).toFixed(2);
      const flapDelay = rand(0, 1).toFixed(2);
      this.img.style.animationDuration = flapDuration + "s";
      this.img.style.animationDelay = "-" + flapDelay + "s";

      // spread spawn: place this fairy in its own grid cell (with random
      // jitter inside the cell) instead of a fully random position, so
      // fairies start evenly distributed across the screen rather than
      // clumping together by chance
      const col = index % gridCols;
      const row = Math.floor(index / gridCols);
      const cellW = window.innerWidth / gridCols;
      const cellH = window.innerHeight / gridRows;

      const jitterX = rand(0, Math.max(cellW - this.size, 0));
      const jitterY = rand(0, Math.max(cellH - this.size, 0));

      this.x = col * cellW + jitterX;
      this.y = row * cellH + jitterY;

      // random initial heading
      const angle = rand(0, Math.PI * 2);
      this.dx = Math.cos(angle) * SPEED;
      this.dy = Math.sin(angle) * SPEED;

      this.wrap.appendChild(this.img);
      layer.appendChild(this.wrap);
      this.render();
    }

    updateHeading() {
      // occasionally drift toward a new random direction
      if (Math.random() < DIRECTION_CHANGE_CHANCE) {
        const angle = rand(0, Math.PI * 2);
        const targetDx = Math.cos(angle) * SPEED;
        const targetDy = Math.sin(angle) * SPEED;
        // smooth blend toward new direction instead of snapping
        this.dx = this.dx * 0.7 + targetDx * 0.3;
        this.dy = this.dy * 0.7 + targetDy * 0.3;
      }
    }

    step() {
      this.updateHeading();

      this.x += this.dx;
      this.y += this.dy;

      // wrap around edges so fairies loop back into view
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (this.x < -this.size) this.x = w;
      if (this.x > w) this.x = -this.size;
      if (this.y < -this.size) this.y = h;
      if (this.y > h) this.y = -this.size;

      this.render();
    }

    render() {
      this.wrap.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
  }

  const fairies = [];

  // work out a grid roughly matching the screen's aspect ratio so cells
  // are close to square, then spawn one fairy per cell
  const aspect = window.innerWidth / window.innerHeight;
  const gridCols = Math.max(1, Math.round(Math.sqrt(FAIRY_COUNT * aspect)));
  const gridRows = Math.max(1, Math.ceil(FAIRY_COUNT / gridCols));

  for (let i = 0; i < FAIRY_COUNT; i++) {
    fairies.push(new Fairy(i, gridCols, gridRows));
  }

  function loop() {
    fairies.forEach(f => f.step());
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // keep fairies in bounds on resize
  window.addEventListener("resize", () => {
    fairies.forEach(f => {
      f.x = Math.min(f.x, window.innerWidth - f.size);
      f.y = Math.min(f.y, window.innerHeight - f.size);
    });
  });
})();

/* ================================================================
   SCROLL DOWN BUTTON
   ================================================================ */
(function () {
  const btn = document.getElementById("scrollBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
  });

  function updateVisibility() {
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 40;
    btn.classList.toggle("is-hidden", atBottom);
  }

  window.addEventListener("scroll", updateVisibility);
  window.addEventListener("resize", updateVisibility);
  updateVisibility();
})();



/* ================================================================
   WEDDING COUNTDOWN — counts down to Nov 20, 2026
   ================================================================ */
(function () {
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const weddingDate = new Date("2026-11-20T00:00:00");

  function updateCountdown() {
    const diff = weddingDate - new Date();

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
})();

/* ================================================================
   SCROLL REVEAL — fades/rises in any element with class
   "reveal-on-scroll" (used by the save-the-date banner) once it
   enters the viewport. Runs once per element, then stops watching
   it so it doesn't re-trigger on scroll-back.
   ================================================================ */
(function () {
  const targets = document.querySelectorAll(".reveal-on-scroll");
  if (!targets.length) return;

  // if the browser can't do IntersectionObserver, just show everything
  if (!("IntersectionObserver" in window)) {
    targets.forEach(el => el.classList.add("is-in-view"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in-view");
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: "0px 0px -40px 0px"
  });

  targets.forEach(el => observer.observe(el));
})();