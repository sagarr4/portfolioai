'use client'

import { useState } from 'react'

export default function PhotoUpload({
  portfolioId,
  onComplete,
  onSkip
}: {
  portfolioId: string
  onComplete: (photoUrl: string) => void
  onSkip: () => void
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Image must be under 8MB')
      return
    }

    setError(null)
    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('portfolioId', portfolioId)
      formData.append('photo', file)

      const res = await fetch('/api/enhance-photo', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError('Could not process photo -- continuing without one')
        setTimeout(() => onSkip(), 1500)
        return
      }

      onComplete(data.photoUrl)
    } catch {
      setError('Something went wrong -- continuing without a photo')
      setTimeout(() => onSkip(), 1500)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <h3 style={{ marginBottom: 12, color: '#f5f0e8' }}>Add a professional photo?</h3>
      <p style={{ color: 'rgba(245,240,232,.5)', marginBottom: 24, fontSize: 14 }}>
        Optional. We will enhance the background to match your portfolio&apos;s theme.
      </p>

      {preview && (
        <img
          src={preview}
          alt="Preview"
          style={{ width: 120, height: 120, borderRadius: 12, objectFit: 'cover', marginBottom: 20, margin: '0 auto 20px' }}
        />
      )}

      {error && (
        <p style={{ color: '#e07856', fontSize: 13, marginBottom: 16 }}>{error}</p>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <label style={{
          background: '#c9a96e',
          color: '#0c0a08',
          padding: '12px 24px',
          borderRadius: 6,
          fontWeight: 700,
          cursor: uploading ? 'default' : 'pointer',
          opacity: uploading ? 0.6 : 1,
          fontSize: 14
        }}>
          {uploading ? 'Processing...' : 'Upload photo'}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
            style={{ display: 'none' }}
          />
        </label>

        <button
          onClick={onSkip}
          disabled={uploading}
          style={{
            background: 'transparent',
            border: '1px solid rgba(245,240,232,.2)',
            color: 'rgba(245,240,232,.6)',
            padding: '12px 24px',
            borderRadius: 6,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          Skip
        </button>
      </div>
    </div>
  )
}
