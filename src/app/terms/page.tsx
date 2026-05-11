export default function TermsPage() {
  return (
    <div style={{minHeight:'100vh',background:'#0c0a08',color:'#f5f0e8',fontFamily:"'DM Sans',sans-serif",padding:'120px 72px 80px'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{-webkit-font-smoothing:antialiased}`}</style>
      <div style={{maxWidth:720,margin:'0 auto'}}>
        <a href="/" style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#f5f0e8',textDecoration:'none',letterSpacing:'-.02em',display:'block',marginBottom:64}}>Portfolio<span style={{color:'#c9a96e'}}>AI</span></a>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:48,fontWeight:700,letterSpacing:'-.04em',marginBottom:12,lineHeight:1}}>Terms of <em style={{fontStyle:'italic',color:'#c9a96e'}}>Service</em></h1>
        <p style={{fontSize:13,color:'rgba(245,240,232,.3)',marginBottom:48}}>Last updated: May 2026</p>
        {[
          {h:'Acceptance',p:'By using PortfolioAI you agree to these terms. If you do not agree, please do not use the service.'},
          {h:'What we provide',p:'PortfolioAI generates portfolio websites from your resume using AI. We provide a free preview and charge a one-time fee to publish your portfolio publicly.'},
          {h:'Your content',p:'You own your resume and the portfolio generated from it. By uploading your resume you grant us permission to process it to generate your portfolio. You are responsible for ensuring your resume content is accurate.'},
          {h:'Payments',p:'All payments are one-time and non-refundable once your portfolio has been generated and published. If you have an issue, contact us and we will do our best to make it right.'},
          {h:'Prohibited use',p:'You may not use PortfolioAI to generate portfolios containing false information, impersonate others, or violate any laws. We reserve the right to remove any portfolio that violates these terms.'},
          {h:'Service availability',p:'We aim for 99.9% uptime but cannot guarantee uninterrupted service. We are not liable for any losses caused by service downtime.'},
          {h:'Changes',p:'We may update these terms at any time. Continued use of the service constitutes acceptance of the updated terms.'},
          {h:'Contact',p:'For terms questions: legal@portfolioai.company'},
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
