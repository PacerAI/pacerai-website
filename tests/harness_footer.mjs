// Runs src/wpcode/footer.js in a sandbox shaped like a page, for the Python tests. Not a test file itself.
//
// stdin: {"footer": path, "url": the page's URL, "referrer": "", "anchors": [href, ...], "call": [href, ...]}
//   anchors  the claude.ai add links on the page: what document.querySelectorAll returns for a selector naming
//            claude.ai/customize/connectors. Every other selector finds nothing, so the other sections exit.
//   call     hrefs to pass to window.pacerConnectorHref after the script has run.
// stdout: {"has_function": bool, "called": [result, ...], "anchors": [href after the script ran, ...]}
import vm from "node:vm";
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf8"));
const source = readFileSync(input.footer, "utf8");
const noop = () => {};
const store = {};

function anchor(href) {
  const attrs = { href };
  return {
    tagName: "A",
    getAttribute: (name) => (name in attrs ? attrs[name] : null),
    setAttribute: (name, value) => { attrs[name] = String(value); },
    get href() { return attrs.href; },
    set href(value) { attrs.href = String(value); },
    addEventListener: noop,
    dataset: {},
    _attrs: attrs,
  };
}

const anchors = (input.anchors || []).map(anchor);
const document = {
  referrer: input.referrer || "",
  readyState: "complete",
  body: {},
  addEventListener: noop,
  querySelectorAll: (selector) => (String(selector).includes("claude.ai/customize/connectors") ? anchors.slice() : []),
  querySelector: () => null,
  getElementById: () => null,
  createElement: () => ({ style: {}, setAttribute: noop, appendChild: noop, addEventListener: noop }),
};
const location = new URL(input.url);
const window = {
  location,
  document,
  addEventListener: noop,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
  sessionStorage: { getItem: () => null, setItem: noop },
  matchMedia: () => ({ matches: false, addEventListener: noop, addListener: noop }),
  innerWidth: 1280,
};
window.window = window;

const context = vm.createContext({
  window, document, location, URL, URLSearchParams, JSON, Date, Math, console,
  navigator: { userAgent: "node" }, localStorage: window.localStorage, sessionStorage: window.sessionStorage,
  setTimeout: noop, setInterval: noop, clearTimeout: noop, clearInterval: noop,
});
vm.runInContext(source, context, { filename: input.footer });

const fn = window.pacerConnectorHref;
process.stdout.write(JSON.stringify({
  has_function: typeof fn === "function",
  called: typeof fn === "function" ? (input.call || []).map((href) => fn(href)) : [],
  anchors: anchors.map((a) => a._attrs.href),
}));
