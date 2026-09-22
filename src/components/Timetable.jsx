import { format } from 'date-fns'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 6~23

export function Timetable({ todos, date, onAddAtTime }) {
  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')
  const currentHour = now.getHours()

  const byHour = {}
  todos.forEach(t => {
    if (!t.time) return
    const h = parseInt(t.time.split(':')[0], 10)
    if (!byHour[h]) byHour[h] = []
    byHour[h].push(t)
  })

  return (
    <div style={{ overflowY: 'auto', maxHeight: 220 }}>
      {HOURS.map(h => {
        const isNow = date === todayStr && h === currentHour
        const items = byHour[h] ?? []
        return (
          <div
            key={h}
            onClick={() => items.length === 0 && onAddAtTime(`${String(h).padStart(2, '0')}:00`)}
            style={{
              display: 'flex', gap: 8, padding: '3px 0 3px 8px',
              borderLeft: `2px solid ${isNow ? 'var(--accent)' : 'var(--border-base)'}`,
              cursor: items.length === 0 ? 'pointer' : 'default',
              minHeight: 22,
              transition: 'background var(--duration-fast)',
            }}
            onMouseEnter={e => { if (items.length === 0) e.currentTarget.style.background = 'var(--bg-hover)' }}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{
              fontSize: '0.65rem', fontWeight: isNow ? 700 : 400, flexShrink: 0, width: 30,
              color: isNow ? 'var(--accent)' : 'var(--text-muted)',
              lineHeight: '16px',
            }}>
              {String(h).padStart(2, '0')}:00
            </span>
            <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {items.map(t => (
                <span key={t.id} style={{
                  fontSize: '0.65rem', padding: '1px 6px', borderRadius: 3,
                  background: 'var(--accent-subtle)', color: 'var(--accent)',
                  fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {t.time} {t.text}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
