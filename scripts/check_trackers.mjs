// Tracker check — which analytics calls a page really makes, seen by a logged-out visitor.
//
// Why: Site Kit hides Google tags from logged-in admins and browser extensions block trackers,
// so "view source" or your own browser can't tell you whether a tag works. This records the
// network calls of a clean headless Chrome and prints only third-party traffic.
//
// Usage (from the repo root):
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
//     --remote-debugging-port=9333 --user-data-dir=/tmp/pacer-trackers --no-first-run about:blank &
//   node scripts/check_trackers.mjs https://getpacerai.com/team/
//   pkill -f remote-debugging-port=9333
//
// Read the output: one Apollo `can_track_visitor` call with x_app_id=69cc4a06…, a GA4
// `g/collect?…tid=G-CS8XR6P08G`, gtm.js (empty container), and nothing from snitcher.
// ERR_ABORTED on a beacon POST is normal in headless Chrome. A 400 is not.
const url = process.argv[2];
const ver = await (await fetch('http://127.0.0.1:9333/json/version')).json();
const ws = new WebSocket(ver.webSocketDebuggerUrl);
let id = 0; const pending = new Map(); const reqs = new Map();
const send = (method, params = {}, sessionId) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const RX = /^(?!https:\/\/(getpacerai\.com|i0\.wp\.com|fonts\.|s0\.wp\.com|c0\.wp\.com|pacer-demo-worker))https?:/i;
ws.onmessage = ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); return; }
  if (m.method === 'Network.requestWillBeSent' && RX.test(m.params.request.url)) {
    const u = m.params.request.url; reqs.set(m.params.requestId, { method: m.params.request.method, url: u.length > 230 ? u.slice(0, 230) + '…' : u, post: (m.params.request.postData || '').slice(0, 300) });
  }
  if (m.method === 'Network.responseReceived' && reqs.has(m.params.requestId)) reqs.get(m.params.requestId).status = m.params.response.status;
  if (m.method === 'Network.loadingFailed' && reqs.has(m.params.requestId)) reqs.get(m.params.requestId).status = 'FAILED ' + m.params.errorText;
};
await new Promise(r => ws.onopen = r);
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Network.enable', {}, sessionId);
await send('Page.navigate', { url }, sessionId);
await new Promise(r => setTimeout(r, 25000));
for (const r of reqs.values()) console.log(r.status, r.method, r.url, r.post ? ' BODY:' + r.post : '');
await send('Target.closeTarget', { targetId });
ws.close(); process.exit(0);
