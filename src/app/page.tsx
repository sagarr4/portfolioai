'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoaded(true), 80)
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('vis')),
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
    )
    document.querySelectorAll('.r').forEach(el => io.observe(el))
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const nav = Math.min(scrollY / 100, 1)

  return (
    <div style={{background:'#0c0a08',color:'#f5f0e8',fontFamily:"'Playfair Display',serif",overflowX:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}body{-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:#3a2e20}
        .r{opacity:0;transform:translateY(36px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
        .r.vis{opacity:1;transform:none}
        .d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}
        .hi{opacity:0;transform:translateY(20px);transition:opacity 1.2s cubic-bezier(.16,1,.3,1),transform 1.2s cubic-bezier(.16,1,.3,1)}
        .hi.go{opacity:1;transform:none}
        .NAV{position:fixed;top:0;left:0;right:0;z-index:999;height:76px;padding:0 72px;display:flex;align-items:center;justify-content:space-between;transition:all .4s}
        .logo{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#f5f0e8;text-decoration:none;letter-spacing:-.02em}
        .logo b{color:#c9a96e;font-weight:700}
        .nav-mid{position:absolute;left:50%;transform:translateX(-50%);display:flex;gap:44px}
        .nav-mid a{font-family:'DM Sans',sans-serif;font-size:13px;color:rgba(245,240,232,.4);text-decoration:none;transition:color .2s;letter-spacing:.02em}
        .nav-mid a:hover{color:#f5f0e8}
        .nav-cta{font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;color:#0c0a08;background:#c9a96e;padding:11px 28px;border-radius:3px;text-decoration:none;transition:all .25s}
        .nav-cta:hover{background:#dbb97e;transform:translateY(-1px)}
        .HERO{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:120px 40px 80px;position:relative;overflow:hidden}
        .hbg{position:absolute;inset:0;background:radial-gradient(ellipse 90% 55% at 50% 100%,rgba(201,169,110,.12) 0%,transparent 55%),linear-gradient(160deg,#0c0a08,#110f0a 50%,#141008);pointer-events:none}
        .hline{position:absolute;top:0;left:50%;transform:translateX(-50%);width:1px;height:100%;background:linear-gradient(to bottom,transparent,rgba(201,169,110,.18) 35%,rgba(201,169,110,.07) 70%,transparent);pointer-events:none}
        .kicker{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#c9a96e;margin-bottom:44px;display:flex;align-items:center;gap:16px;position:relative;z-index:1}
        .kline{width:48px;height:1px;background:rgba(201,169,110,.45)}
        .H1{font-size:clamp(60px,10vw,140px);font-weight:800;line-height:.9;letter-spacing:-.055em;color:#f5f0e8;max-width:1100px;position:relative;z-index:1;margin-bottom:0}
        .H1 em{font-style:italic;color:#c9a96e;font-weight:700}
        .vline{width:1px;height:72px;background:linear-gradient(to bottom,rgba(201,169,110,.5),transparent);margin:44px auto;position:relative;z-index:1}
        .hsub{font-family:'DM Sans',sans-serif;font-size:clamp(16px,1.7vw,20px);font-weight:300;line-height:1.75;color:rgba(245,240,232,.45);max-width:520px;margin-bottom:52px;position:relative;z-index:1}
        .hbtns{display:flex;align-items:center;gap:16px;margin-bottom:72px;flex-wrap:wrap;justify-content:center;position:relative;z-index:1}
        .bgold{font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;color:#0c0a08;background:#c9a96e;padding:17px 48px;border-radius:3px;text-decoration:none;transition:all .3s;box-shadow:0 4px 32px rgba(201,169,110,.28)}
        .bgold:hover{background:#dbb97e;transform:translateY(-2px);box-shadow:0 8px 48px rgba(201,169,110,.38)}
        .bghost{font-family:'DM Sans',sans-serif;font-size:15px;font-weight:500;color:rgba(245,240,232,.5);padding:17px 36px;border-radius:3px;text-decoration:none;transition:all .25s;border:1px solid rgba(245,240,232,.13)}
        .bghost:hover{color:#f5f0e8;border-color:rgba(245,240,232,.32)}
        .htrust{font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(245,240,232,.22);display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;position:relative;z-index:1;letter-spacing:.03em}
        .tdot{width:3px;height:3px;border-radius:50%;background:rgba(201,169,110,.4)}
        .TICKER{border-top:1px solid rgba(245,240,232,.06);border-bottom:1px solid rgba(245,240,232,.06);padding:22px 0;overflow:hidden}
        .ttrack{display:flex;width:max-content;animation:t 38s linear infinite}
        @keyframes t{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .titem{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:.2em;text-transform:uppercase;color:rgba(245,240,232,.18);padding:0 52px;white-space:nowrap;display:flex;align-items:center;gap:52px}
        .titem::after{content:'—';color:rgba(201,169,110,.28)}
        .SEC{padding:160px 72px;max-width:1300px;margin:0 auto}
        .SEC2{padding:0 72px 160px;max-width:1300px;margin:0 auto}
        .DARK{background:#080705;border-top:1px solid rgba(245,240,232,.05);border-bottom:1px solid rgba(245,240,232,.05)}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:120px;align-items:center}
        .ey{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#c9a96e;margin-bottom:20px;display:flex;align-items:center;gap:16px}
        .ey::before{content:'';width:48px;height:1px;background:rgba(201,169,110,.45);display:block}
        .DH{font-size:clamp(40px,5.2vw,72px);font-weight:700;line-height:1.0;letter-spacing:-.045em;color:#f5f0e8}
        .DH em{font-style:italic;color:#c9a96e}
        .BT{font-family:'DM Sans',sans-serif;font-size:17px;font-weight:300;line-height:1.8;color:rgba(245,240,232,.42)}
        .BT p{margin-bottom:24px}
        .BT strong{color:rgba(245,240,232,.8);font-weight:500}
        .grule{width:40px;height:1px;background:#c9a96e;margin-bottom:28px}
        .sgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(245,240,232,.06)}
        .ST{background:#0c0a08;padding:60px 52px;transition:background .4s;position:relative}
        .ST:hover{background:#100e0a}
        .sn{font-family:'Playfair Display',serif;font-size:80px;font-weight:800;color:rgba(201,169,110,.07);letter-spacing:-.05em;line-height:1;margin-bottom:36px}
        .sh{font-size:28px;font-weight:700;letter-spacing:-.035em;color:#f5f0e8;margin-bottom:18px;line-height:1.1}
        .sp{font-family:'DM Sans',sans-serif;font-size:15px;font-weight:300;color:rgba(245,240,232,.38);line-height:1.8}
        .pgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;background:rgba(245,240,232,.05)}
        .PI{background:#080705;padding:44px 36px;transition:background .4s,transform .4s;cursor:default;position:relative}
        .PI:hover{background:#0f0d09;transform:translateY(-5px);z-index:1}
        .pn{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;letter-spacing:.12em;color:rgba(201,169,110,.3);margin-bottom:28px}
        .pname{font-size:21px;font-weight:700;letter-spacing:-.03em;color:#f5f0e8;margin-bottom:10px;line-height:1.1}
        .proles{font-family:'DM Sans',sans-serif;font-size:12px;font-weight:300;color:rgba(245,240,232,.28);line-height:1.65}
        .pbar{position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#c9a96e,transparent);transform:scaleX(0);transform-origin:left;transition:transform .4s cubic-bezier(.16,1,.3,1)}
        .PI:hover .pbar{transform:scaleX(1)}
        .tgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .TC{background:#100e0a;border:1px solid rgba(245,240,232,.06);border-radius:4px;padding:52px;transition:all .4s;position:relative;overflow:hidden}
        .TC::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,169,110,.45),transparent);opacity:0;transition:opacity .4s}
        .TC:hover{background:#141008;border-color:rgba(201,169,110,.14);transform:translateY(-5px)}
        .TC:hover::before{opacity:1}
        .tqbig{font-family:'Playfair Display',serif;font-size:88px;font-weight:800;color:rgba(201,169,110,.1);line-height:.55;margin-bottom:28px}
        .TQ{font-size:18px;font-weight:400;font-style:italic;line-height:1.75;color:rgba(245,240,232,.58);margin-bottom:44px;letter-spacing:-.015em}
        .trule{width:32px;height:1px;background:rgba(201,169,110,.3);margin-bottom:24px}
        .tname{font-size:16px;font-weight:700;letter-spacing:-.025em;color:#f5f0e8;margin-bottom:5px}
        .trole{font-family:'DM Sans',sans-serif;font-size:12px;font-weight:300;color:rgba(245,240,232,.28);letter-spacing:.025em}
        .pricegrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .PL{border-radius:4px;padding:56px;border:1px solid rgba(245,240,232,.08);background:#100e0a;position:relative;transition:all .4s}
        .PL:hover{transform:translateY(-5px);border-color:rgba(201,169,110,.18)}
        .PG{background:#c9a96e;border-color:#c9a96e}
        .PG:hover{background:#d4b47a}
        .ptag{font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;background:rgba(245,240,232,.1);color:rgba(245,240,232,.45);padding:5px 13px;border-radius:2px;display:inline-block;margin-bottom:40px}
        .PG .ptag{background:rgba(12,10,8,.12);color:rgba(12,10,8,.5)}
        .ptier{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(245,240,232,.28);margin-bottom:16px}
        .PG .ptier{color:rgba(12,10,8,.4)}
        .ppr{font-size:68px;font-weight:800;letter-spacing:-.055em;color:#f5f0e8;line-height:1;margin-bottom:8px}
        .PG .ppr{color:#0c0a08}
        .pmo{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:300;color:rgba(245,240,232,.28);margin-bottom:48px}
        .PG .pmo{color:rgba(12,10,8,.42)}
        .prule{height:1px;background:rgba(245,240,232,.07);margin-bottom:36px}
        .PG .prule{background:rgba(12,10,8,.12)}
        .plist{list-style:none;display:flex;flex-direction:column;gap:14px;margin-bottom:48px}
        .plist li{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:400;color:rgba(245,240,232,.48);display:flex;align-items:flex-start;gap:12px;line-height:1.5}
        .PG .plist li{color:rgba(12,10,8,.58)}
        .pck{color:#c9a96e;font-weight:700;flex-shrink:0;margin-top:2px}
        .PG .pck{color:#0c0a08}
        .pabtn{display:block;text-align:center;padding:16px 24px;border-radius:3px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;text-decoration:none;transition:all .25s;letter-spacing:.02em}
        .pb1{background:#c9a96e;color:#0c0a08}.pb1:hover{background:#dbb97e}
        .pb2{background:#0c0a08;color:#f5f0e8}.pb2:hover{background:#1c1810}
        .pb3{background:transparent;color:rgba(245,240,232,.52);border:1px solid rgba(245,240,232,.12)}.pb3:hover{color:#f5f0e8;border-color:rgba(245,240,232,.32)}
        .FINAL{margin:0 72px 160px;background:linear-gradient(135deg,#1c1508,#0f0d08,#1a1408);border:1px solid rgba(201,169,110,.16);border-radius:4px;padding:128px 80px;text-align:center;position:relative;overflow:hidden}
        .FINAL::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:1px;height:100%;background:linear-gradient(to bottom,rgba(201,169,110,.22),transparent);pointer-events:none}
        .fglow{position:absolute;inset:0;background:radial-gradient(ellipse 55% 55% at 50% 50%,rgba(201,169,110,.07) 0%,transparent 65%);pointer-events:none}
        .FOOT{padding:52px 72px;border-top:1px solid rgba(245,240,232,.06);display:flex;align-items:center;justify-content:space-between;font-family:'DM Sans',sans-serif}
        .flogo{font-family:'Playfair Display',serif;font-size:21px;font-weight:700;color:#f5f0e8;text-decoration:none;letter-spacing:-.02em}
        .flogo b{color:#c9a96e}
        .flinks{display:flex;gap:36px}
        .flinks a{font-size:13px;font-weight:300;color:rgba(245,240,232,.22);text-decoration:none;transition:color .2s}
        .flinks a:hover{color:rgba(245,240,232,.65)}
        .fcopy{font-size:12px;color:rgba(245,240,232,.16);font-weight:300}
        @media(max-width:960px){
          .NAV{padding:0 24px}.nav-mid{display:none}
          .HERO{padding:100px 24px 60px}
          .SEC,.SEC2{padding:100px 24px}
          .DARK .SEC{padding:100px 24px}
          .grid2{grid-template-columns:1fr;gap:48px}
          .sgrid,.pgrid{grid-template-columns:1fr}
          .tgrid,.pricegrid{grid-template-columns:1fr}
          .FINAL{margin:0 24px 100px;padding:80px 32px}
          .FOOT{padding:40px 24px;flex-direction:column;gap:24px;text-align:center}
          .flinks{flex-wrap:wrap;justify-content:center}
        }
      `}</style>

      <nav className="NAV" style={{
        background: nav > 0 ? `rgba(12,10,8,${Math.min(nav*.96,.96)})` : 'transparent',
        borderBottom: nav > .6 ? '1px solid rgba(245,240,232,.06)' : '1px solid transparent',
        backdropFilter: nav > 0 ? `blur(${nav*24}px)` : 'none',
      }}>
        <a href="/" className="logo">Portfolio<b>AI</b></a>
        <div className="nav-mid">
          <a href="#how">Process</a>
          <a href="#industries">Industries</a>
          <a href="#pricing">Pricing</a>
        </div>
        <Link href="/auth/signup" className="nav-cta">Get started</Link>
      </nav>

      <section className="HERO">
        <div className="hbg"/><div className="hline"/>
        <div className={"kicker hi"+(loaded?" go":"")} style={{transitionDelay:'.08s'}}>
          <span className="kline"/>AI-Powered Portfolio Generation<span className="kline"/>
        </div>
        <h1 className={"H1 hi"+(loaded?" go":"")} style={{transitionDelay:'.22s'}}>
          Your resume.<br/><em>Reimagined.</em><br/>Extraordinary.
        </h1>
        <div className={"vline hi"+(loaded?" go":"")} style={{transitionDelay:'.38s'}}/>
        <p className={"hsub hi"+(loaded?" go":"")} style={{transitionDelay:'.46s'}}>
          Upload your PDF resume and receive a world-class portfolio website — designed specifically for your profession — in under 60 seconds.
        </p>
        <div className={"hbtns hi"+(loaded?" go":"")} style={{transitionDelay:'.56s'}}>
          <Link href="/auth/signup" className="bgold">Build my portfolio — free</Link>
          <Link href="/auth/login" className="bghost">Sign in</Link>
        </div>
        <div className={"htrust hi"+(loaded?" go":"")} style={{transitionDelay:'.66s'}}>
          <span>No credit card required</span><span className="tdot"/>
          <span>Ready in 60 seconds</span><span className="tdot"/>
          <span>Unique design every time</span>
        </div>
      </section>

      <div className="TICKER">
        <div className="ttrack">
          {[...Array(2)].map((_,gi) =>
            ['Software Engineering','UX Design','Investment Banking','Healthcare','Law','Marketing','Architecture','Data Science','Education','Creative Direction','Consulting','Product Management'].map((x,i) => (
              <div key={gi+'-'+i} className="titem">{x}</div>
            ))
          )}
        </div>
      </div>

      <section className="SEC" id="how">
        <div className="grid2">
          <div className="r">
            <h2 className="DH">Not a template.<br/><em>Your site.</em><br/>Built by AI.</h2>
          </div>
          <div className="r d2 BT">
            <div className="grule"/>
            <p>Most portfolio builders hand you a template and leave you to figure it out. <strong>PortfolioAI is fundamentally different.</strong> Every portfolio is generated from scratch — unique design, unique copy, unique structure — built specifically for who you are.</p>
            <p>The result looks like you hired a senior designer and a professional copywriter. Because effectively, you did.</p>
          </div>
        </div>
      </section>

      <section className="SEC2">
        <div className="ey r">The process</div>
        <div className="sgrid r d1">
          {[
            {n:'01',h:'Upload your resume',p:'Drop your PDF resume — any format, any length, any career stage. Our AI reads everything: your roles, achievements, skills, education, and the story between the lines.'},
            {n:'02',h:'AI builds your site',p:'Claude — one of the most capable AI systems in existence — reads your resume, rewrites your achievements as impact statements, detects your profession, and generates a fully bespoke portfolio.'},
            {n:'03',h:'Publish and get hired',p:'You receive a live, shareable URL in under 60 seconds. Send it to recruiters, link it on LinkedIn, put it in your email signature. Your career now has a home worthy of it.'},
          ].map((s,i) => (
            <div key={i} className="ST">
              <div className="sn">{s.n}</div>
              <h3 className="sh">{s.h}</h3>
              <p className="sp">{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="DARK" id="industries">
        <section className="SEC">
          <div className="grid2" style={{marginBottom:80}}>
            <div className="r">
              <div className="ey">Every profession</div>
              <h2 className="DH">Built for<br/><em>every field.</em></h2>
            </div>
            <div className="r d2 BT">
              <p>A portfolio for a neurosurgeon should feel nothing like one for a creative director. Each profession gets a design language, tone, and structure that speaks to the people hiring in that field.</p>
            </div>
          </div>
          <div className="pgrid r d2">
            {[
              {n:'01',name:'Engineering',roles:'Software · ML · Data · DevOps · Cloud'},
              {n:'02',name:'Design',roles:'UX · UI · Product · Brand · Motion'},
              {n:'03',name:'Finance',roles:'Investment Banking · Accounting · Wealth'},
              {n:'04',name:'Legal',roles:'Law · Compliance · Paralegal · IP'},
              {n:'05',name:'Marketing',roles:'Growth · Content · Brand · Performance'},
              {n:'06',name:'Healthcare',roles:'Medicine · Nursing · Allied Health · Research'},
              {n:'07',name:'Education',roles:'Teaching · Academic · Training · Coaching'},
              {n:'08',name:'Creative',roles:'Writing · Film · Photography · Art Direction'},
              {n:'09',name:'Business',roles:'Strategy · Operations · Consulting · HR'},
              {n:'10',name:'Science',roles:'Research · Academia · Biotech · R&D'},
            ].map((p,i) => (
              <div key={i} className="PI">
                <div className="pn">{p.n}</div>
                <div className="pname">{p.name}</div>
                <div className="proles">{p.roles}</div>
                <div className="pbar"/>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="SEC">
        <div className="grid2" style={{marginBottom:80}}>
          <div className="r">
            <div className="ey">Testimonials</div>
            <h2 className="DH">Real people.<br/><em>Real results.</em></h2>
          </div>
          <div className="r d2 BT">
            <p>From new graduates to senior professionals with decades of experience — PortfolioAI has helped people across every industry present themselves at the highest level.</p>
          </div>
        </div>
        <div className="tgrid">
          {[
            {q:'I uploaded my resume on a Tuesday evening. By Wednesday morning I had heard from three recruiters. The portfolio looked like I had paid an agency thousands of dollars for it.',name:'Aisha M.',role:'Senior UX Designer, Toronto'},
            {q:'After five years away from the workforce, I had no idea how to present myself. PortfolioAI built me something that made me look current, confident and completely professional. I had an offer within three weeks.',name:'Sandra K.',role:'Registered Nurse, London'},
            {q:'I have spent 18 years in investment banking and never had a personal website. What I received looked like a bespoke agency had studied my entire career and built something just for me.',name:'James T.',role:'Managing Director, New York'},
          ].map((t,i) => (
            <div key={i} className={"TC r d"+(i+1)}>
              <div className="tqbig">"</div>
              <p className="TQ">{t.q}</p>
              <div className="trule"/>
              <div className="tname">{t.name}</div>
              <div className="trole">{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="SEC2" id="pricing">
        <div className="ey r">Pricing</div>
        <h2 className="DH r" style={{marginBottom:80}}>Simple.<br/><em>Transparent.</em></h2>
        <div className="pricegrid r d1">
          <div className="PL">
            <div className="ptier">Free</div>
            <div className="ppr">Free</div>
            <div className="pmo">Try before you pay</div>
            <div className="prule"/>
            <ul className="plist">
              {['Generate your portfolio','Preview before paying','AI-generated copy','All profession themes'].map((f,i) => (
                <li key={i}><span className="pck">+</span>{f}</li>
              ))}
            </ul>
            <Link href="/auth/signup" className="pabtn pb1">Start free</Link>
          </div>
          <div className="PL PG">
            <div className="ptag">Best value</div>
            <div className="ptier">Bundle</div>
            <div className="ppr">$9.99</div>
            <div className="pmo">one-time — save 30%</div>
            <div className="prule"/>
            <ul className="plist">
              {['Launch portfolio live','3 design regenerations','Public URL forever','No monthly fees','Share with recruiters'].map((f,i) => (
                <li key={i}><span className="pck">+</span>{f}</li>
              ))}
            </ul>
            <Link href="/pricing" className="pabtn pb2">Get Bundle — $9.99</Link>
          </div>
          <div className="PL">
            <div className="ptier">Launch</div>
            <div className="ppr">$4.99</div>
            <div className="pmo">one-time · less than a coffee</div>
            <div className="prule"/>
            <ul className="plist">
              {['Live public URL forever','Share with recruiters','No branding','One payment only'].map((f,i) => (
                <li key={i}><span className="pck">+</span>{f}</li>
              ))}
            </ul>
            <Link href="/pricing" className="pabtn pb3">Launch — $4.99</Link>
          </div>
        </div>
      </section>

      <div className="FINAL r">
        <div className="fglow"/>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'.18em',textTransform:'uppercase',color:'#c9a96e',marginBottom:28,position:'relative',zIndex:1}}>One upload away</div>
        <h2 style={{fontSize:'clamp(52px,7.5vw,104px)',fontWeight:800,lineHeight:.9,letterSpacing:'-.055em',color:'#f5f0e8',marginBottom:28,position:'relative',zIndex:1}}>
          Your career deserves<br/>a <em style={{fontStyle:'italic',color:'#c9a96e'}}>beautiful</em> home.
        </h2>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:300,color:'rgba(245,240,232,.38)',marginBottom:56,position:'relative',zIndex:1}}>No design skills. No technical knowledge. No templates. Just your resume.</p>
        <Link href="/auth/signup" className="bgold" style={{display:'inline-block',fontSize:16,padding:'19px 56px',position:'relative',zIndex:1}}>
          Build my portfolio — free
        </Link>
      </div>

      <footer className="FOOT">
        <a href="/" className="flogo">Portfolio<b>AI</b></a>
        <div className="flinks">
          <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Contact</a>
        </div>
        <div className="fcopy">© 2026 PortfolioAI. All rights reserved.</div>
      </footer>
    </div>
  )
}
