/* ============================================================
 * WPCode Snippet: ARR Snowball White Paper CTA Form Handler
 * ============================================================
 * Install: WP Admin → WPCode → Header & Footer → Footer → paste this
 * Scope:  Fires only on pages with the .wp-cta-form element
 * Worker: https://whitepaper-worker.will-078.workers.dev
 * Docs:   04_GTM/GTME/plays/website-visitor/docs/
 * ============================================================ */
(function() {
  var form = document.querySelector('.wp-cta-form');
  if (!form) return;

  var WORKER_URL = 'https://whitepaper-worker.will-078.workers.dev';

  var input = form.querySelector('input[type="email"]');
  var button = form.querySelector('button');
  var origText = button.textContent;

  var msgEl = document.createElement('p');
  msgEl.style.cssText = 'font-size:12px;margin-top:8px;text-align:center;min-height:18px;';
  form.parentNode.insertBefore(msgEl, form.nextSibling);

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    msgEl.textContent = '';
    msgEl.style.color = '#B03A3A';

    var email = (input.value || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      msgEl.textContent = 'Please enter a valid work email.';
      return;
    }

    button.disabled = true;
    button.textContent = 'Preparing download\u2026';

    var params = new URLSearchParams(window.location.search);
    var body = JSON.stringify({
      email: email,
      asset_slug: 'board-quality-arr-snowballs',
      page_url: window.location.href,
      utm_source: params.get('utm_source'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign')
    });

    fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.success && data.download_url) {
        button.textContent = 'Downloading\u2026';
        msgEl.style.color = '#15803D';
        msgEl.textContent = 'Check your inbox \u2014 we\u2019ll send you a copy too.';
        window.open(data.download_url, '_blank');
      } else {
        msgEl.textContent = 'Something went wrong. Please try again.';
        button.disabled = false;
        button.textContent = origText;
      }
    })
    .catch(function() {
      msgEl.textContent = 'Network error. Please try again.';
      button.disabled = false;
      button.textContent = origText;
    });
  });

  /* --- Pipeline number stream animation --- */
  var c = document.getElementById('num-stream-lt');
  if (c && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var nums = ['$24,035','$81,115','$88,980','$118,795','106.7%','NRR 101.3%','GRR 91.3%','$197,545','$510,470','29.4%'];
    function spawn() {
      var el = document.createElement('span');
      el.className = 'num-particle-lt';
      el.textContent = nums[Math.floor(Math.random() * nums.length)];
      el.style.top = (Math.random() * 280) + 'px';
      el.style.animationDuration = (8 + Math.random() * 6) + 's';
      el.style.fontSize = (9 + Math.random() * 4) + 'px';
      c.appendChild(el);
      el.addEventListener('animationend', function() { el.remove(); });
    }
    for (var i = 0; i < 6; i++) setTimeout(spawn, i * 1500);
    setInterval(spawn, 2000);
  }

  /* --- Mobile nav --- */
  if (window.innerWidth <= 768) {
    document.querySelectorAll('#pacerai-homepage .nav-links > li > a').forEach(function(a) {
      var li = a.parentElement;
      if (!li.querySelector('.dropdown')) return;
      a.addEventListener('click', function(e) {
        e.preventDefault();
        li.classList.toggle('mobile-expanded');
      });
    });
  }
})();
