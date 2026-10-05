/* ================================================================
 * WPCode Footer Script — getpacerai.com
 * ================================================================
 * This is the CANONICAL SOURCE for what's installed in:
 *   WP Admin → WPCode → Header & Footer → Footer
 *
 * If you change this file, paste the updated contents into WPCode.
 * WordPress strips inline <script> tags from page HTML, so all
 * site-wide JS must live here (see website-PacerAI/CLAUDE.md pitfalls).
 *
 * WPCode injects the Footer field VERBATIM. This file is pure JS (no script
 *   tags), so when pasting into the Header/Footer "Footer" field you MUST wrap
 *   it in an opening + closing script tag, or it renders as plain text and never
 *   executes. (Alternatively use a WPCode "JavaScript Snippet" — it auto-wraps,
 *   so leave the tags off.) Do NOT put a literal closing script tag anywhere in
 *   this file — inside a wrapping script tag it would close the block early.
 *
 * Each IIFE guards itself — it checks for a page-specific DOM
 * element and exits silently if not found. Safe to run site-wide.
 *
 * SECTIONS:
 *   1. Homepage hero typed-line animation (.typed-line, .type-cursor)
 *   2. White paper CTA form handler (.wp-cta-form)
 *      - POSTs to Cloudflare Worker → Apollo contact + sequence + Slack
 *      - Worker: https://whitepaper-worker.will-078.workers.dev
 *      - Docs:   04_GTM/GTME/plays/website-visitor/docs/
 *   3. Pipeline number stream animation (#num-stream-lt)
 *   4. Mobile nav accordion (viewport <= 768px)
 *   5. Research waitlist form handler (.research-waitlist-form)
 *      - POSTs to same Worker with asset_slug 'research-waitlist'
 *      - No download; confirms signup only
 *   6. v3 bone homepage — hero rotor word swap (#pacerai-homepage .pa-rotor)
 *   7. v3 bone homepage — logo marquee duplication (#pacerai-homepage .track)
 *   8. v3 bone homepage — pipeline number stream (#pacerai-homepage .how .pipe-nums)
 *      (#1 typed-line stays for legacy pages; it exits if .typed-line is absent)
 *
 * HISTORY:
 *   2026-07-21  v3.0.0 Claude-bone redesign: added hero rotor, logo marquee,
 *               and bone pipeline number-stream (sections 6-8)
 *   2026-04-17  Added white paper CTA form handler (Phase 3 deploy)
 *               Added pipeline animation + mobile nav (moved from inline)
 *   Prior       Homepage typed-line animation (original WPCode install)
 * ================================================================ */

/* --- 1. Homepage hero typed-line animation --- */
(function(){
  var el = document.querySelector('#pacerai-homepage .typed-line');
  var cur = document.querySelector('#pacerai-homepage .type-cursor');
  if (!el || !cur) return;
  var ph = ['Board Reporting.', 'Operational Cadence.', 'Sales Strategy.',
    'Due Diligence.'];
  var pi = 0;
  var ci = 0;
  var del = false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = ph[0];
    cur.style.display = 'none';
    return;
  }
  function tick() {
    var w = ph[pi];
    if (!del) {
      el.textContent = w.substring(0, ci + 1);
      ci++;
      if (ci === w.length) {
        del = true;
        setTimeout(tick, 2000);
        return;
      }
      setTimeout(tick, 60);
    } else {
      el.textContent = w.substring(0, ci - 1);
      ci--;
      if (ci === 0) {
        del = false;
        pi = (pi + 1) % ph.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 35);
    }
  }
  setTimeout(tick, 800);
})();

/* --- 2. Lead-capture form handler (all .wp-cta-form) --- */
/* --- 3. Pipeline number stream animation --- */
/* --- 4. Mobile nav accordion --- */
(function() {
  /* 2. Lead-capture form handler (all .wp-cta-form on the page) */
  /* Each form declares its own offer:
   *   data-asset-slug   which ASSETS entry the Worker should serve (default: the white paper)
   *   data-success-msg  confirmation copy for this placement
   *   data-redirect     where to send the visitor after a capture-only submit
   * A response with download_url opens the file; one without just confirms. */
  var WORKER_URL = 'https://whitepaper-worker.will-078.workers.dev';

  document.querySelectorAll('.wp-cta-form').forEach(function(form) {
    var input = form.querySelector('input[type="email"]');
    var button = form.querySelector('button');
    if (!input || !button) return;

    var origText = button.textContent;
    var slug = form.getAttribute('data-asset-slug') || 'board-quality-arr-snowballs';
    var successMsg = form.getAttribute('data-success-msg') || 'Check your inbox \u2014 we\u2019ll send you a copy too.';
    var redirect = form.getAttribute('data-redirect') || '';

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
      button.textContent = 'One moment\u2026';

      var params = new URLSearchParams(window.location.search);
      var body = JSON.stringify({
        email: email,
        asset_slug: slug,
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
        if (!data || !data.success) {
          msgEl.textContent = 'Something went wrong. Please try again.';
          button.disabled = false;
          button.textContent = origText;
          return;
        }
        msgEl.style.color = '#15803D';
        msgEl.textContent = successMsg;
        if (data.download_url) {
          button.textContent = 'Downloading\u2026';
          window.open(data.download_url, '_blank');
        } else {
          button.textContent = 'Thanks \u2014 you\u2019re in';
          if (redirect) {
            /* Carry the email forward so the demo widget doesn't ask twice. */
            var dest = redirect + (redirect.indexOf('?') === -1 ? '?' : '&') + 'email=' + encodeURIComponent(email);
            setTimeout(function() { window.location.href = dest; }, 900);
          }
        }
      })
      .catch(function() {
        msgEl.textContent = 'Network error. Please try again.';
        button.disabled = false;
        button.textContent = origText;
      });
    });
  });

  /* 2b. Demo signup iframe — forward ?email= from the page URL into the widget.
   * The widget is cross-origin (Worker-served), so the parent cannot fill it
   * directly; the Worker reads the param and prefills server-side instead. */
  (function() {
    var qp = new URLSearchParams(window.location.search);
    var em = (qp.get('email') || '').trim();
    if (!em) return;
    document.querySelectorAll('iframe[src*="/signup"]').forEach(function(f) {
      if (f.src.indexOf('email=') !== -1) return;
      f.src = f.src + (f.src.indexOf('?') === -1 ? '?' : '&') + 'email=' + encodeURIComponent(em);
    });
  })();

  /* 3. Pipeline number stream animation */
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

  /* 4. Mobile nav accordion */
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

