/* /pricing/ page behaviour (Price Book v2.0): the Month to month | 12 months toggle, the seat steppers on
 * the three license cards, the team total, and the GA4 events. WordPress strips <script> from page
 * content, so scripts/build_pricing.py inlines this file into an <img onerror> at the end of the page.
 *
 * No price lives in this file. Every number is read from data- attributes that build_pricing.py writes
 * from the Price Book (foundation/pricing/product-pricing-price-book.md): each card's .amt carries
 * data-m (per user a month) and data-a (per user, 12-month contract). Seats are pure: installation and
 * services are priced separately and never enter the total.
 *
 * GA4 (through window.pacerTrack from WPCode footer.js section 0):
 *   pricing_estimate  1.5 s after the last toggle or seat change     plan, billing, value, currency, seats
 *   pricing_choose    a click on Purchase                            plan, billing, value, currency, seats
 *   pricing_request   the order card saved the request and sent      plan, billing, value, currency
 *                     the emails (postMessage from the Worker)
 * value is the monthly total on month to month and the 12-month total on a 12-month contract.
 */
(function () {
  if (window.__paPricing) return;
  function start() {
    var root = document.querySelector('#pacerai-homepage .pricing-seats');
    if (!root || window.__paPricing) return;
    window.__paPricing = 1;

    var cfg = root.dataset, MAX = 500;
    var annual = false, timer = null;
    var cards = [].slice.call(root.querySelectorAll('.tier[data-seat]'));

    function fmt(n) { return '$' + Number(n).toLocaleString('en-US'); }
    function track(name, params) {
      try { if (window.pacerTrack) window.pacerTrack(name, params); } catch (e) {}
    }

    /* The team: seats per license and what it costs on the chosen term. */
    function team() {
      var s = { plan: 'seats', billing: annual ? 'annual' : 'monthly', value: 0, seats: 0,
                rep_seats: 0, manager_seats: 0, slt_seats: 0 };
      cards.forEach(function (c) {
        var n = Number(c.querySelector('.blocks').dataset.n), amt = c.querySelector('.amt');
        s[c.dataset.seat + '_seats'] = n;
        s.seats += n;
        s.value += n * Number(annual ? amt.dataset.a : amt.dataset.m);
      });
      return s;
    }

    function render() {
      root.querySelector('.js-bill').setAttribute('aria-checked', String(annual));
      root.querySelector('.js-lbl-a').classList.toggle('on', annual);
      root.querySelector('.js-lbl-m').classList.toggle('on', !annual);
      cards.forEach(function (c) {
        var amt = c.querySelector('.amt'), r = c.querySelector('.blocks'), n = Number(r.dataset.n);
        amt.textContent = fmt(annual ? amt.dataset.a : amt.dataset.m);
        c.querySelector('.price .per').textContent = annual ? '/user/yr' : '/user/mo';
        r.querySelector('output').textContent = n;
        var b = r.querySelectorAll('.step button');
        b[0].disabled = n <= Number(r.dataset.min);
        b[1].disabled = n >= MAX;
      });
      var s = team(), sub = annual ? '12-month contract, billed monthly' : 'Month to month';
      root.querySelector('.js-seats').innerHTML = s.rep_seats + ' Rep &middot; ' + s.manager_seats +
        ' Manager &middot; ' + s.slt_seats + ' SLT';
      root.querySelector('.js-total').textContent = fmt(s.value);
      root.querySelector('.js-per').textContent = annual ? '/yr' : '/mo';
      if (s.slt_seats > 0) sub += ' &middot; plus ' + root.querySelector('.team').dataset.setup + ' one-time SLT installation';
      root.querySelector('.js-total-sub').innerHTML = sub;
      root.querySelector('.js-choose').disabled = s.seats === 0;
    }

    function params(s) {
      return { plan: s.plan, billing: s.billing, value: s.value, currency: 'USD', rep_seats: s.rep_seats,
               manager_seats: s.manager_seats, slt_seats: s.slt_seats, cta_location: 'pricing_team' };
    }

    /* One pricing_estimate per burst of changes. */
    function changed() {
      render();
      clearTimeout(timer);
      timer = setTimeout(function () { track('pricing_estimate', params(team())); }, 1500);
    }

    cards.forEach(function (c) {
      var r = c.querySelector('.blocks');
      r.querySelectorAll('.step button').forEach(function (b) {
        b.addEventListener('click', function () {
          r.dataset.n = Math.min(MAX, Math.max(Number(r.dataset.min), Number(r.dataset.n) + Number(b.dataset.d)));
          changed();
        });
      });
    });
    root.querySelector('.js-bill').addEventListener('click', function () { annual = !annual; changed(); });
    root.querySelector('.js-lbl-a').addEventListener('click', function () { annual = true; changed(); });
    root.querySelector('.js-lbl-m').addEventListener('click', function () { annual = false; changed(); });

    /* Purchase opens the order card: the Worker's /order page in a modal iframe (data-order-url). The URL
     * carries the seats and first-touch attribution, never an email. Without data-order-url, Purchase
     * only records the click. */
    var ORDER = cfg.orderUrl || '', modal = null, frame = null, ORIGIN = '';
    /* window.URL, not URL: in an inline onerror handler, URL resolves to document.URL (a string). */
    try { ORIGIN = ORDER ? new window.URL(ORDER).origin : ''; } catch (e) { ORDER = ''; }
    function closeOrder() { if (modal) { modal.parentNode.removeChild(modal); modal = null; frame = null; } }
    function openOrder(s) {
      closeOrder();
      var q = ['billing=' + s.billing, 'rep=' + s.rep_seats, 'mgr=' + s.manager_seats, 'slt=' + s.slt_seats,
               'pb=' + encodeURIComponent(cfg.priceBook || ''),
               'page=' + encodeURIComponent(window.location.pathname)];
      var at = {};
      try { if (window.pacerAttr) at = window.pacerAttr() || {}; } catch (e) {}
      ['utm_source', 'utm_medium', 'utm_campaign', 'landing'].forEach(function (k) {
        if (at[k]) q.push(k + '=' + encodeURIComponent(String(at[k]).slice(0, 200)));
      });
      modal = document.createElement('div');
      modal.className = 'order-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Your order');
      var box = document.createElement('div'), x = document.createElement('button');
      box.className = 'order-box';
      x.className = 'order-close'; x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.innerHTML = '&times;';
      frame = document.createElement('iframe');
      frame.title = 'Your order';
      frame.src = ORDER + '?' + q.join('&');
      box.appendChild(x); box.appendChild(frame); modal.appendChild(box);
      document.getElementById('pacerai-homepage').appendChild(modal);
      x.addEventListener('click', closeOrder);
      modal.addEventListener('click', function (e) { if (e.target === modal) closeOrder(); });
      x.focus();
    }
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeOrder(); });
    window.addEventListener('message', function (e) {
      if (!ORIGIN || e.origin !== ORIGIN || !e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'pacer:resize' && frame) {
        frame.style.height = Math.min(Math.max(Number(e.data.height) || 0, 320), 1800) + 'px';
      } else if (e.data.type === 'pacer:event' && e.data.name === 'pricing_request') {
        var p = e.data.params || {};
        track('pricing_request', { plan: String(p.plan || ''), billing: String(p.billing || ''),
                                   value: Number(p.value) || 0, currency: 'USD', cta_location: 'order_card' });
        if (window.pacerSetUser && p.user_id) window.pacerSetUser(String(p.user_id));
      }
    });

    root.querySelector('.js-choose').addEventListener('click', function () {
      var s = team();
      if (!s.seats) return;
      track('pricing_choose', params(s));
      if (ORDER) openOrder(s);
    });

    render();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
