// GA4 bridge for the demo videos (homepage `/` here, `/v/<slug>` on staging).
//
// GA4 runs on the parent page (getpacerai.com); a cross-site iframe can't reach it, so the video tells the
// parent what happened and footer.js section 0 sends the GA4 event. Injected at serve time, before </body>,
// so a re-promoted video (promote.sh / build_pacing_video.py) never loses it.
// Events: demo_video_complete (end card shown), demo_video_replay, demo_video_review, and try_demo_click
// for the end-card / review-bar "Try the Demo" links. Params: video (which video), cta_location.
export const VIDEO_BRIDGE = `<script>
(function(){
  if (window.parent === window) return;
  var video = location.pathname === '/' ? 'homepage' : location.pathname.replace(/^\\/v\\//, '').replace(/\\/$/, '');
  function report(name, params){
    try { params = params || {}; params.video = video;
      window.parent.postMessage({type: 'pacer:event', name: name, params: params}, 'https://getpacerai.com'); } catch (e) {}
  }
  function where(el){ return el.closest('#end') ? 'video_end_card' : (el.closest('#rbar') ? 'video_review_bar' : 'video'); }
  document.addEventListener('click', function(e){
    var el = e.target && e.target.closest ? e.target.closest('a,button') : null;
    if (!el) return;
    var id = el.id || '', href = el.getAttribute('href') || '';
    if (/^replay/.test(id)) report('demo_video_replay', {cta_location: where(el)});
    else if (id === 'review') report('demo_video_review', {cta_location: where(el)});
    else if (href.indexOf('demo-connect') !== -1) report('try_demo_click', {cta_location: where(el)});
  }, true);
  var end = document.getElementById('end'), shown = false;
  if (end && window.MutationObserver) new MutationObserver(function(){
    var on = end.classList.contains('show');
    if (on && !shown) report('demo_video_complete', {cta_location: 'video_end_card'});
    shown = on;
  }).observe(end, {attributes: true, attributeFilter: ['class']});
})();
</script>`;

export function withVideoBridge(html: string): string {
  const i = html.lastIndexOf("</body>");
  return i === -1 ? html + VIDEO_BRIDGE : html.slice(0, i) + VIDEO_BRIDGE + html.slice(i);
}
