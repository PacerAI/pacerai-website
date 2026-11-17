/* ================================================================
 * WPCode JavaScript Snippet — "Ask an AI assistant" icons
 * ================================================================
 * Paste this file into a NEW WPCode JavaScript snippet (it auto-wraps
 * <script> tags). Do not paste it into the existing Header & Footer
 * Footer field — a bad paste there once took down every site script.
 *
 * Do not put a literal closing script tag in this file.
 *
 * The snippet looks for empty hooks already in the page HTML:
 *   <div class="pacer-ask-ai" data-prompt="what-is-pacer-ai"></div>
 *   <div class="pacer-ask-ai" data-prompt="bottom-up-forecasting"></div>
 *   <div class="pacer-ask-ai" data-prompt="bottom-up-planning"></div>
 *
 * Empty hooks stay hidden until this snippet fills them.
 *
 * Prompt behavior (verified from public docs, Nov 2026; curl only for
 * HTTP reachability — Claude's origin returns a Cloudflare challenge
 * to automated clients):
 *   Claude   https://claude.ai/new?q=     prefills, does not auto-send
 *   ChatGPT  https://chatgpt.com/?q=      prefills; usually does not
 *                                         auto-send from a third-party click
 *   Grok     https://grok.com/?q=         often auto-sends, or asks
 *                                         "Send this message?"; sign-in required
 *   Copilot  https://copilot.com/?q=      copilot.microsoft.com 301s here
 *                                         and keeps ?q=. Prefill is unreliable:
 *                                         late-2025 reports say the query may
 *                                         show as a heading, and a Nov 13 2026
 *                                         logged-out test saw the prompt drop
 *                                         on sign-in. Do not add autorun=1.
 */
(function () {
  var hooks = document.querySelectorAll(".pacer-ask-ai[data-prompt]");
  if (!hooks.length) return;

  var PROMPTS = {"what-is-pacer-ai": {"label": "Ask: What is Pacer AI?", "text": "What is Pacer AI (getpacerai.com), the bottom-up sales forecast agent for CROs, VP Sales, RevOps, and CFOs at B2B companies with $10M+ recurring revenue?"}, "bottom-up-forecasting": {"label": "Ask: What is bottom-up sales forecasting?", "text": "What is bottom-up sales forecasting? Explain how Pacer AI (getpacerai.com), the bottom-up sales forecast agent, builds the number from booked revenue and open pipeline, then reconciles it to Finance, for CROs, VP Sales, RevOps, and CFOs at B2B companies with $10M+ recurring revenue."}, "bottom-up-planning": {"label": "Ask: What is bottom-up planning?", "text": "What is bottom-up planning? Explain how Pacer AI (getpacerai.com), the bottom-up sales forecast agent, helps CROs, VP Sales, RevOps, and CFOs at B2B companies with $10M+ recurring revenue build a plan that reconciles to Finance."}};

  var ASSISTANTS = [
    { name: "Claude", key: "claude", href: function (q) { return "https://claude.ai/new?q=" + q; } },
    { name: "ChatGPT", key: "chatgpt", href: function (q) { return "https://chatgpt.com/?q=" + q; } },
    { name: "Grok", key: "grok", href: function (q) { return "https://grok.com/?q=" + q; } },
    { name: "Copilot", key: "copilot", href: function (q) { return "https://copilot.com/?q=" + q; } }
  ];

  if (!document.getElementById("pacer-ask-ai-styles")) {
    var style = document.createElement("style");
    style.id = "pacer-ask-ai-styles";
    style.textContent =
      ".pacer-ask-ai:empty{display:none}" +
      ".pacer-ask-ai{margin:12px 0 0;font-family:Arial,Helvetica,sans-serif}" +
      ".pacer-ask-ai .pacer-ask-ai-label{display:block;margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#3A4652}" +
      ".pacer-ask-ai .pacer-ask-ai-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}" +
      ".pacer-ask-ai a.pacer-ask-ai-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid #cfd4da;border-radius:999px;background:#fff;color:#061F32;text-decoration:none;font-size:13px;font-weight:600;line-height:1.2}" +
      ".pacer-ask-ai a.pacer-ask-ai-btn:hover,.pacer-ask-ai a.pacer-ask-ai-btn:focus{border-color:#22A3DF;color:#061F32;outline:2px solid #22A3DF;outline-offset:2px}" +
      ".pacer-ask-ai a.pacer-ask-ai-btn svg{width:14px;height:14px;flex:0 0 14px}" +
      ".pacer-ask-ai .pacer-ask-ai-note{margin:6px 0 0;font-size:11px;color:#6b7280}";
    document.head.appendChild(style);
  }

  function monogram(letter) {
    return '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="7.25" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="8" y="11.25" text-anchor="middle" font-size="8" font-family="Arial,sans-serif" font-weight="700" fill="currentColor">' + letter + "</text></svg>";
  }

  hooks.forEach(function (hook) {
    if (hook.childElementCount) return;
    var key = hook.getAttribute("data-prompt");
    var prompt = PROMPTS[key];
    if (!prompt) return;
    var q = encodeURIComponent(prompt.text);
    var label = document.createElement("span");
    label.className = "pacer-ask-ai-label";
    label.textContent = prompt.label;
    var row = document.createElement("div");
    row.className = "pacer-ask-ai-row";
    row.setAttribute("role", "list");
    ASSISTANTS.forEach(function (a) {
      var link = document.createElement("a");
      link.className = "pacer-ask-ai-btn";
      link.setAttribute("role", "listitem");
      link.href = a.href(q);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "Ask " + a.name + ": " + prompt.text);
      link.innerHTML = monogram(a.name.charAt(0)) + a.name;
      row.appendChild(link);
    });
    hook.appendChild(label);
    hook.appendChild(row);
  });
})();
