// Serve-time clean-up applied to every generated portfolio's stored HTML right
// before it is sent to the browser (see src/app/portfolio/[slug]/route.ts).
//
// Doing this at serve time (not at generation time) means EVERY portfolio,
// including ones generated long ago, gets fixed immediately with no
// regeneration and no database backfill. Each function is pure and idempotent.

const MONTH = '(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\.?'
const YEAR = '(?:19|20)\\d{2}'
const NOW = '(?:Present|Now|Ongoing|Current|Today)'

// Applies `fn` only to the parts of the document that are NOT <script> or <style>
// blocks, so JavaScript and CSS are never touched by text clean-up.
function outsideScriptsAndStyles(html: string, fn: (chunk: string) => string): string {
  return html
    .split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/gi)
    .map((part, i) => (i % 2 === 1 ? part : fn(part)))
    .join('')
}

/**
 * Old behaviour: every em dash AND en dash became a comma, which turned
 * "Dec 2021 – Present" into "Dec 2021 , Present" and "01 — PROFILE" into
 * "01 , PROFILE". New behaviour keeps the "no em dash" style but stays correct:
 *  - date ranges keep a proper en dash:      Dec 2021 – Present
 *  - leading decorative dashes are dropped:  "— About"  ->  "About"
 *  - numbered labels use a middle dot:       01 — PROFILE  ->  01 · PROFILE
 *  - any other spaced dash becomes a comma:  "forward — across"  ->  "forward, across"
 */
export function normalizeDashes(html: string): string {
  return outsideScriptsAndStyles(html, (t) => {
    let s = t
    // 0. decorative dash at the very start of a text node: <span>— About</span>
    s = s.replace(/(>)\s*[—–]\s+(?=[A-Za-z0-9])/g, '$1')
    // 1. date ranges (left token is a year / month / Present, right token starts a date)
    const left = `\\b(${YEAR}|${NOW}|${MONTH})`
    const rightAhead = `(?=(?:${MONTH}\\s+)?(?:${YEAR}|${NOW}))`
    s = s.replace(new RegExp(left + '\\s*[—–]\\s*' + rightAhead, 'gi'), '$1 \u0001 ')
    // 2. numbered section labels: "01 — PROFILE"
    s = s.replace(/(>\s*\d{1,2})\s*[—–]\s*(?=[A-Za-z])/g, '$1 · ')
    // 3. everything else: spaced dashes and any unspaced em dash become ", "
    s = s.replace(/\s+[—–]\s+/g, ', ').replace(/\s*—\s*/g, ', ')
    // restore the date-range dashes protected in step 1
    return s.replace(/\u0001/g, '–')
  })
}

/**
 * The old fix for "hidden until animated" content was a blunt global
 * split('opacity:0').join('opacity:1'), which also mangled every decimal
 * opacity: 0.55 became 1.55 (fully solid), 0.14 became 1.14, and so on.
 * This only touches an opacity that is exactly zero.
 */
export function forceVisibleOpacity(html: string): string {
  return html.replace(/opacity\s*:\s*0(?![.\d])/g, 'opacity:1')
}

/** Footer copyright years the model wrote from its training data become the current year. */
export function refreshFooterYear(html: string, year = new Date().getFullYear()): string {
  return html.replace(/<footer[\s\S]*?<\/footer>/gi, (footer) =>
    footer.replace(/(©|&copy;|Copyright)(\s*)(?:19|20)\d{2}/gi, `$1$2${year}`)
  )
}

/**
 * Stored pages contain a preview bar written at generation time (older ones say
 * $4.99). The serve route adds its own current bar, so drop every stored one to
 * avoid a stale price and two stacked bars.
 */
export function stripStoredWatermarks(html: string): string {
  return html.replace(/<!-- watermark -->[\s\S]*?<!-- end watermark -->/g, '')
}

export const REVEAL_FIX_ID = 'pai-reveal-fix'

// Why this exists: generated pages hide headings with `clip-path: inset(0 100% 0 0)`
// until an IntersectionObserver adds an "in" class. Browsers never report a fully
// clipped element as intersecting, so those headings (often the hero NAME and every
// section title) stay invisible forever and leave large empty gaps. This finds every
// element that is fully clipped, or that uses a reveal-style class name, and
// reveals it when it is near the viewport using scroll position instead.
const REVEAL_FIX_SCRIPT = `<script id="${REVEAL_FIX_ID}">
(function () {
  var NAMED = '[class*="reveal"],[class*="wipe"],[class*="clip"],[class*="word"],[class*="draw"],[class*="split"],[class*="stagger"],[class*="mask"]';
  var seen = new WeakSet();
  var tracked = [];
  var done = new WeakSet();
  var queued = false;

  function fullyClipped(el) {
    var c = getComputedStyle(el).clipPath;
    return !!c && c !== 'none' && c.indexOf('inset(') === 0 && c.indexOf('100%') !== -1;
  }
  function scan() {
    if (!document.body) return;
    var all = document.body.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (seen.has(el)) continue;
      if (el.matches(NAMED) || fullyClipped(el)) { seen.add(el); tracked.push(el); }
    }
  }
  function sweep() {
    queued = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = 0; i < tracked.length; i++) {
      var el = tracked[i];
      if (done.has(el)) continue;
      var r = el.getBoundingClientRect();
      if (r.top < vh + 200 && r.bottom > -200) {
        done.add(el);
        el.classList.add('in');
        // If the page's own CSS did not un-clip it (it may use a different class name),
        // set the visible clip-path directly. inset() -> inset() still animates.
        (function (node) {
          setTimeout(function () {
            if (fullyClipped(node)) node.style.setProperty('clip-path', 'inset(0 0 0 0)');
          }, 1100);
        })(el);
      }
    }
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(sweep); } }
  function start() {
    scan(); sweep();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    setTimeout(function () { scan(); sweep(); }, 400);
    setTimeout(function () { scan(); sweep(); }, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
</script>`

export function injectRevealFix(html: string): string {
  if (html.includes(`id="${REVEAL_FIX_ID}"`)) return html
  const i = html.lastIndexOf('</body>')
  return i === -1 ? html + REVEAL_FIX_SCRIPT : html.slice(0, i) + REVEAL_FIX_SCRIPT + html.slice(i)
}

/** Everything above, in the right order. */
export function applyServeFixes(html: string): string {
  let out = stripStoredWatermarks(html)
  out = normalizeDashes(out)
  out = forceVisibleOpacity(out)
  out = refreshFooterYear(out)
  out = injectRevealFix(out)
  return out
}
