'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleUpgrade(plan: string) {
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Something went wrong')
    } catch {
      alert('Something went wrong')
    }
    setLoading(null)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0c0a08',color:'#f5f0e8'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-font-smoothing:antialiased}
        .btn{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;padding:14px 24px;border-radius:3px;cursor:pointer;border:none;transition:all .25s;letter-spacing:.02em;width:100%;display:block;text-align:center;text-decoration:none}
        .btn-gold{background:#c9a96e;color:#0c0a08}.btn-gold:hover{background:#dbb97e;transform:translateY(-1px)}
        .btn-dark{background:#f5f0e8;color:#0c0a08}.btn-dark:hover{background:#fff}
        .btn-outline{background:transparent;color:rgba(245,240,232,.55);border:1px solid rgba(245,240,232,.15)}.btn-outline:hover{color:#f5f0e8;border-color:rgba(245,240,232,.35)}
        .plan{border-radius:4px;padding:48px;border:1px solid rgba(245,240,232,.08);background:#100e0a;transition:all .35s}
        .plan:hover{transform:translateY(-4px);border-color:rgba(201,169,110,.15)}
        .plan-gold{background:#c9a96e;border-color:#c9a96e}
        .plan-gold:hover{background:#d4b47a}
        .li{font-family:'DM Sans',sans-serif;font-size:14px;color:rgba(245,240,232,.5);display:flex;align-items:flex-start;gap:10px;line-height:1.5;margin-bottom:12px}
        .li-gold{color:rgba(12,10,8,.6)}
        .ck{color:#c9a96e;font-weight:700;flex-shrink:0}
        .ck-dark{color:#0c0a08}
      `}</style>

      <nav style={{position:'sticky',top:0,zIndex:100,height:72,padding:'0 72px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(12,10,8,.96)',borderBottom:'1px solid rgba(245,240,232,.06)',backdropFilter:'blur(20px)'}}>
        <a href="/" style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#f5f0e8',textDecoration:'none',letterSpacing:'-.02em'}}>
          Portfolio<span style={{color:'#c9a96e'}}>AI</span>
        </a>
        <Link href="/dashboard" style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(245,240,232,.4)',textDecoration:'none'}}>Back to dashboard</Link>
      </nav>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'100px 72px'}}>
        
        <div style={{textAlign:'center',marginBottom:80}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'.18em',textTransform:'uppercase',color:'#c9a96e',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
            <span style={{width:32,height:1,background:'rgba(201,169,110,.4)',display:'block'}}/>
            Pricing
            <span style={{width:32,height:1,background:'rgba(201,169,110,.4)',display:'block'}}/>
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:64,fontWeight:700,letterSpacing:'-.04em',color:'#f5f0e8',lineHeight:1,marginBottom:16}}>
            Simple. <em style={{fontStyle:'italic',color:'#c9a96e'}}>Transparent.</em>
          </h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:'rgba(245,240,232,.4)',fontWeight:300}}>
            Start free. Upgrade when you are ready.
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          
          {/* FREE */}
          <div className="plan">
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(245,240,232,.28)',marginBottom:20}}>Free</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:64,fontWeight:700,letterSpacing:'-.05em',color:'#f5f0e8',lineHeight:1,marginBottom:8}}>Free</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:'rgba(245,240,232,.28)',marginBottom:40,fontWeight:300}}>No credit card required</div>
            <div style={{height:1,background:'rgba(245,240,232,.07)',marginBottom:32}}/>
            {['1 portfolio website','PortfolioAI subdomain','All profession themes','AI-generated copy','Publish instantly'].map((f,i) => (
              <div key={i} className="li"><span className="ck">+</span>{f}</div>
            ))}
            <div style={{marginTop:32}}>
              <Link href="/dashboard" className="btn btn-outline">Get started free</Link>
            </div>
          </div>

          {/* PRO */}
          <div className="plan plan-gold">
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',background:'rgba(12,10,8,.15)',color:'rgba(12,10,8,.5)',padding:'5px 12px',borderRadius:2,display:'inline-block',marginBottom:20}}>Most popular</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(12,10,8,.4)',marginBottom:16}}>Pro</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:64,fontWeight:700,letterSpacing:'-.05em',color:'#0c0a08',lineHeight:1,marginBottom:8}}>$12</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:'rgba(12,10,8,.45)',marginBottom:40,fontWeight:300}}>per month — cancel anytime</div>
            <div style={{height:1,background:'rgba(12,10,8,.12)',marginBottom:32}}/>
            {['3 portfolio websites','Custom domain','No PortfolioAI branding','Portfolio analytics','Priority AI generation','Email support'].map((f,i) => (
              <div key={i} className="li li-gold"><span className="ck ck-dark">+</span>{f}</div>
            ))}
            <div style={{marginTop:32}}>
              <button onClick={() => handleUpgrade('pro')} disabled={loading === 'pro'} className="btn btn-dark">
                {loading === 'pro' ? 'Loading...' : 'Start Pro — $12/mo'}
              </button>
            </div>
          </div>

          {/* TEAM */}
          <div className="plan">
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(245,240,232,.28)',marginBottom:20}}>Team</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:64,fontWeight:700,letterSpacing:'-.05em',color:'#f5f0e8',lineHeight:1,marginBottom:8}}>$49</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:'rgba(245,240,232,.28)',marginBottom:40,fontWeight:300}}>per month</div>
            <div style={{height:1,background:'rgba(245,240,232,.07)',marginBottom:32}}/>
            {['Unlimited portfolios','White label','Custom domain','API access','Recruiter dashboard','Bulk generation','Priority support'].map((f,i) => (
              <div key={i} className="li"><span className="ck">+</span>{f}</div>
            ))}
            <div style={{marginTop:32}}>
              <button onClick={() => handleUpgrade('team')} disabled={loading === 'team'} className="btn btn-gold">
                {loading === 'team' ? 'Loading...' : 'Start Team — $49/mo'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}