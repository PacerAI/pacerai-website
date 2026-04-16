/* WPCode Snippet: Typed Hero Rotation — Homepage Only
   Location: Site Wide Footer
   Condition: Page URL contains "getpacerai.com" (or no condition for homepage-only)

   This types and rotates through phrases on the hero last line.
   The HTML target is: <span class="typed-line"></span><span class="type-cursor"></span>
   inside #pacerai-homepage h1
*/
(function(){
  var el = document.querySelector('#pacerai-homepage .typed-line');
  var cur = document.querySelector('#pacerai-homepage .type-cursor');
  if (!el || !cur) return;

  var phrases = ['Board Reporting.', 'Operational Cadence.', 'Sales Strategy.', 'Due Diligence.'];
  var phraseIdx = 0;
  var charIdx = 0;
  var isDeleting = false;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = phrases[0];
    cur.style.display = 'none';
    return;
  }

  function tick() {
    var word = phrases[phraseIdx];
    if (!isDeleting) {
      el.textContent = word.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === word.length) {
        isDeleting = true;
        setTimeout(tick, 2000);
        return;
      }
      setTimeout(tick, 60);
    } else {
      el.textContent = word.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 35);
    }
  }

  setTimeout(tick, 800);
})();
