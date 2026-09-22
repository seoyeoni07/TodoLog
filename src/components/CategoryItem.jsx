import { useState, useRef } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { CATEGORY_COLORS } from '../hooks/useCategories'

const SCOPE_LABELS = { public: '전체공개', followers: '팔로워공개', friends: '친구공개' }

export function CategoryItem({ category, isFiltered, onFilter, onUpdate, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [color, setColor] = useState(category.color)
  const [publicScope, setPublicScope] = useState(category.publicScope ?? 'public')
  const colorInputRef = useRef()

  function saveEdit() {
    if (name.trim()) onUpdate(category.id, { name: name.trim(), color, publicScope })
    setEditing(false)
  }

  if (editing) {
    return (
      <div style={{ padding: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: 2 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
          style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 'var(--text-sm)', marginBottom: 8, color: 'var(--text-primary)' }}
        />

        {/* Color picker */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6 }}>
          {CATEGORY_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: 16, height: 16, borderRadius: '50%', background: c, padding: 0,
              border: color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
            }} />
          ))}
          {/* Custom color input */}
          <button
            onClick={() => colorInputRef.current.click()}
            title="직접 선택"
            style={{
              width: 16, height: 16, borderRadius: '50%', padding: 0,
              background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
              border: '2px solid var(--border-base)', cursor: 'pointer',
            }}
          />
          <input ref={colorInputRef} type="color" value={color}
            onChange={e => setColor(e.target.value)}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          />
        </div>

        {/* Current color preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{color}</span>
        </div>

        {/* Privacy */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>공개 설정</div>
          <div style={{ display: 'flex', gap: 3 }}>
            {Object.entries(SCOPE_LABELS).map(([val, label]) => (
              <button key={val} onClick={() => setPublicScope(val)}
                style={{
                  padding: '3px 7px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                  fontSize: '0.65rem', fontWeight: 600,
                  background: publicScope === val ? color + '30' : 'var(--bg-base)',
                  color: publicScope === val ? color : 'var(--text-muted)',
                  outline: publicScope === val ? `1px solid ${color}` : 'none',
                }}
              >{label}</button>
            ))}
          </div>
          {publicScope === 'friends' && (
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>친구 선택은 친구 기능 추가 후 설정 가능해요.</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={saveEdit} style={{ color: 'var(--accent)', lineHeight: 0 }}><Check size={13} /></button>
          <button onClick={() => setEditing(false)} style={{ color: 'var(--text-muted)', lineHeight: 0 }}><X size={13} /></button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => onFilter(category.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', textAlign: 'left',
        padding: '6px 8px', borderRadius: 'var(--radius-md)',
        background: isFiltered ? category.color + '18' : 'transparent',
        color: isFiltered ? category.color : 'var(--text-secondary)',
        border: 'none', cursor: 'pointer',
        fontSize: 'var(--text-sm)', fontWeight: 500,
        transition: 'background 0.1s', marginBottom: 2,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: category.color, flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{category.name}</span>
      {category.publicScope && category.publicScope !== 'public' && (
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', opacity: 0.7 }}>
          {category.publicScope === 'followers' ? '팔로워' : '친구'}
        </span>
      )}
      {hovered && (
        <>
          <span onClick={e => { e.stopPropagation(); setEditing(true) }} style={{ color: 'var(--text-muted)', lineHeight: 0, padding: 2 }}><Pencil size={11} /></span>
          <span onClick={e => { e.stopPropagation(); onDelete(category.id) }} style={{ color: 'var(--text-muted)', lineHeight: 0, padding: 2 }}><Trash2 size={11} /></span>
        </>
      )}
    </button>
  )
}
