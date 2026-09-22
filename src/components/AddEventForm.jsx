import { useState } from 'react'

export function AddEventForm({ date, categories, onAdd, onCancel, initialTime = '', fixedCategoryId }) {
  const [text, setText] = useState('')
  const [categoryId, setCategoryId] = useState(fixedCategoryId ?? '')
  const [memo, setMemo] = useState('')
  const [time, setTime] = useState(initialTime)
  const [timeEnd, setTimeEnd] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onAdd({ text, categoryId: (fixedCategoryId !== undefined ? fixedCategoryId : categoryId) || null, date, memo, time, timeEnd })
    setText('')
    setMemo('')
    setTime('')
    setTimeEnd('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Title — prominent, borderless */}
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="무엇을 할 건가요?"
        autoFocus
        onKeyDown={e => e.key === 'Escape' && onCancel()}
        style={{
          width: '100%', padding: '2px 0 8px',
          border: 'none', borderBottom: '2px solid var(--border-base)',
          background: 'transparent', fontSize: 'var(--text-base)', fontWeight: 600,
          outline: 'none', color: 'var(--text-primary)',
          marginBottom: 14,
          transition: 'border-color var(--duration-fast)',
        }}
        onFocus={e => e.currentTarget.style.borderBottomColor = 'var(--accent)'}
        onBlur={e => e.currentTarget.style.borderBottomColor = 'var(--border-base)'}
      />

      {/* Category — pill row (hidden when category is pre-determined) */}
      {fixedCategoryId === undefined && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          <button type="button"
            onClick={() => setCategoryId('')}
            style={{
              padding: '3px 10px', borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-base)',
              background: !categoryId ? 'var(--bg-subtle)' : 'transparent',
              color: !categoryId ? 'var(--text-secondary)' : 'var(--text-muted)',
              fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
            }}
          >
            없음
          </button>
          {categories.map(cat => (
            <button key={cat.id} type="button"
              onClick={() => setCategoryId(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                border: `1px solid ${categoryId === cat.id ? cat.color : 'var(--border-base)'}`,
                background: categoryId === cat.id ? cat.color + '18' : 'transparent',
                color: categoryId === cat.id ? cat.color : 'var(--text-muted)',
                fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                transition: 'border-color var(--duration-fast), background var(--duration-fast), color var(--duration-fast)',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Time range — optional */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <input type="time" value={time} onChange={e => setTime(e.target.value)}
          style={{
            padding: '2px 0 4px', border: 'none', borderBottom: '1px solid var(--border-base)',
            background: 'transparent', fontSize: 'var(--text-xs)', color: time ? 'var(--text-primary)' : 'var(--text-muted)',
            outline: 'none', width: 80,
          }}
          onFocus={e => e.currentTarget.style.borderBottomColor = 'var(--accent)'}
          onBlur={e => e.currentTarget.style.borderBottomColor = 'var(--border-base)'}
        />
        {time && (
          <>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>–</span>
            <input type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)}
              style={{
                padding: '2px 0 4px', border: 'none', borderBottom: '1px solid var(--border-base)',
                background: 'transparent', fontSize: 'var(--text-xs)', color: timeEnd ? 'var(--text-primary)' : 'var(--text-muted)',
                outline: 'none', width: 80,
              }}
              onFocus={e => e.currentTarget.style.borderBottomColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderBottomColor = 'var(--border-base)'}
            />
            <button type="button" onClick={() => { setTime(''); setTimeEnd('') }}
              style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              ✕
            </button>
          </>
        )}
        {!time && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>시간 선택 (선택)</span>}
      </div>

      {/* Memo — minimal */}
      <textarea
        value={memo}
        onChange={e => setMemo(e.target.value)}
        placeholder="메모..."
        rows={2}
        style={{
          width: '100%', padding: '0 0 6px',
          border: 'none', borderBottom: '1px solid var(--border-base)',
          background: 'transparent', fontSize: 'var(--text-sm)',
          fontFamily: 'inherit', outline: 'none', color: 'var(--text-secondary)',
          resize: 'none', marginBottom: 16,
        }}
      />

      {/* Actions — text only */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <button type="submit"
          style={{
            fontSize: 'var(--text-sm)', fontWeight: 700,
            color: text.trim() ? 'var(--accent)' : 'var(--text-muted)',
            background: 'none', border: 'none', cursor: text.trim() ? 'pointer' : 'default', padding: 0,
          }}
        >
          추가
        </button>
        <button type="button" onClick={onCancel}
          style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          취소
        </button>
      </div>
    </form>
  )
}
