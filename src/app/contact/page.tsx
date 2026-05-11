'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [focus, setFocus] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In production connect to email service
    setSent(true)
  }

  const inp = (field: string) => ({
    width: '100%',
    padding: '13px 16px',
    background: '#0c0a08',
    border: `1px solid ${focus === field ? 'rgba(201,169,110,.5)' : 'rgba(245,240,232,.1)'}`,
    borderRadius: 3,
    color: '#f5f0e8',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color .2s',
  })

  const lab = {
    display: 'block',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '.12em',
    textTransform: 'uppercase' as const,
    color: 'rgba(245,240,232,.35)',
    marginBottom: 8,
  }

  return (
    <div style={{minHeight:'100vh',background:'#0c0a08',color:'#f5f0e8',fontFamily:"'DM Sans',sans-serif",padding:'120px 72px 80px'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{-webkit-font-smoothing:antialiased}`}</style>
      <div style={{maxWidth:600,margin:'0 auto'}}>
        <a href="/" style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:'#f5f0e8',textDecoration:'none',letterSpacing:'-.02em',display:'block',marginBottom:64}}>Portfolio<span style={{color:'#c9a96e'}}>AI</span></a>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:48,fontWeight:700,letterSpacing:'-.04em',marginBottom:12,lineHeight:1}}>Get in <em style={{fontStyle:'italic',color:'#c9a96e'}}>touch</em></h1>
        <p style={{fontSize:16,color:'rgba(245,240,232,.4)',fontWeight:300,marginBottom:48,lineHeight:1.7}}>Have a question, feedback, or want to partner with us? We read every message.</p>

        {sent ? (
          <div style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:4,padding:'32px',textAlign:'center'}}>
            <div style={{fontSize:32,marginBottom:16}}>✓</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:24,color:'#4ade80',marginBottom:8}}>Message sent!</h2>
            <p style={{fontSize:14,color:'rgba(245,240,232,.4)',fontWeight:300}}>We will get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:24}}>
            <div>
              <label style={lab}>Your name</label>
              <input type="text" required value={form.name} placeholder="Jane Smith"
                onFocus={() => setFocus('name')} onBlur={() => setFocus('')}
                onChange={e => setForm({...form, name: e.target.value})}
                style={inp('name')} />
            </div>
            <div>
              <label style={lab}>Email address</label>
              <input type="email" required value={form.email} placeholder="jane@example.com"
                onFocus={() => setFocus('email')} onBlur={() => setFocus('')}
                onChange={e => setForm({...form, email: e.target.value})}
                style={inp('email')} />
            </div>
            <div>
              <label style={lab}>Message</label>
              <textarea required value={form.message} placeholder="Tell us how we can help..."
                onFocus={() => setFocus('msg')} onBlur={() => setFocus('')}
                onChange={e => setForm({...form, message: e.target.value})}
                rows={6}
                style={{...inp('msg'), resize:'vertical' as const}} />
            </div>
            <button type="submit" style={{
              padding:'14px 32px',
              background:'#c9a96e',
              color:'#0c0a08',
              border:'none',
              borderRadius:3,
              fontFamily:"'DM Sans',sans-serif",
              fontSize:14,
              fontWeight:600,
              cursor:'pointer',
              letterSpacing:'.02em',
              alignSelf:'flex-start',
              transition:'all .25s',
            }}>
              Send message
            </button>
          </form>
        )}

        <div style={{marginTop:64,paddingTop:40,borderTop:'1px solid rgba(245,240,232,.06)'}}>
          <p style={{fontSize:14,color:'rgba(245,240,232,.3)',fontWeight:300,lineHeight:1.7}}>
            You can also reach us directly at{' '}
            <a href="mailto:hello@portfolioai.company" style={{color:'#c9a96e',textDecoration:'none'}}>hello@portfolioai.company</a>
          </p>
        </div>
      </div>
    </div>
  )
}
