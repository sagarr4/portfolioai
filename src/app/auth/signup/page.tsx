'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [focus, setFocus] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name } },
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Welcome to PortfolioAI')
    router.push('/dashboard')
  }

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '13px 16px',
    background: '#0c0a08',
    border: `1px solid ${focus === field ? 'rgba(201,169,110,.5)' : 'rgba(245,240,232,.1)'}`,
    borderRadius: 3,
    color: '#f5f0e8',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 400,
    transition: 'border-color .2s',
    outline: 'none',
  })

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          fontWeight: 700,
          color: '#f5f0e8',
          letterSpacing: '-.03em',
          marginBottom: 8,
          lineHeight: 1.1
        }}>Create your account</h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'rgba(245,240,232,.35)',
          fontWeight: 300
        }}>Your world-class portfolio awaits</p>
      </div>

      <div style={{
        width: '100%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(201,169,110,.3), transparent)',
        marginBottom: 32
      }} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <label style={{
            display: 'block',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '.12em',
            textTransform: 'uppercase' as const,
            color: 'rgba(245,240,232,.35)',
            marginBottom: 8
          }}>Full name</label>
          <input
            type="text" required value={form.name}
            placeholder="Jane Smith"
            onFocus={() => setFocus('name')}
            onBlur={() => setFocus('')}
            onChange={e => setForm({ ...form, name: e.target.value })}
            style={inputStyle('name')}
          />
        </div>
        <div>
          <label style={{
            display: 'block',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '.12em',
            textTransform: 'uppercase' as const,
            color: 'rgba(245,240,232,.35)',
            marginBottom: 8
          }}>Email address</label>
          <input
            type="email" required value={form.email}
            placeholder="jane@example.com"
            onFocus={() => setFocus('email')}
            onBlur={() => setFocus('')}
            onChange={e => setForm({ ...form, email: e.target.value })}
            style={inputStyle('email')}
          />
        </div>
        <div>
          <label style={{
            display: 'block',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '.12em',
            textTransform: 'uppercase' as const,
            color: 'rgba(245,240,232,.35)',
            marginBottom: 8
          }}>Password</label>
          <input
            type="password" required minLength={8} value={form.password}
            placeholder="Minimum 8 characters"
            onFocus={() => setFocus('pass')}
            onBlur={() => setFocus('')}
            onChange={e => setForm({ ...form, password: e.target.value })}
            style={inputStyle('pass')}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: loading ? '#a08855' : '#c9a96e',
            color: '#0c0a08',
            border: 'none',
            borderRadius: 3,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '.03em',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all .25s',
            marginTop: 8
          }}
        >
          {loading ? 'Creating your account...' : 'Create account'}
        </button>
      </form>

      <p style={{
        textAlign: 'center',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        color: 'rgba(245,240,232,.3)',
        marginTop: 28,
        fontWeight: 300
      }}>
        Already have an account?{' '}
        <a href="/auth/login" style={{ color: '#c9a96e', fontWeight: 500 }}>Sign in</a>
      </p>
    </>
  )
}
