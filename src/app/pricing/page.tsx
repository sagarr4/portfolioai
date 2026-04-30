'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [portfolioId, setPortfolioId] = useState<string | null>(null)

  useEffect(() => {
    // Get portfolio ID from URL or latest portfolio
    const params = new URLSearchParams(window.location.search)
    const pid = params.get('portfolio_id')
    if (pid) setPortfolioId(pid)
    
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth/login?redirect=/pricing')
    })
  }, [])

  async function handlePurchase(type: string) {
    setLoading(type)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, portfolio_id: portfolioId })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Something went wrong')
    } catch { alert('Something went wrong') }
    setLoading(null)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0c0a08',color:'#f5f0e8'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-font-smoothing:antialiased}
        .card{background:#100e0a;border:1px solid rgba(245,240,232,.08);border-radius:4px;padding:48px;transition:all .35s;position:relative}
        .card:hover{border-color:rgba(201,169,110,.2);transform:translateY(-4px)}
        .card-featured{background:linear-gradient(135deg,#1a1408,#141008);border-color:rgba(201,169,110,.3)}
        .badge{display:inline-block;background:rgba(201,169,110,.15);color:#c9a96e;font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding:5px 12px;border-radius:2px;border:1px solid rgba(201,169,110,.2);margin-bottom:24px}
        .price{font-family:'Playfair Display',serif;font-size:72px;font-weight:700;letter-spacing:-.05em;color:#f5f0e8;line-height:1}
        .price-note{font-family:'DM Sans',sans-serif;font-size:14px;color:rgba(245,240,232,.3);font-weight:300;margin-top:4px;margin-bottom:36px}
        .feature{font-family:'DM Sans',sans-serif;font-size:14px;color:rgba(245,240,232,.55);display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;line-height:1.5}
        .check{color:#c9a96e;font-weight:700;flex-shrink:0}
        .btn{width:100%;padding:15px 24px;border-radius:3px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;letter-spacing:.03em;cursor:pointer;border:none;transition:all .25s;margin-top:36px;display:block;text-align:center}
        .btn-gold{background:#c9a96e;color:#0c0a08}.btn-gold:hover:not(:disabled){background:#dbb97e;transform:translateY(-1px)}
        .btn-outline{background:transparent;color:rgba(245,240,232,.6);border:1px solid rgba(245,240,232,.15)}.btn-outline:hover:not(:disabled){color:#f5f0e8;border-color:rgba(245,240,232,.35)}
        .btn:disabled{opacity:.5;cursor:not-allowed}
        .divider{height:1px;background:rgba(245,240,232,.07);margin:28px 0}
        .saving{font-family:'DM Sans',sans-serif;font-size:12px;color:#4ade80;font-weight:500;letter-spacing:.04em}
      `}</style>

      <nav style={{position:'sticky',top:0,zIndex:100,height:72,padding:'0 72px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(12,10,8,.96)',borderBottom:'1px solid rgba(245,240,232,.06)',backdropFilter:'blur(20px)'}}>
        <a href="/" style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#f5f0e8',textDecoration:'none',letterSpacing:'-.02em'}}>
          Portfolio<span style={{color:'#c9a96e'}}>AI</span>
        </a>
        <a href="/dashboard" style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(245,240,232,.4)',textDecoration:'none'}}>Back to dashboard</a>
      </nav>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'100px 72px'}}>

        {/* HEADER */}
        <div style={{textAlign:'center',marginBottom:80}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'.18em',textTransform:'uppercase',color:'#c9a96e',marginBottom:20,display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
            <span style={{width:32,height:1,background:'rgba(201,169,110,.4)',display:'block'}}/>
            Simple pricing
            <span style={{width:32,height:1,background:'rgba(201,169,110,.4)',display:'block'}}/>
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:64,fontWeight:700,letterSpacing:'-.04em',color:'#f5f0e8',lineHeight:1,marginBottom:16}}>
            Try free.<br/><em style={{fontStyle:'italic',color:'#c9a96e'}}>Pay when you love it.</em>
          </h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:17,color:'rgba(245,240,232,.4)',fontWeight:300,maxWidth:480,margin:'0 auto'}}>
            Generate your portfolio for free. Only pay when you want to share it with the world.
          </p>
        </div>

        {/* CARDS */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginBottom:60}}>

          {/* FREE */}
          <div className="card">
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(245,240,232,.28)',marginBottom:20}}>Free forever</div>
            <div className="price">$0</div>
            <div className="price-note">No credit card needed</div>
            <div className="divider"/>
            {[
              'Upload your resume',
              'AI generates your portfolio',
              'Preview your site',
              'See your design before paying',
            ].map((f,i) => <div key={i} className="feature"><span className="check">+</span>{f}</div>)}
            <a href="/dashboard" className="btn btn-outline">Start free</a>
          </div>

          {/* BUNDLE - FEATURED */}
          <div className="card card-featured">
            <div className="badge">Best value — save 30%</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(201,169,110,.6)',marginBottom:16}}>Launch Bundle</div>
            <div className="price" style={{color:'#c9a96e'}}>$9.99</div>
            <div className="price-note">one-time payment · yours forever</div>
            <div className="divider"/>
            {[
              'Everything in Launch',
              'Live public URL — share instantly',
              '3 design regenerations included',
              'Perfect for active job seekers',
              'Less than 2 coffees',
            ].map((f,i) => <div key={i} className="feature"><span className="check">+</span>{f}</div>)}
            <div style={{marginTop:8}}>
              <div className="saving">You save $4.96 vs buying separately</div>
            </div>
            <button onClick={() => handlePurchase('bundle')} disabled={loading === 'bundle'} className="btn btn-gold">
              {loading === 'bundle' ? 'Loading...' : 'Get Launch Bundle — $9.99'}
            </button>
          </div>

          {/* LAUNCH */}
          <div className="card">
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(245,240,232,.28)',marginBottom:20}}>Launch</div>
            <div className="price">$4.99</div>
            <div className="price-note">one-time · less than a coffee</div>
            <div className="divider"/>
            {[
              'Live public URL forever',
              'Share with recruiters',
              'Remove PortfolioAI watermark',
              'No monthly fees ever',
            ].map((f,i) => <div key={i} className="feature"><span className="check">+</span>{f}</div>)}
            <button onClick={() => handlePurchase('launch')} disabled={loading === 'launch'} className="btn btn-gold">
              {loading === 'launch' ? 'Loading...' : 'Launch my portfolio — $4.99'}
            </button>
          </div>

        </div>

        {/* REGEN ADD-ON */}
        <div style={{background:'#100e0a',border:'1px solid rgba(245,240,232,.07)',borderRadius:4,padding:'36px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:32,flexWrap:'wrap'}}>
          <div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(245,240,232,.28)',marginBottom:8}}>Add-on</div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:'#f5f0e8',letterSpacing:'-.03em',marginBottom:8}}>New Design — $3.99</h3>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:'rgba(245,240,232,.4)',fontWeight:300,maxWidth:480}}>
              Not feeling your current design? Get a completely new AI-generated portfolio. Different layout, different style, same content. Pay only when you want a change.
            </p>
          </div>
          <button onClick={() => handlePurchase('regen')} disabled={loading === 'regen'} style={{
            padding:'14px 32px',
            background:'transparent',
            color:'#c9a96e',
            border:'1px solid rgba(201,169,110,.3)',
            borderRadius:3,
            fontFamily:"'DM Sans',sans-serif",
            fontSize:14,
            fontWeight:600,
            cursor:'pointer',
            transition:'all .25s',
            whiteSpace:'nowrap',
            flexShrink:0,
          }}>
            {loading === 'regen' ? 'Loading...' : 'Get new design — $3.99'}
          </button>
        </div>

        {/* TRUST */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24,marginTop:48}}>
          {[
            {icon:'🔒',title:'Secure payment',desc:'Powered by Stripe. Your card details are never stored.'},
            {icon:'♾️',title:'Yours forever',desc:'One payment. Your portfolio stays live permanently.'},
            {icon:'⚡',title:'Instant delivery',desc:'Portfolio goes live immediately after payment.'},
          ].map((t,i) => (
            <div key={i} style={{textAlign:'center',padding:'24px'}}>
              <div style={{fontSize:28,marginBottom:12}}>{t.icon}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:'#f5f0e8',marginBottom:8}}>{t.title}</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(245,240,232,.35)',fontWeight:300,lineHeight:1.6}}>{t.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}