/* --- 5. Research waitlist form handler (/research) --- */
/* POSTs to the same Cloudflare Worker as the white-paper form, but with
 * asset_slug 'research-waitlist'. No download is returned — on success it
 * just confirms the signup. Worker must accept this asset_slug and respond
 * { success: true } (Apollo tag + Slack ping). Safe site-wide: exits if the
 * form isn't on the page. */
(function() {
  var form = document.querySelector('.research-waitlist-form');
  if (!form) return;

  var WORKER_URL = 'https://whitepaper-worker.will-078.workers.dev';

  var input = form.querySelector('input[type="email"]');
  var button = form.querySelector('button');
  var origText = button.textContent;

  var msgEl = form.parentNode.querySelector('.waitlist-msg');
  if (!msgEl) {
    msgEl = document.createElement('p');
    msgEl.className = 'waitlist-msg';
    form.parentNode.insertBefore(msgEl, form.nextSibling);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    msgEl.textContent = '';
    msgEl.style.color = '#C94C4C';

    var email = (input.value || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      msgEl.textContent = 'Please enter a valid work email.';
      return;
    }

    button.disabled = true;
    button.textContent = 'Joining…';

    var params = new URLSearchParams(window.location.search);
    var body = JSON.stringify({
      email: email,
      asset_slug: 'research-waitlist',
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
      if (data && data.success) {
        button.textContent = 'You’re on the list';
        msgEl.style.color = '#2DB87A';
        msgEl.textContent = 'You’re on the list — we’ll email you the day we launch.';
        input.disabled = true;
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
})();

/* --- 6. v3 bone homepage — hero rotor word swap --- */
(function() {
  var rotor = document.querySelector('#pacerai-homepage .pa-rotor');
  if (!rotor) return;
  if (window.__paRotor) return; window.__paRotor = 1; /* guard: page injector may own this */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  /* The page owns the phrase list (data-phrases on .pa-rotor, "|"-separated) so a copy change never
     needs a WPCode paste. The fallback below only runs if that attribute is missing. */
  var phrases = (rotor.getAttribute('data-phrases') || '').split('|').filter(Boolean);
  if (phrases.length < 2) phrases = ['make plan with confidence.', 'close the gap to plan.',
    'improve Net Retention Rates.', 'cross-sell products.', 'improve durable revenue growth.',
    'improve forecast accuracy.'];
  var i = 0;
  setInterval(function() {
    i = (i + 1) % phrases.length;
    rotor.style.opacity = '0';
    setTimeout(function() {
      rotor.textContent = phrases[i];
      rotor.style.transition = 'opacity .35s ease';
      rotor.style.opacity = '1';
    }, 200);
  }, 2400);
})();

/* --- 7. v3 bone homepage — logo marquee duplication (seamless loop) --- */
(function() {
  var track = document.querySelector('#pacerai-homepage .marquee .track');
  if (!track || track.getAttribute('data-doubled')) return;
  track.innerHTML += track.innerHTML;
  track.setAttribute('data-doubled', '1');
})();

/* --- 8. v3 bone homepage — pipeline number stream --- */
(function() {
  var c = document.querySelector('#pacerai-homepage .how .pipe-nums');
  if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.__paPipe) return; window.__paPipe = 1; /* guard: page injector may own this */
  var nums = ['$24,035', '$81,115', '$88,980', '$118,795', 'NRR 101.3%', 'GRR 91.3%',
    '$197,545', '$510,470', '106.7%', '29.4%', '$302,695', 'NRR 108.1%'];
  function spawn() {
    var el = document.createElement('span');
    el.className = 'pipe-num-particle';
    el.textContent = nums[Math.floor(Math.random() * nums.length)];
    el.style.top = (Math.random() * 300) + 'px';
    el.style.animationDuration = (8 + Math.random() * 6) + 's';
    el.style.fontSize = (9 + Math.random() * 4) + 'px';
    c.appendChild(el);
    el.addEventListener('animationend', function() { el.remove(); });
  }
  for (var i = 0; i < 6; i++) setTimeout(spawn, i * 1500);
  setInterval(spawn, 2000);
})();
