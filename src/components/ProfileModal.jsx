import { useState, useRef } from 'react'
import { X, Camera } from 'lucide-react'

function resizeToBase64(file, size = 200) {
  return new Promise(resolve => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size; canvas.height = size
      const ctx = canvas.getContext('2d')
      const s = Math.min(img.width, img.height)
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.src = url
  })
}

export function ProfileModal({ profile, onSave, onClose, weekStartsOn, onWeekToggle }) {
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [handle, setHandle] = useState(profile?.handle ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [photoURL, setPhotoURL] = useState(profile?.photoURL ?? '')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const base64 = await resizeToBase64(file)
    setPhotoURL(base64)
    setUploading(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ displayName, handle, bio, photoURL })
    onClose()
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px',
    border: '1px solid var(--border-base)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-subtle)',
    fontSize: 'var(--text-sm)', outline: 'none',
    color: 'var(--text-primary)',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', padding: 24, width: 380, boxShadow: 'var(--shadow-3)', maxHeight: '90vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>프로필 설정</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', lineHeight: 0 }}><X size={16} /></button>
        </div>

        {/* Avatar upload */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current.click()}>
            {photoURL
              ? <img src={photoURL} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-base)' }} />
              : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 30, fontWeight: 700 }}>
                  {(displayName || '?')[0].toUpperCase()}
                </div>
            }
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: uploading ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => !uploading && (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
            onMouseLeave={e => !uploading && (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
            >
              {uploading
                ? <span style={{ color: '#fff', fontSize: 11 }}>업로드 중...</span>
                : <Camera size={20} color="white" style={{ opacity: 0 }} className="cam-icon" />
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>닉네임</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={inputStyle} placeholder="닉네임" />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>아이디 (@handle)</label>
            <input value={handle} onChange={e => setHandle(e.target.value.replace(/\s/g, ''))} style={inputStyle} placeholder="handle" />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>자기소개</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} placeholder="자기소개를 입력하세요..." />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ padding: '7px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', border: '1px solid var(--border-base)', background: 'transparent', cursor: 'pointer' }}>
              취소
            </button>
            <button type="submit" disabled={uploading}
              style={{ padding: '7px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600, color: '#fff', background: 'var(--accent)', cursor: 'pointer', opacity: uploading ? 0.6 : 1 }}>
              저장
            </button>
          </div>
        </form>
      </div>

      <style>{`
        div:hover .cam-icon { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
