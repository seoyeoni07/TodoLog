import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { Check } from 'lucide-react'

const SAT_COLOR = '#3B82F6'
const SUN_COLOR = '#EF4444'

function hexAlpha(hex, alpha) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex
  return hex + Math.round(alpha * 255).toString(16).padStart(2, '0')
}

function getCellStyle(todos, categories) {
  if (!todos || todos.length === 0) {
    return { bg: 'var(--bg-subtle)', check: false, remaining: 0, dots: [] }
  }

  const done = todos.filter(t => t.done).length
  const total = todos.length
  const ratio = done / total

  // Group by category color
  const groups = {}
  todos.forEach(t => {
    const cat = categories.find(c => c.id === t.categoryId)
    const color = cat?.color ?? '#9CA3AF'
    if (!groups[color]) groups[color] = { done: 0, total: 0 }
    groups[color].total++
    if (t.done) groups[color].done++
  })
  const sorted = Object.entries(groups).sort((a, b) => b[1].total - a[1].total)
  const dominant = sorted[0][0]

  // Dots: one per unique category (up to 3), filled = all done for that category
  const dots = sorted.slice(0, 3).map(([color, g]) => ({ color, filled: g.done === g.total && g.done > 0 }))

  if (ratio === 0) {
    return { bg: hexAlpha(dominant, 0.13), check: false, remaining: total, dots }
  }
  if (ratio === 1) {
    return { bg: dominant, check: true, remaining: 0, dots: sorted.length > 1 ? dots : [] }
  }

  // Partial: opacity scales smoothly from 0.18 → 0.82
  return { bg: hexAlpha(dominant, 0.18 + ratio * 0.64), check: false, remaining: total - done, dots }
}

export function CalendarWidget({ currentMonth, todos, categories, selectedDate, onDateSelect, weekStartsOn = 1 }) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const byDate = {}
  todos.forEach(t => {
    if (!byDate[t.date]) byDate[t.date] = []
    byDate[t.date].push(t)
  })

  const dayNames = weekStartsOn === 0
    ? ['일', '월', '화', '수', '목', '금', '토']
    : ['월', '화', '수', '목', '금', '토', '일']

  return (
    <div>
      {/* Day name headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 8 }}>
        {dayNames.map((d, i) => {
          const isSat = weekStartsOn === 1 ? i === 5 : i === 6
          const isSun = weekStartsOn === 1 ? i === 6 : i === 0
          return (
            <div key={d} style={{
              textAlign: 'center', fontSize: '0.73rem', fontWeight: 700,
              color: isSun ? SUN_COLOR : isSat ? SAT_COLOR : 'var(--text-muted)',
              paddingBottom: 4,
            }}>{d}</div>
          )
        })}
      </div>

      {/* Date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const inMonth = day.getMonth() === currentMonth.getMonth()
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const dow = day.getDay()
          const isSat = dow === 6
          const isSun = dow === 0
          const dayTodos = inMonth ? (byDate[dateStr] ?? []) : []
          const { bg, check, remaining, dots } = getCellStyle(dayTodos, categories)
          const hasTodos = dayTodos.length > 0

          const dateColor = check
            ? 'rgba(255,255,255,0.88)'
            : isToday
            ? 'var(--accent)'
            : isSun ? SUN_COLOR
            : isSat ? SAT_COLOR
            : 'var(--text-muted)'

          return (
            <div
              key={dateStr}
              onClick={() => inMonth && onDateSelect(dateStr)}
              style={{
                width: '100%', aspectRatio: '1',
                borderRadius: 10,
                background: inMonth ? bg : 'transparent',
                border: isSelected
                  ? '2px solid var(--text-primary)'
                  : isToday
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'space-between',
                padding: '4px 2px 3px',
                cursor: inMonth ? 'pointer' : 'default',
                opacity: inMonth ? 1 : 0,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 80ms var(--ease)',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => { if (inMonth) e.currentTarget.style.transform = 'scale(1.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
            >
              {/* Date number — top */}
              <span style={{
                fontSize: '0.70rem',
                color: dateColor,
                fontWeight: isToday ? 700 : 400,
                lineHeight: 1,
                flexShrink: 0,
              }}>
                {format(day, 'd')}
              </span>

              {/* Center: check or remaining count */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {check
                  ? <Check size={12} color="white" strokeWidth={3} />
                  : remaining > 0
                  ? <span style={{
                      fontSize: '0.60rem', fontWeight: 700, lineHeight: 1,
                      color: hasTodos ? 'rgba(255,255,255,0.80)' : 'var(--text-muted)',
                    }}>{remaining}</span>
                  : null}
              </div>

              {/* Bottom: category dots */}
              {dots.length > 0 && (
                <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0, height: 5 }}>
                  {dots.map((dot, i) => (
                    <div key={i} style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: dot.filled ? dot.color : 'transparent',
                      border: `1.5px solid ${dot.color}`,
                      opacity: check ? 0.85 : 1,
                      flexShrink: 0,
                    }} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
