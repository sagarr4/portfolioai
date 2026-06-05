// Surgical blur-gate helper
// Takes raw portfolio HTML and returns gated version with hero free + content below blurred

function findHeroSplitPoint(html: string): number {
  // Match <header class="hero..."> OR <section class="hero...">
  const heroMatch = html.match(/<(header|section)[^>]*class="[^"]*hero[^"]*"/i)
  
  if (!heroMatch) {
    // Fallback: try finding closing of first major section
    const firstClose = html.indexOf('</section>')
    const firstHeaderClose = html.indexOf('</header>')
    if (firstClose === -1 && firstHeaderClose === -1) return html.length
    if (firstClose === -1) return firstHeaderClose + 9
    if (firstHeaderClose === -1) return firstClose + 10
    return Math.min(firstClose + 10, firstHeaderClose + 9)
  }
  
  const tagName = heroMatch[1]
  const heroStart = heroMatch.index!
  let depth = 1
  let pos = heroStart + heroMatch[0].length
  const openRe = new RegExp('<' + tagName + '\\b', 'gi')
  const closeRe = new RegExp('</' + tagName + '>', 'gi')
  
  while (depth > 0 && pos < html.length) {
    openRe.lastIndex = pos
    closeRe.lastIndex = pos
    const nextOpen = openRe.exec(html)
    const nextClose = closeRe.exec(html)
    
    if (!nextClose) return html.length
    
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++
      pos = nextOpen.index + nextOpen[0].length
    } else {
      depth--
      if (depth === 0) {
        return nextClose.index + nextClose[0].length
      }
      pos = nextClose.index + nextClose[0].length
    }
  }
  
  return html.length
}

export function applyBlurGate(html: string, portfolioId: string, hoursRemaining: number): string {
  const splitPoint = findHeroSplitPoint(html)
  
  if (splitPoint <= 0 || splitPoint >= html.length) {
    // Couldn't find hero, return unchanged
    return html
  }
  
  const preBlur = html.substring(0, splitPoint)
  let postBlur = html.substring(splitPoint)
  
  // Strip closing body/html from postBlur (we'll add them back later)
  postBlur = postBlur.replace(/<\/body>/i, '').replace(/<\/html>/i, '')
  
  const pricingUrl = '/pricing?portfolio_id=' + portfolioId
  
  const gateStyles = `<style id="pai-gate-styles">
  #pai-locked {
    position: relative;
    filter: blur(10px) brightness(0.5) saturate(0.7);
    pointer-events: none;
    user-select: none;
    -webkit-user-select: none;
  }
  #pai-lock-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at center, rgba(8,8,6,0.4) 0%, rgba(8,8,6,0.85) 70%, rgba(8,8,6,0.95) 100%);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    z-index: 99996;
    pointer-events: none;
  }
  #pai-unlock-card {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 99999;
    background: #0c0a08;
    border: 1px solid rgba(201,169,110,.4);
    border-radius: 12px;
    padding: 36px 32px;
    max-width: 440px;
    width: calc(100% - 40px);
    box-shadow: 0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(201,169,110,.1);
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    text-align: center;
  }
  #pai-unlock-badge {
    display: inline-block;
    background: rgba(201,169,110,.12);
    border: 1px solid rgba(201,169,110,.3);
    color: #c9a96e;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .18em;
    text-transform: uppercase;
    padding: 6px 12px;
    border-radius: 3px;
    margin-bottom: 18px;
  }
  #pai-unlock-card h2 {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 24px;
    font-weight: 700;
    color: #f5f0e8;
    margin: 0 0 12px;
    letter-spacing: -.02em;
    line-height: 1.2;
  }
  #pai-unlock-card p {
    font-size: 14px;
    color: rgba(245,240,232,.6);
    margin: 0 0 24px;
    line-height: 1.6;
    font-weight: 300;
  }
  #pai-unlock-card p strong {
    color: #c9a96e;
    font-weight: 600;
  }
  #pai-unlock-btn {
    display: block;
    background: #c9a96e;
    color: #0c0a08;
    padding: 15px 28px;
    border-radius: 5px;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
    letter-spacing: .02em;
    transition: background .2s;
    margin-bottom: 14px;
  }
  #pai-unlock-btn:hover { background: #dbb97e; }
  #pai-unlock-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 11px;
    color: rgba(245,240,232,.4);
    letter-spacing: .04em;
    flex-wrap: wrap;
  }
  #pai-unlock-meta .dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(245,240,232,.25);
  }
  #pai-unlock-meta .warn {
    color: #c9a96e;
    font-weight: 600;
  }
  @media (max-width: 600px) {
    #pai-unlock-card { padding: 28px 24px; max-width: calc(100% - 32px); }
    #pai-unlock-card h2 { font-size: 20px; }
  }
</style>`

  const gateContent = `<div id="pai-locked">${postBlur}</div>
<div id="pai-lock-overlay"></div>
<div id="pai-unlock-card">
  <div id="pai-unlock-badge">Preview</div>
  <h2>Unlock your full portfolio</h2>
  <p>You've seen the hero. Publish for <strong>$4.99</strong> to unlock the full About, all projects, complete skills, contact details, and get a live shareable URL forever.</p>
  <a id="pai-unlock-btn" href="${pricingUrl}">Publish for $4.99 →</a>
  <div id="pai-unlock-meta">
    <span>One-time</span>
    <div class="dot"></div>
    <span>Yours forever</span>
    <div class="dot"></div>
    <span class="warn">Reserved ${hoursRemaining}h</span>
  </div>
</div>
<script>
  document.addEventListener('contextmenu', function(e) {
    if (e.target.closest('#pai-locked')) e.preventDefault();
  });
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 's' || e.key === 'p')) {
      e.preventDefault();
    }
  });
</script>
</body></html>`

  // Inject styles into head, replace content below hero with gated version
  let result = preBlur
  if (result.includes('</head>')) {
    result = result.replace('</head>', gateStyles + '</head>')
  } else {
    result = gateStyles + result
  }
  result += gateContent
  
  return result
}
