/* /pricing/ page behaviour: the Monthly | Annual toggle, the − / + steppers, the running totals, and
 * the GA4 events. WordPress strips <script> from page content, so scripts/build_pricing.py inlines this
 * file into an <img onerror> at the end of the page (the homepage uses the same injector).
 *
 * No price lives in this file. Every number is read from data- attributes that build_pricing.py writes
 * from the Price Book (foundation/pricing/product-pricing-price-book.md).
 *
 * GA4 (through window.pacerTrack from WPCode footer.js section 0):
 *   pricing_estimate  1.5 s after the last toggle or − / + change   plan, billing, value, currency
 *   pricing_choose    a click on a Choose button                    plan, billing, value, currency,
 *                                                                    pacer_users, planning_users, hour_blocks
 */
(function () {
  if (window.__paPricing) return;
  function start() {
    var root = document.querySelector('#pacerai-homepage .pricing-two-pack');
    if (!root || window.__paPricing) return;
    window.__paPricing = 1;

    var cfg = root.dataset;
    var SEAT_A = +cfg.seatA, SEAT_M = +cfg.seatM, INCLUDED = +cfg.included, BLOCK = +cfg.block;
    var BLOCK_HOURS = +cfg.blockHours, MAXU = 200, MAXB = 8;
    var annual = true, timer = null;
    var tiers = [].slice.call(root.querySelectorAll('.tier'));

    function fmt(n) { return '$' + Number(n).toLocaleString('en-US'); }
    /* cta_location = the card's price- class (price-sales-pacing / price-pacing-planning). */
    function loc(t) { return [].filter.call(t.classList, function (c) { return c.indexOf('price-') === 0; })[0] || ''; }
    function track(name, params) {
      try { if (window.pacerTrack) window.pacerTrack(name, params); } catch (e) {}
    }

    /* The selection for one package card: what the visitor would pay each month. */
    function selection(t) {
      var amt = t.querySelector('.amt');
      var s = { plan: t.dataset.plan, billing: annual ? 'annual' : 'monthly',
                value: Number(annual ? amt.dataset.a : amt.dataset.m),
                pacer_users: 0, planning_users: 0, hour_blocks: 0, extra_users: 0 };
      t.querySelectorAll('.opts .blocks').forEach(function (r) {
        var n = Number(r.dataset.n);
        if (r.dataset.kind === 'block') { s.hour_blocks = n; s.value += n * BLOCK; return; }
        if (r.dataset.agent === 'planning') s.planning_users = n; else s.pacer_users = n;
        var add = Math.max(0, n - INCLUDED);
        s.extra_users += add;
        s.value += add * (annual ? SEAT_A : SEAT_M);
      });
      return s;
    }

    function render() {
      root.querySelectorAll('.seatp').forEach(function (e) { e.textContent = fmt(annual ? SEAT_A : SEAT_M); });
      root.querySelector('.js-bill').setAttribute('aria-checked', String(annual));
      root.querySelector('.js-lbl-a').classList.toggle('on', annual);
      root.querySelector('.js-lbl-m').classList.toggle('on', !annual);
      tiers.forEach(function (t) {
        t.querySelectorAll('.opts .blocks').forEach(function (r) {
          var n = Number(r.dataset.n), max = r.dataset.kind === 'block' ? MAXB : MAXU;
          r.querySelector('output').textContent = n;
          var b = r.querySelectorAll('.step button');
          b[0].disabled = n <= Number(r.dataset.min);
          b[1].disabled = n >= max;
        });
        var s = selection(t), notes = [];
        t.querySelector('.amt').textContent = fmt(s.value);
        if (s.extra_users) notes.push(s.extra_users + ' additional user' + (s.extra_users > 1 ? 's' : ''));
        if (s.hour_blocks) notes.push(s.hour_blocks * BLOCK_HOURS + ' hrs/mo');
        var tail = notes.length ? ' &middot; includes ' + notes.join(' + ') : '';
        t.querySelector('.sub').innerHTML = annual
          ? '<b>' + fmt(s.value * 12) + '</b> Annual contract billed monthly' + tail
          : 'Month-to-month, no annual commitment' + tail;
      });
    }

    /* One pricing_estimate per burst of changes, for the card the visitor last touched. */
    function changed(t) {
      render();
      clearTimeout(timer);
      timer = setTimeout(function () {
        [].concat(t ? [t] : tiers).forEach(function (x) {
          var s = selection(x);
          track('pricing_estimate', { plan: s.plan, billing: s.billing, value: s.value, currency: 'USD',
                                      cta_location: loc(x) });
        });
      }, 1500);
    }

    root.querySelectorAll('.opts .blocks').forEach(function (r) {
      r.querySelectorAll('.step button').forEach(function (b) {
        b.addEventListener('click', function () {
          var max = r.dataset.kind === 'block' ? MAXB : MAXU;
          r.dataset.n = Math.min(max, Math.max(Number(r.dataset.min), Number(r.dataset.n) + Number(b.dataset.d)));
          changed(r.closest('.tier'));
        });
      });
    });
    root.querySelector('.js-bill').addEventListener('click', function () { annual = !annual; changed(null); });
    root.querySelector('.js-lbl-a').addEventListener('click', function () { annual = true; changed(null); });
    root.querySelector('.js-lbl-m').addEventListener('click', function () { annual = false; changed(null); });

    /* Choose: recorded in GA4 now; it opens the order card once that ships. */
    root.querySelectorAll('.js-choose').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.closest('.tier'), s = selection(t);
        track('pricing_choose', { plan: s.plan, billing: s.billing, value: s.value, currency: 'USD',
                                  pacer_users: s.pacer_users, planning_users: s.planning_users,
                                  hour_blocks: s.hour_blocks, cta_location: loc(t) });
        if (typeof window.pacerOpenOrder === 'function') window.pacerOpenOrder(s, root.dataset.priceBook);
      });
    });

    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
