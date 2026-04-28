'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type Status = 'idle' | 'uploading' | 'parsing' | 'generating' | 'done'

export default function ResumeUpload() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('idle')
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setFileName(file.name)
    setStatus('uploading')
    setProgress(10)

    const formData = new FormData()
    formData.append('resume', file)

    try {
      setStatus('parsing')
      setProgress(30)
      const t1 = setTimeout(() => { setStatus('generating'); setProgress(60) }, 5000)
      const t2 = setTimeout(() => setProgress(85), 15000)

      const res = await fetch('/api/parse-resume', { method: 'POST', body: formData })
      clearTimeout(t1); clearTimeout(t2)

      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'UPGRADE_REQUIRED') {
          setStatus('idle')
          if (confirm(data.message + '\n\nUpgrade now?')) {
            window.location.href = '/pricing'
          }
          return
        }
        toast.error(data.error || 'Failed')
        setStatus('idle')
        return
      }

      setStatus('done')
      setProgress(100)
      toast.success('Your portfolio is ready!')

      // Go directly to live portfolio
      setTimeout(() => {
        router.push('/portfolio/' + data.portfolio.slug)
      }, 800)

    } catch {
      toast.error('Something went wrong. Please try again.')
      setStatus('idle')
      setProgress(0)
    }
  }, [router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: status !== 'idle',
  })

  const msgs: Record<Status, { h: string; p: string }> = {
    idle: { h: 'Upload your resume', p: 'Drag and drop your PDF, or click to browse' },
    uploading: { h: 'Uploading...', p: 'Securely transferring your file' },
    parsing: { h: 'Reading your resume...', p: 'Extracting your experience, skills and achievements' },
    generating: { h: 'Building your portfolio...', p: 'Designing a world-class site for your profession — takes about 30 seconds' },
    done: { h: 'Portfolio ready!', p: 'Opening your portfolio now...' },
  }

  const msg = msgs[status]
  const isProcessing = status !== 'idle' && status !== 'done'
  const isDone = status === 'done'

  return (
    <div style={{ width: '100%', maxWidth: 600, fontFamily: "'DM Sans',sans-serif" }}>
      <div
        {...getRootProps()}
        style={{
          border: '1px solid ' + (isDragActive ? 'rgba(201,169,110,.6)' : isDone ? 'rgba(74,222,128,.4)' : isProcessing ? 'rgba(201,169,110,.25)' : 'rgba(245,240,232,.08)'),
          borderRadius: 4,
          padding: '64px 48px',
          textAlign: 'center',
          cursor: status === 'idle' ? 'pointer' : 'default',
          transition: 'all .3s',
          background: isDragActive ? 'rgba(201,169,110,.04)' : 'transparent',
        }}
      >
        <input {...getInputProps()} />

        {/* Icon */}
        <div style={{ width: 56, height: 56, borderRadius: 4, background: isDone ? 'rgba(74,222,128,.1)' : 'rgba(201,169,110,.08)', border: '1px solid ' + (isDone ? 'rgba(74,222,128,.2)' : 'rgba(201,169,110,.15)'), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 22, color: isDone ? '#4ade80' : '#c9a96e' }}>
          {status === 'idle' && '↑'}
          {status === 'uploading' && '↑'}
          {status === 'parsing' && '◎'}
          {status === 'generating' && '✦'}
          {status === 'done' && '✓'}
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.03em', color: '#f5f0e8', marginBottom: 10, fontFamily: "'Playfair Display',serif" }}>
          {msg.h}
        </h3>
        <p style={{ fontSize: 14, color: 'rgba(245,240,232,.35)', fontWeight: 300, lineHeight: 1.65, marginBottom: isProcessing ? 20 : 28 }}>
          {isProcessing ? fileName : msg.p}
        </p>
        {isProcessing && (
          <p style={{ fontSize: 13, color: '#c9a96e', marginBottom: 28 }}>{msg.p}</p>
        )}

        {status === 'idle' && (
          <>
            <div style={{ display: 'inline-block', background: '#c9a96e', color: '#0c0a08', padding: '12px 32px', borderRadius: 3, fontSize: 14, fontWeight: 600, letterSpacing: '.02em', marginBottom: 14 }}>
              Choose PDF file
            </div>
            <p style={{ fontSize: 12, color: 'rgba(245,240,232,.2)', letterSpacing: '.04em' }}>
              PDF only · Max 5MB · Ready in ~60 seconds
            </p>
          </>
        )}

        {isProcessing && (
          <div style={{ width: 200, height: 1, background: 'rgba(245,240,232,.08)', margin: '0 auto', position: 'relative', overflow: 'hidden', borderRadius: 1 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: '#c9a96e', width: progress + '%', transition: 'width 2s cubic-bezier(.16,1,.3,1)', borderRadius: 1 }} />
          </div>
        )}
      </div>
    </div>
  )
}