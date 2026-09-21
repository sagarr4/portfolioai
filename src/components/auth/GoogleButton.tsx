'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Preferred path: Google Identity Services (GIS). Google shows YOUR site's domain
// (portfolioai.company) in the sign-in popup and Supabase never appears, because the
// browser sends Google's ID token straight to supabase.auth.signInWithIdToken().
// Needs NEXT_PUBLIC_GOOGLE_CLIENT_ID (same Client ID that is in Supabase's Google provider).
// Fallback (env var missing): the redirect flow through <project>.supabase.co.

type GsiCredential = { credential: string }
type GsiId = {
  initialize: (cfg: { client_id: string; callback: (r: GsiCredential) => void; nonce?: string; use_fedcm_for_prompt?: boolean }) => void
  renderButton: (el: HTMLElement, opts: Record<string, string | number>) => void
}
declare global {
  interface Window { google?: { accounts: { id: GsiId } } }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

function safeNext() {
  const wanted = new URLSearchParams(window.location.search).get('redirect') || ''
  return wanted.startsWith('/') && !wanted.startsWith('//') ? wanted : '/dashboard'
}

// Supabase wants the SHA-256 hex of the nonce sent to Google, and the raw nonce sent to Supabase.
async function makeNonce(): Promise<[string, string]> {
  const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  const hashed = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
  return [raw, hashed]
}

function OrDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(245,240,232,.1)' }} />
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.3)' }}>or</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(245,240,232,.1)' }} />
    </div>
  )
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

// ---- preferred: Google Identity Services popup button
function GisButton() {
  const router = useRouter()
  const boxRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  async function initGsi() {
    const gsi = window.google?.accounts?.id
    const box = boxRef.current
    if (!CLIENT_ID || !gsi || !box) return
    const [nonce, hashedNonce] = await makeNonce()
    gsi.initialize({
      client_id: CLIENT_ID,
      nonce: hashedNonce,
      use_fedcm_for_prompt: true,
      callback: async (resp: GsiCredential) => {
        setBusy(true)
        const { error } = await createClient().auth.signInWithIdToken({ provider: 'google', token: resp.credential, nonce })
        if (error) { toast.error(error.message); setBusy(false); return }
        router.refresh()
        router.push(safeNext())
      },
    })
    box.innerHTML = ''
    gsi.renderButton(box, {
      type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', logo_alignment: 'center',
      width: Math.min(400, Math.max(200, Math.floor(box.getBoundingClientRect().width))),
    })
  }

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={initGsi} />
      <div ref={boxRef} style={{ minHeight: 44, display: 'flex', justifyContent: 'center', opacity: busy ? 0.6 : 1, pointerEvents: busy ? 'none' : 'auto' }} />
      <OrDivider />
    </>
  )
}

// ---- fallback: redirect flow (shows <project>.supabase.co on Google's screen)
function RedirectButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    setLoading(true)
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback?next=' + encodeURIComponent(safeNext()),
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) { toast.error(error.message); setLoading(false) }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        style={{
          width: '100%', padding: '13px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          background: '#ffffff', color: '#1f1f1f', border: '1px solid #dadce0', borderRadius: 3,
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, minHeight: 44,
        }}
      >
        <GoogleG />
        {loading ? 'Redirecting to Google...' : label}
      </button>
      <OrDivider />
    </>
  )
}

export default function GoogleButton({ label = 'Continue with Google' }: { label?: string }) {
  return CLIENT_ID ? <GisButton /> : <RedirectButton label={label} />
}
