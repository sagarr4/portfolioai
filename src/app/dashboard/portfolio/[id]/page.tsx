'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PortfolioEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [id, setId] = useState('')

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      fetch('/api/portfolio-data/' + p.id)
        .then(r => r.json())
        .then(data => { setPortfolio(data); setLoading(false) })
        .catch(() => setLoading(false))
    })
  }, [])

  async function handleRegenerate() {
    if (!confirm('This will create a completely new design. Continue?')) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/regenerate/' + id, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        await fetch('/api/publish/' + id)
        setPortfolio((p: any) => ({ ...p, is_published: true }))
        alert('New portfolio generated and published!')
        window.location.reload()
      } else {
        alert('Failed: ' + data.error)
      }
    } catch { alert('Something went wrong') }
    setRegenerating(false)
  }

  async function handlePublish() {
    setPublishing(true)
    await fetch('/api/publish/' + id)
    setPortfolio((p: any) => ({ ...p, is_published: true }))
    setPublishing(false)
  }

  function copyUrl() {
    navigator.clipboard.writeText(liveUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0c0a08',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(245,240,232,.3)',fontSize:14,letterSpacing:'.04em'}}>Loading portfolio...</div>
    </div>
  )

  if (!portfolio) return (
    <div style={{minHeight:'100vh',background:'#0c0a08',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:"'DM Sans',sans-serif",color:'rgba(245,240,232,.3)',fontSize:14,marginBottom:16}}>Portfolio not found</div>
        <a href="/dashboard" style={{fontFamily:"'DM Sans',sans-serif",color:'#c9a96e',fontSize:13}}>Back to dashboard</a>
      </div>
    </div>
  )

  const parsed = portfolio.portfolio_data
  const liveUrl = (typeof window !== 'undefined' ? window.location.origin : '') + '/portfolio/' + portfolio.slug

  return (
    <div style={{minHeight:'100vh',background:'#0c0a08',color:'#f5f0e8'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-font-smoothing:antialiased}
        .btn{font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;padding:10px 22px;border-radius:3px;cursor:pointer;border:none;transition:all .25s;letter-spacing:.02em;display:inline-flex;align-items:center;gap:8px;text-decoration:none;white-space:nowrap}
        .btn-gold{background:#c9a96e;color:#0c0a08}.btn-gold:hover:not(:disabled){background:#dbb97e;transform:translateY(-1px)}
        .btn-outline{background:transparent;color:rgba(245,240,232,.5);border:1px solid rgba(245,240,232,.12)}.btn-outline:hover:not(:disabled){color:#f5f0e8;border-color:rgba(245,240,232,.3)}
        .btn-green{background:rgba(74,222,128,.12);color:#4ade80;border:1px solid rgba(74,222,128,.2)}.btn-green:hover:not(:disabled){background:rgba(74,222,128,.2)}
        .btn:disabled{opacity:.45;cursor:not-allowed}
        .info-card{background:#100e0a;border:1px solid rgba(245,240,232,.07);border-radius:4px;padding:32px}
        .skill{font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(245,240,232,.5);background:rgba(245,240,232,.04);border:1px solid rgba(245,240,232,.08);border-radius:2px;padding:5px 12px}
        .stat{background:#100e0a;padding:28px 32px;border-right:1px solid rgba(245,240,232,.06)}
        .stat:last-child{border-right:none}
      `}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,height:72,padding:'0 72px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(12,10,8,.96)',borderBottom:'1px solid rgba(245,240,232,.06)',backdropFilter:'blur(20px)'}}>
        <a href="/" style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#f5f0e8',textDecoration:'none',letterSpacing:'-.02em'}}>
          Portfolio<span style={{color:'#c9a96e'}}>AI</span>
        </a>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <a href="/dashboard" className="btn btn-outline">← Dashboard</a>
          {portfolio.is_published && (
            <a href={liveUrl} target="_blank" className="btn btn-outline">View live ↗</a>
          )}
          <button onClick={handleRegenerate} disabled={regenerating} className="btn btn-outline">
            {regenerating ? '⟳ Generating new design...' : '⟳ Regenerate'}
          </button>
          {!portfolio.is_published ? (
            <button onClick={handlePublish} disabled={publishing} className="btn btn-gold">
              {publishing ? 'Publishing...' : '↑ Publish portfolio'}
            </button>
          ) : (
            <button onClick={handlePublish} disabled={publishing} className="btn btn-green">
              {publishing ? 'Updating...' : '✓ Published — Republish'}
            </button>
          )}
        </div>
      </nav>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'80px 72px'}}>

        {/* HERO */}
        <div style={{marginBottom:64,paddingBottom:64,borderBottom:'1px solid rgba(245,240,232,.06)'}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'.18em',textTransform:'uppercase',color:'#c9a96e',marginBottom:20,display:'flex',alignItems:'center',gap:12}}>
            <span style={{width:32,height:1,background:'rgba(201,169,110,.4)',display:'block'}}/>
            {portfolio.field} · {portfolio.theme}
          </div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:52,fontWeight:700,letterSpacing:'-.04em',color:'#f5f0e8',lineHeight:1.0,marginBottom:12}}>{parsed?.name}</h1>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,color:'#c9a96e',fontWeight:400,marginBottom:16,letterSpacing:'-.01em'}}>{parsed?.title}</p>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,color:'rgba(245,240,232,.38)',fontWeight:300,maxWidth:620,lineHeight:1.75}}>{parsed?.summary}</p>
        </div>

        {/* STATUS */}
        <div style={{background: portfolio.is_published ? 'rgba(74,222,128,.06)' : 'rgba(201,169,110,.06)',border:'1px solid ' + (portfolio.is_published ? 'rgba(74,222,128,.15)' : 'rgba(201,169,110,.15)'),borderRadius:4,padding:'20px 28px',marginBottom:32,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:portfolio.is_published ? '#4ade80' : '#c9a96e',boxShadow:'0 0 8px ' + (portfolio.is_published ? 'rgba(74,222,128,.5)' : 'rgba(201,169,110,.5)')}}/>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:portfolio.is_published ? '#4ade80' : '#c9a96e'}}>
              {portfolio.is_published ? 'Live' : 'Draft'}
            </span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(245,240,232,.3)',fontWeight:300}}>
              {portfolio.is_published ? '— your portfolio is public' : '— publish to make it live'}
            </span>
          </div>
          {portfolio.views > 0 && (
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(245,240,232,.25)',fontWeight:300}}>
              {portfolio.views} {portfolio.views === 1 ? 'view' : 'views'}
            </span>
          )}
        </div>

        {/* STATS ROW */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',background:'rgba(245,240,232,.06)',gap:1,marginBottom:24,borderRadius:4,overflow:'hidden'}}>
          {[
            {label:'Profession',value:portfolio.field},
            {label:'Design theme',value:portfolio.theme},
            {label:'Skills found',value:(parsed?.skills?.length||0)+' skills'},
            {label:'Experience',value:(parsed?.experience?.length||0)+' roles'},
          ].map((s,i) => (
            <div key={i} className="stat">
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(245,240,232,.25)',marginBottom:8}}>{s.label}</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:500,color:'#f5f0e8',textTransform:'capitalize'}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* SKILLS */}
        <div className="info-card" style={{marginBottom:16}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(245,240,232,.25)',marginBottom:20}}>Detected skills</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {parsed?.skills?.map((skill: string, i: number) => (
              <span key={i} className="skill">{skill}</span>
            ))}
          </div>
        </div>

        {/* EXPERIENCE */}
        <div className="info-card" style={{marginBottom:16}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(245,240,232,.25)',marginBottom:24}}>Experience</div>
          {parsed?.experience?.map((exp: any, i: number) => (
            <div key={i} style={{marginBottom:28,paddingBottom:28,borderBottom:i < parsed.experience.length-1 ? '1px solid rgba(245,240,232,.05)' : 'none'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6,gap:16}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:'#f5f0e8',letterSpacing:'-.02em'}}>{exp.role}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:'rgba(245,240,232,.25)',whiteSpace:'nowrap',paddingTop:3,fontWeight:300}}>{exp.duration}</div>
              </div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'#c9a96e',marginBottom:12,fontWeight:500}}>{exp.company}</div>
              <ul style={{paddingLeft:0,margin:0,listStyle:'none',display:'flex',flexDirection:'column',gap:6}}>
                {exp.highlights?.map((h: string, j: number) => (
                  <li key={j} style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(245,240,232,.38)',lineHeight:1.7,fontWeight:300,paddingLeft:16,position:'relative'}}>
                    <span style={{position:'absolute',left:0,color:'#c9a96e',opacity:.5}}>—</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* PROJECTS */}
        {parsed?.projects?.length > 0 && (
          <div className="info-card" style={{marginBottom:16}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(245,240,232,.25)',marginBottom:24}}>Projects</div>
            {parsed.projects.map((proj: any, i: number) => (
              <div key={i} style={{marginBottom:20,paddingBottom:20,borderBottom:i < parsed.projects.length-1 ? '1px solid rgba(245,240,232,.05)' : 'none'}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:'#f5f0e8',marginBottom:6}}>{proj.name}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(245,240,232,.38)',marginBottom:10,fontWeight:300,lineHeight:1.65}}>{proj.description}</div>
                {proj.tech?.length > 0 && (
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {proj.tech.map((t: string, j: number) => (
                      <span key={j} style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:'rgba(201,169,110,.6)',background:'rgba(201,169,110,.06)',border:'1px solid rgba(201,169,110,.1)',borderRadius:2,padding:'3px 8px'}}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PORTFOLIO URL */}
        <div className="info-card">
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(245,240,232,.25)',marginBottom:16}}>Portfolio URL</div>
          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
            <code style={{flex:1,fontFamily:'monospace',fontSize:14,color:'#c9a96e',background:'rgba(201,169,110,.05)',border:'1px solid rgba(201,169,110,.12)',borderRadius:3,padding:'14px 18px',wordBreak:'break-all',minWidth:0}}>{liveUrl}</code>
            <button onClick={copyUrl} className="btn btn-outline" style={{flexShrink:0}}>
              {copied ? '✓ Copied' : 'Copy URL'}
            </button>
            {portfolio.is_published && (
              <a href={liveUrl} target="_blank" className="btn btn-gold" style={{flexShrink:0}}>Open ↗</a>
            )}
          </div>
          {!portfolio.is_published && (
            <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(245,240,232,.2)',marginTop:12,fontWeight:300,lineHeight:1.6}}>
              Click "Publish portfolio" above to make this URL live.
            </p>
          )}
        </div>

        {/* REGEN INFO */}
        <div style={{marginTop:24,padding:'20px 24px',background:'rgba(245,240,232,.02)',border:'1px solid rgba(245,240,232,.05)',borderRadius:4}}>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(245,240,232,.25)',lineHeight:1.7,fontWeight:300}}>
            <span style={{color:'rgba(201,169,110,.5)',fontWeight:500}}>Tip:</span> Use Regenerate to get a completely new design — different layout, different style, same content. Each generation is unique. Takes about 30-60 seconds.
          </div>
        </div>

      </div>
    </div>
  )
}