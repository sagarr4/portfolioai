'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    toast.success('Welcome back!')
    router.push('/dashboard')
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-white mb-6">Welcome back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-purple-200 mb-1">Email</label>
          <input type="email" required value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="jane@example.com" />
        </div>
        <div>
          <label className="block text-sm text-purple-200 mb-1">Password</label>
          <input type="password" required value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Your password" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="text-center text-purple-300 text-sm mt-6">
        No account yet?{' '}
        <Link href="/auth/signup" className="text-white font-medium hover:underline">Sign up free</Link>
      </p>
    </>
  )
}
