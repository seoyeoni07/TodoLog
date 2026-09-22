import { useMemo, useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from 'date-fns'
import { EventBlock } from './EventBlock'

const DAYS_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAYS_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_MON_KO = ['월', '화', '수', '목', '금', '토', '일']
const DAYS_SUN_KO = ['일', '월', '화', '수', '목', '금', '토']
const today = format(new Date(), 'yyyy-MM-dd')

export function CalendarGrid({ currentMonth, todos, categories, selectedDate, onDateSelect, onEventClick, weekStartsOn = 1 }) {
  const DAYS = weekStartsOn === 0 ? DAYS_SUN_KO : DAYS_MON_KO
  const WEEKEND_INDICES = weekStartsOn === 0 ? [0, 6] : [5, 6] // sun/sat positions
  const catMap = useMemo(() => Object.fromEntries(categories.map(c => [c.id, c])), [categories])
  const [hoveredDate, setHoveredDate] = useState(null)

  const todosByDate = useMemo(() => {
    const map = {}
    todos.forEach(t => {
      if (!map[t.date]) map[t.date] = []
      map[t.date].push(t)
    })
    return map
  }, [todos])

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn })
    const rows = []
    let day = start
    while (day <= end) {
      const week = []
      for (let i = 0; i < 7; i++) {
        week.push(new Date(day))
        day = addDays(day, 1)
      }
      rows.push(week)
    }
    return rows
  }, [currentMonth, weekStartsOn])

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
      {/* Day headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-base)',
        flexShrink: 0,
      }}>
        {DAYS.map((d, i) => {
          const isWeekend = WEEKEND_INDICES.includes(i)
          return (
            <div key={d} style={{
              textAlign: 'center',
              padding: '10px 0',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: isWeekend ? 'var(--accent)' : 'var(--text-muted)',
            }}>
              {d}
            </div>
          )
        })}
      </div>

      {/* Weeks */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, minHeight: 80 }}>
            {week.map((d, di) => {
              const ds = format(d, 'yyyy-MM-dd')
              const inMonth = isSameMonth(d, currentMonth)
              const isToday = ds === today
              const isSelected = ds === selectedDate
              const isHovered = ds === hoveredDate
              const isWeekend = WEEKEND_INDICES.includes(di)
              const dayTodos = todosByDate[ds] ?? []
              const visible = dayTodos.slice(0, 3)
              const overflow = dayTodos.length - 3

              let bg = 'var(--bg-base)'
              if (isSelected) bg = 'var(--accent-subtle-strong)'
              else if (isHovered) bg = 'var(--bg-hover)'

              return (
                <div
                  key={di}
                  onClick={() => onDateSelect(ds)}
                  onMouseEnter={() => setHoveredDate(ds)}
                  onMouseLeave={() => setHoveredDate(null)}
                  style={{
                    borderRight: di < 6 ? '1px solid var(--border-base)' : 'none',
                    borderBottom: '1px solid var(--border-base)',
                    padding: '8px 7px 6px',
                    cursor: 'pointer',
                    background: bg,
                    transition: `background var(--duration-fast) var(--ease)`,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Selected accent line */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      height: 2, background: 'var(--accent)',
                      borderRadius: '0 0 2px 2px',
                    }} />
                  )}

                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    fontSize: 'var(--text-xs)',
                    fontWeight: isToday ? 700 : inMonth ? 500 : 400,
                    color: isToday
                      ? '#fff'
                      : !inMonth
                      ? 'var(--text-muted)'
                      : isWeekend
                      ? 'var(--accent)'
                      : 'var(--text-primary)',
                    background: isToday ? 'var(--accent)' : 'transparent',
                    marginBottom: 4,
                    flexShrink: 0,
                  }}>
                    {format(d, 'd')}
                  </div>

                  {visible.map(todo => (
                    <EventBlock
                      key={todo.id}
                      todo={todo}
                      category={catMap[todo.categoryId]}
                      onClick={onEventClick}
                    />
                  ))}
                  {overflow > 0 && (
                    <div style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      paddingLeft: 4,
                      marginTop: 1,
                    }}>
                      +{overflow}개
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
