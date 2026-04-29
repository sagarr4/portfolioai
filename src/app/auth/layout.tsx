import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,800;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            min-height: 100vh;
            background: #0c0a08;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            font-family: 'DM Sans', sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          input { outline: none; font-family: 'DM Sans', sans-serif; }
          input:-webkit-autofill {
            -webkit-box-shadow: 0 0 0 1000px #161210 inset !important;
            -webkit-text-fill-color: #f5f0e8 !important;
          }
          a { text-decoration: none; }
        `}</style>
      </head>
      <body>
        <div style={{width:'100%', maxWidth:440}}>
          <div style={{textAlign:'center', marginBottom:48}}>
            <a href="/" style={{
              fontFamily:"'Playfair Display', serif",
              fontSize:28,
              fontWeight:700,
              color:'#f5f0e8',
              textDecoration:'none',
              letterSpacing:'-.02em'
            }}>
              Portfolio<span style={{color:'#c9a96e'}}>AI</span>
            </a>
            <div style={{
              width:1,
              height:48,
              background:'linear-gradient(to bottom, rgba(201,169,110,.4), transparent)',
              margin:'20px auto 0'
            }}/>
          </div>
          <div style={{
            background:'#100e0a',
            border:'1px solid rgba(245,240,232,.07)',
            borderRadius:4,
            padding:'48px 44px',
            boxShadow:'0 24px 64px rgba(0,0,0,.4)'
          }}>
            {children}
          </div>
          <p style={{
            textAlign:'center',
            marginTop:24,
            fontFamily:"'DM Sans', sans-serif",
            fontSize:12,
            color:'rgba(245,240,232,.18)',
            letterSpacing:'.04em'
          }}>
            Your data is private and secure
          </p>
        </div>
      </body>
    </html>
  )
}
