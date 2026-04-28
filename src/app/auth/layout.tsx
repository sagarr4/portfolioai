export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{minHeight:'100vh',background:'#0c0a08',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',fontFamily:"'Playfair Display',serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{-webkit-font-smoothing:antialiased;background:#0c0a08}
        input{outline:none}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px #161210 inset!important;-webkit-text-fill-color:#f5f0e8!important}
      `}</style>
      <div style={{width:'100%',maxWidth:440}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <a href=/ style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:'#f5f0e8',textDecoration:'none',letterSpacing:'-.02em'}}>
            Portfolio<span style={{color:'#c9a96e'}}>AI</span>
          </a>
          <div style={{width:1,height:40,background:'linear-gradient(to bottom,rgba(201,169,110,.4),transparent)',margin:'20px auto 0'}}/>
        </div>
        <div style={{background:'#100e0a',border:'1px solid rgba(245,240,232,.07)',borderRadius:4,padding:'48px 44px'}}>
          {children}
        </div>
        <div style={{textAlign:'center',marginTop:24,fontFamily:"'DM Sans',sans-serif",fontSize:12,color:'rgba(245,240,232,.18)',letterSpacing:'.04em'}}>
          Your data is private and secure
        </div>
      </div>
    </div>
  )
}
