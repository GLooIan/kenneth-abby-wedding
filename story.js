// ============================================================
// story.js — line-by-line reveal for the "Our Story" paragraph
// Add this file next to story.css, and add this line to
// story.html right before </body> (after your other scripts):
//   <script src="story.js"></script>
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paragraph = document.querySelector('.story-text');
  if (!paragraph || prefersReducedMotion) return;

  // Wait for the italic Playfair Display font to finish loading before
  // measuring line breaks — otherwise the fallback font's different
  // width can throw off where lines actually wrap.
  if (document.fonts && document.fonts.ready) {
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      revealByLine(paragraph);
    };
    document.fonts.ready.then(run);
    setTimeout(run, 500); // safety net in case fonts.ready never resolves
  } else {
    revealByLine(paragraph);
  }
});

function revealByLine(paragraph) {
  // Split into paragraphs FIRST (on blank lines), before any whitespace
  // collapsing — this is what preserves the spacing between paragraphs.
  const rawText = paragraph.textContent;
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 0);

  if (!paragraphs.length) return;

  const baseDelay = 0.55;
  const stepDelay = 0.14;
  let lineCounter = 0;
  let htmlOut = '';

  paragraphs.forEach(paraText => {
    const words = paraText.split(' ');

    // Step 1: lay out each word in its own span so we can read back
    // its offsetTop and figure out which visual line it landed on.
    paragraph.innerHTML = words
      .map(word => `<span class="reveal-measure">${word}</span>`)
      .join(' ');

    const wordEls = Array.from(paragraph.querySelectorAll('.reveal-measure'));
    if (!wordEls.length) return;

    const lines = [];
    let currentTop = null;
    let currentLine = [];

    wordEls.forEach(wordEl => {
      const top = wordEl.offsetTop;
      if (currentTop === null || Math.abs(top - currentTop) < 2) {
        currentLine.push(wordEl.textContent);
        currentTop = top;
      } else {
        lines.push(currentLine);
        currentLine = [wordEl.textContent];
        currentTop = top;
      }
    });
    if (currentLine.length) lines.push(currentLine);

    // Step 2: build this paragraph's lines, continuing the delay
    // counter across paragraph boundaries so the reveal still flows.
    const linesHtml = lines
      .map(lineWords => {
        const delay = (baseDelay + lineCounter * stepDelay).toFixed(2);
        lineCounter++;
        const text = lineWords.join(' ');
        return `<span class="reveal-line"><span class="reveal-line-inner" style="--line-delay:${delay}s">${text}</span></span>`;
      })
      .join('');

    htmlOut += `<span class="story-paragraph">${linesHtml}</span>`;
  });

  paragraph.innerHTML = htmlOut;
}