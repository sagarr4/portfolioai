'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [focus, setFocus] = useState(false)
  const [email, setEmail] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset-password',
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:'#f5f0e8',marginBottom:12}}>Check your email</h1>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:'rgba(245,240,232,.5)',marginBottom:24}}>We sent a reset link to <strong style={{color:'#c9a96e'}}>{email}</strong></p>
        <a href="/auth/login" style={{color:'#c9a96e',textDecoration:'none',fontSize:13}}>← Back to sign in</a>
      </div>
    )
  }

  return (
    <>
      <div style={{marginBottom:32}}>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:'#f5f0e8',marginBottom:8}}>Reset your password</h1>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:'rgba(245,240,232,.35)'}}>Enter your email and we will send a reset link</p>
      </div>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:20}}>
        <div>
          <label style={{display:'block',fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:500,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(245,240,232,.35)',marginBottom:8}}>Email</label>
          <input type="email" required value={email} placeholder="jane@example.com"
            onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
            onChange={e=>setEmail(e.target.value)}
            style={{width:'100%',padding:'13px 16px',background:'#0c0a08',border:'1px solid '+(focus?'rgba(201,169,110,.5)':'rgba(245,240,232,.1)'),borderRadius:3,color:'#f5f0e8',fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none'}}/>
        </div>
        <button type="submit" disabled={loading} style={{width:'100%',padding:'14px 24px',background:loading?'#a08855':'#c9a96e',color:'#0c0a08',border:'none',borderRadius:3,fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,cursor:loading?'not-allowed':'pointer',marginTop:8}}>
          {loading?'Sending...':'Send reset link'}
        </button>
      </form>
      <p style={{textAlign:'center',fontFamily:"'DM Sans',sans-serif",fontSize:13,color:'rgba(245,240,232,.3)',marginTop:28}}>
        Remembered? <a href="/auth/login" style={{color:'#c9a96e',fontWeight:500}}>Sign in</a>
      </p>
    </>
  )
}