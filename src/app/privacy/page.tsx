export default function PrivacyPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0c0a08',color:'#f5f0e8',fontFamily:"'DM Sans',sans-serif",padding:'120px 72px 80px'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{-webkit-font-smoothing:antialiased}`}</style>
      <div style={{maxWidth:720,margin:'0 auto'}}>
        <a href="/" style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#f5f0e8',textDecoration:'none',letterSpacing:'-.02em',display:'block',marginBottom:64}}>Portfolio<span style={{color:'#c9a96e'}}>AI</span></a>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:48,fontWeight:700,letterSpacing:'-.04em',marginBottom:12,lineHeight:1}}>Privacy <em style={{fontStyle:'italic',color:'#c9a96e'}}>Policy</em></h1>
        <p style={{fontSize:13,color:'rgba(245,240,232,.3)',marginBottom:48}}>Last updated: May 2026</p>
        {[
          {h:'What we collect',p:'We collect your email address when you sign up, your resume PDF when you upload it, and basic usage data to improve the product. We do not sell your data to anyone.'},
          {h:'How we use your data',p:'Your resume is used solely to generate your portfolio website. We store it securely in Supabase. Your email is used to send you important account updates only, no spam.'},
          {h:'Resume data',p:'Your resume text is sent to Anthropic\'s Claude API to generate your portfolio. Anthropic does not train their models on API data. Your resume is not shared with any other third party.'},
          {h:'Payments',p:'Payments are processed by Stripe. We never see or store your credit card details. Stripe is PCI-DSS compliant.'},
          {h:'Cookies',p:'We use essential cookies for authentication only. We do not use tracking or advertising cookies.'},
          {h:'Your rights',p:'You can delete your account and all associated data at any time by emailing us at privacy@portfolioai.company. We will process your request within 30 days.'},
          {h:'Contact',p:'For privacy questions: privacy@portfolioai.company'},
        ].map((s,i) => (
          <div key={i} style={{marginBottom:40,paddingBottom:40,borderBottom:'1px solid rgba(245,240,232,.06)'}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#f5f0e8',marginBottom:12,letterSpacing:'-.02em'}}>{s.h}</h2>
            <p style={{fontSize:15,color:'rgba(245,240,232,.5)',lineHeight:1.8,fontWeight:300}}>{s.p}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
