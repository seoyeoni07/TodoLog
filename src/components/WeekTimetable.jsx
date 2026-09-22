import { useRef, useEffect } from 'react'
import { format, addDays, startOfWeek } from 'date-fns'
import { ko } from 'date-fns/locale'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 06–23
const ROW_H = 44 // px per hour

export function WeekTimetable({ weekStart, todos, categories, selectedDate, onCellClick, weekStartsOn = 1 }) {
  const scrollRef = useRef()
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')
  const currentHour = now.getHours()
  const currentMin = now.getMinutes()

  // Scroll to current hour on mount
  useEffect(() => {
    if (!scrollRef.current) return
    const h = Math.max(currentHour - 6, 0)
    scrollRef.current.scrollTop = Math.max(h * ROW_H - 80, 0)
  }, [])

  // Group todos by date
  const timedByDate = {}
  const allDayByDate = {}
  todos.forEach(t => {
    if (t.time) {
      if (!timedByDate[t.date]) timedByDate[t.date] = []
      timedByDate[t.date].push(t)
    } else {
      if (!allDayByDate[t.date]) allDayByDate[t.date] = []
      allDayByDate[t.date].push(t)
    }
  })

  const catMap = Object.fromEntries((categories ?? []).map(c => [c.id, c]))

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

      {/* Day header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '44px repeat(7, 1fr)',
        borderBottom: '1px solid var(--border-base)',
        flexShrink: 0,
        background: 'var(--bg-base)',
      }}>
        <div /> {/* time gutter */}
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const dow = day.getDay()
          const isWeekend = dow === 0 || dow === 6
          const allDay = allDayByDate[dateStr] ?? []
          return (
            <div key={dateStr}
              onClick={() => onCellClick(dateStr, null)}
              style={{
                borderLeft: '1px solid var(--border-base)',
                padding: '8px 6px 6px',
                cursor: 'pointer',
                background: isSelected && !isToday ? 'var(--accent-subtle)' : 'transparent',
                transition: 'background var(--duration-fast)',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.background = isSelected && !isToday ? 'var(--accent-subtle)' : 'transparent' }}
            >
              <div style={{
                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', textAlign: 'center',
                color: isWeekend ? 'var(--accent)' : 'var(--text-muted)',
                marginBottom: 3,
              }}>
                {format(day, 'EEE', { locale: ko }).toUpperCase()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isToday ? 'var(--accent)' : 'transparent',
                  color: isToday ? '#fff' : isWeekend ? 'var(--accent)' : 'var(--text-primary)',
                  fontSize: 'var(--text-sm)', fontWeight: 700,
                }}>
                  {format(day, 'd')}
                </div>
              </div>
              {/* All-day todo dots */}
              {allDay.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 3 }}>
                  {allDay.slice(0, 3).map(t => {
                    const cat = catMap[t.categoryId]
                    return <div key={t.id} style={{ width: 4, height: 4, borderRadius: '50%', background: cat?.color ?? 'var(--text-muted)', opacity: t.done ? 0.3 : 1 }} />
                  })}
                  {allDay.length > 3 && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-muted)' }} />}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '44px repeat(7, 1fr)',
          height: HOURS.length * ROW_H,
        }}>

          {/* Time label column */}
          <div style={{ position: 'relative' }}>
            {HOURS.map(h => (
              <div key={h} style={{
                position: 'absolute', top: (h - 6) * ROW_H - 7,
                right: 8, width: 28, textAlign: 'right',
              }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1 }}>
                  {String(h).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isToday = dateStr === todayStr
            const dayTimed = timedByDate[dateStr] ?? []

            return (
              <div key={dateStr} style={{ position: 'relative', borderLeft: '1px solid var(--border-base)' }}>
                {/* Hour cells */}
                {HOURS.map(h => (
                  <div key={h}
                    onClick={() => onCellClick(dateStr, `${String(h).padStart(2, '0')}:00`)}
                    style={{
                      position: 'absolute', top: (h - 6) * ROW_H, left: 0, right: 0, height: ROW_H,
                      borderBottom: '1px solid var(--border-base)',
                      cursor: 'pointer',
                      background: isToday && h === currentHour ? 'var(--accent-subtle)' : 'transparent',
                      transition: 'background var(--duration-fast)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => { e.currentTarget.style.background = isToday && h === currentHour ? 'var(--accent-subtle)' : 'transparent' }}
                  />
                ))}

                {/* Current time line */}
                {isToday && currentHour >= 6 && currentHour <= 23 && (
                  <div style={{
                    position: 'absolute', left: 0, right: 0, zIndex: 3, pointerEvents: 'none',
                    top: (currentHour - 6) * ROW_H + (currentMin / 60) * ROW_H,
                  }}>
                    <div style={{ height: 2, background: 'var(--accent)' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', position: 'absolute', left: -4, top: -3 }} />
                  </div>
                )}

                {/* Timed todo blocks */}
                {dayTimed.map(t => {
                  const [hh, mm] = t.time.split(':').map(Number)
                  if (hh < 6 || hh > 23) return null
                  const top = (hh - 6) * ROW_H + (mm / 60) * ROW_H
                  const cat = catMap[t.categoryId]
                  const color = cat?.color ?? 'var(--accent)'

                  let blockH = ROW_H - 4 // default: 1 hour
                  if (t.timeEnd) {
                    const [eh, em] = t.timeEnd.split(':').map(Number)
                    const durMins = (eh * 60 + em) - (hh * 60 + mm)
                    if (durMins > 0) blockH = Math.max((durMins / 60) * ROW_H - 4, 20)
                  }

                  return (
                    <div key={t.id}
                      onClick={e => { e.stopPropagation(); onCellClick(dateStr, null) }}
                      style={{
                        position: 'absolute', left: 3, right: 3, top: top + 1,
                        height: blockH,
                        borderRadius: 4, zIndex: 2,
                        background: color + '22',
                        borderLeft: `3px solid ${color}`,
                        padding: '2px 5px',
                        overflow: 'hidden', cursor: 'pointer',
                        opacity: t.done ? 0.45 : 1,
                        textDecoration: t.done ? 'line-through' : 'none',
                      }}
                    >
                      <div style={{ fontSize: '0.55rem', color, fontWeight: 700, lineHeight: 1.2 }}>
                        {t.time}{t.timeEnd ? ` – ${t.timeEnd}` : ''}
                      </div>
                      <div style={{ fontSize: '0.62rem', color, fontWeight: 600, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.text}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
