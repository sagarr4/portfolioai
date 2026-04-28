import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ResumeUpload from '@/components/portfolio/ResumeUpload'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/auth/login')

  const { data: portfolios } = await supabase
    .from('portfolios').select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const count = portfolios?.length || 0

  return (
    <div style={{minHeight:'100vh',background:'#0c0a08',color:'#f5f0e8'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-font-smoothing:antialiased;background:#0c0a08}
        .pcard{display:block;text-decoration:none;background:#100e0a;border:1px solid rgba(245,240,232,.07);border-radius:4px;padding:36px;transition:all .35s;position:relative;overflow:hidden}
        .pcard::before{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#c9a96e,transparent);transform:scaleX(0);transform-origin:left;transition:transform .4s cubic-bezier(.16,1,.3,1)}
        .pcard:hover{background:#141008;border-color:rgba(201,169,110,.2);transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,.4)}
        .pcard:hover::before{transform:scaleX(1)}
        .upload-zone{border:1px solid rgba(245,240,232,.08);border-radius:4px;transition:all .3s}
        .upload-zone:hover{border-color:rgba(201,169,110,.2)}
      `}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,height:72,padding:'0 72px',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(12,10,8,.96)',borderBottom:'1px solid rgba(245,240,232,.06)',backdropFilter:'blur(20px)'}}>
        <a href="/" style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#f5f0e8',textDecoration:'none',letterSpacing:'-.02em'}}>
          Portfolio<span style={{color:'#c9a96e'}}>AI</span>
        </a>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(245,240,232,.3)',fontWeight:300}}>{user.email}</span>
          <div style={{width:1,height:16,background:'rgba(245,240,232,.1)'}}/>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'#c9a96e',background:'rgba(201,169,110,.1)',padding:'5px 12px',borderRadius:2,border:'1px solid rgba(201,169,110,.15)'}}>Free plan</span>
        </div>
      </nav>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'80px 72px'}}>

        {/* PAGE HEADER */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'end',marginBottom:80,paddingBottom:64,borderBottom:'1px solid rgba(245,240,232,.06)'}}>
          <div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'.18em',textTransform:'uppercase',color:'#c9a96e',marginBottom:20,display:'flex',alignItems:'center',gap:12}}>
              <span style={{width:32,height:1,background:'rgba(201,169,110,.4)',display:'block'}}/>
              Dashboard
            </div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:52,fontWeight:700,letterSpacing:'-.04em',color:'#f5f0e8',lineHeight:1,marginBottom:0}}>
              {count > 0 ? <>Your <em style={{fontStyle:'italic',color:'#c9a96e'}}>portfolios.</em></> : <>Ready <em style={{fontStyle:'italic',color:'#c9a96e'}}>when you are.</em></>}
            </h1>
          </div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:16,color:'rgba(245,240,232,.35)',fontWeight:300,lineHeight:1.75}}>
            {count > 0
              ? count + ' portfolio' + (count > 1 ? 's' : '') + ' generated. Each one unique — designed by AI for your exact profession. Upload a new resume anytime to create another.'
              : 'Upload your PDF resume and our AI will build a world-class portfolio website designed specifically for your profession — in under 60 seconds.'}
          </div>
        </div>

        {/* PORTFOLIOS GRID */}
        {count > 0 && (
          <div style={{marginBottom:80}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'.18em',textTransform:'uppercase',color:'rgba(245,240,232,.3)',marginBottom:32,display:'flex',alignItems:'center',gap:12}}>
              <span style={{width:32,height:1,background:'rgba(245,240,232,.15)',display:'block'}}/>
              Your portfolios
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:16}}>
              {portfolios!.map((p: any) => (
                <a key={p.id} href={'/dashboard/portfolio/' + p.id} className="pcard">
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28}}>
                    <div>
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(201,169,110,.5)',marginBottom:10}}>{p.field}</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,letterSpacing:'-.03em',color:'#f5f0e8',lineHeight:1.1}}>{p.title}</div>
                    </div>
                    <div style={{width:8,height:8,borderRadius:'50%',background:p.is_published ? '#4ade80' : 'rgba(245,240,232,.2)',marginTop:6,flexShrink:0,boxShadow:p.is_published ? '0 0 8px rgba(74,222,128,.4)' : 'none'}}/>
                  </div>
                  <div style={{width:'100%',height:1,background:'rgba(245,240,232,.06)',marginBottom:20}}/>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:p.is_published ? '#4ade80' : 'rgba(245,240,232,.25)',fontWeight:500}}>
                        {p.is_published ? '● Live' : '○ Draft'}
                      </span>
                      {p.views > 0 && (
                        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:'rgba(245,240,232,.2)',fontWeight:300}}>
                          · {p.views} views
                        </span>
                      )}
                    </div>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'#c9a96e',fontWeight:500,letterSpacing:'.02em'}}>
                      Manage →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD SECTION */}
        <div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'.18em',textTransform:'uppercase',color:'rgba(245,240,232,.3)',marginBottom:32,display:'flex',alignItems:'center',gap:12}}>
            <span style={{width:32,height:1,background:'rgba(245,240,232,.15)',display:'block'}}/>
            {count > 0 ? 'Create another' : 'Get started'}
          </div>
          <ResumeUpload />
        </div>

      </div>
    </div>
  )
}