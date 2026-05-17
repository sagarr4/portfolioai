'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [show, setShow] = useState(false)
  const [focus, setFocus] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => {
    const supabase = createClient()
    
    // Handle recovery token from URL hash
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')
      
      if (accessToken && type === 'recovery') {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        }).then(({ error }) => {
          if (error) {
            toast.error('Invalid or expired link')
            setTimeout(() => router.push('/auth/forgot-password'), 2000)
          } else {
            setReady(true)
          }
        })
      } else {
        setReady(true)
      }
    } else {
      // Check if user already has a session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setReady(true)
        } else {
          toast.error('Invalid reset link')
          setTimeout(() => router.push('/auth/forgot-password'), 2000)
        }
      })
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Password updated! Redirecting...')
    setTimeout(() => router.push('/dashboard'), 1000)
  }

  if (!ready) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(245,240,232,.5)' }}>
          Verifying your reset link...
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#f5f0e8', letterSpacing: '-.03em', marginBottom: 8, lineHeight: 1.1 }}>Set new password</h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(245,240,232,.35)', fontWeight: 300 }}>Choose a strong password for your account</p>
      </div>

      <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,169,110,.3), transparent)', marginBottom: 32 }} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase' as const, color: 'rgba(245,240,232,.35)', marginBottom: 8 }}>New password</label>
          <div style={{ position: 'relative' }}>
            <input type={show ? 'text' : 'password'} required minLength={8} value={password} placeholder="Minimum 8 characters"
              onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '13px 46px 13px 16px', background: '#0c0a08', border: '1px solid ' + (focus ? 'rgba(201,169,110,.5)' : 'rgba(245,240,232,.1)'), borderRadius: 3, color: '#f5f0e8', fontSize: 14, fontFamily: "'DM Sans',sans-serif", outline: 'none' }} />
            <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.7 }} aria-label={show ? 'Hide' : 'Show'}>
              {show ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5f0e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5f0e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px 24px', background: loading ? '#a08855' : '#c9a96e', color: '#0c0a08', border: 'none', borderRadius: 3, fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '.03em', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .25s', marginTop: 8 }}>
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </>
  )
}
