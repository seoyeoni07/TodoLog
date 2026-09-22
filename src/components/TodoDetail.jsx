import { useState } from 'react'
import { format, addDays, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Trash2, Check, ChevronDown, ChevronUp, RotateCcw, Pencil, X } from 'lucide-react'

const REPEAT_LABELS = {
  daily: '매일', weekdays: '평일', weekly: '매주', biweekly: '격주', monthly: '매월', yearly: '매년', custom: '특정 요일',
}
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export function TodoDetail({ todo, category, onUpdate, onDelete, onDeleteRoutineDate, onToggle, onBack }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(todo.text)
  const [memo, setMemo] = useState(todo.memo ?? '')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showRoutine, setShowRoutine] = useState(false)

  const r = todo.routine ?? {}
  const [routineEnabled, setRoutineEnabled] = useState(r.enabled ?? false)
  const [routineStart, setRoutineStart] = useState(r.startDate ?? todo.date ?? '')
  const [routineEnd, setRoutineEnd] = useState(r.endDate ?? '')
  const [repeatType, setRepeatType] = useState(r.repeatType ?? 'daily')
  const [customDays, setCustomDays] = useState(r.customDays ?? [1, 2, 3, 4, 5])
  const [manualAdd, setManualAdd] = useState(r.manualAdd ?? false)

  function saveEdit() {
    if (text.trim()) onUpdate(todo._isRoutineInstance ? todo._routineId : todo.id, { text: text.trim(), memo })
    setEditing(false)
  }

  function handleTomorrow() {
    const tomorrow = format(addDays(parseISO(todo.date), 1), 'yyyy-MM-dd')
    onUpdate(todo._isRoutineInstance ? todo._routineId : todo.id, { date: tomorrow })
    onBack()
  }

  function handleDateChange(e) {
    onUpdate(todo._isRoutineInstance ? todo._routineId : todo.id, { date: e.target.value })
    setShowDatePicker(false)
    onBack()
  }

  function saveRoutine() {
    const routine = routineEnabled
      ? { enabled: true, startDate: routineStart, endDate: routineEnd || null, repeatType, ...(repeatType === 'custom' ? { customDays } : {}), manualAdd }
      : { enabled: false }
    onUpdate(todo._isRoutineInstance ? todo._routineId : todo.id, { routine })
    setShowRoutine(false)
  }

  const dateLabel = (() => {
    try { return format(parseISO(todo.date), 'M월 d일 (EEE)', { locale: ko }) } catch { return todo.date }
  })()

  const inputStyle = {
    width: '100%', padding: '7px 0',
    border: 'none', borderBottom: '1px solid var(--border-base)',
    background: 'transparent', fontSize: 'var(--text-sm)',
    outline: 'none', color: 'var(--text-primary)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Title row */}
      {editing ? (
        <div style={{ marginBottom: 16 }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ ...inputStyle, fontSize: 'var(--text-base)', fontWeight: 600, paddingBottom: 6 }}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && saveEdit()}
          />
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            rows={2}
            placeholder="메모..."
            style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit', marginTop: 8, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}
          />
          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            <button onClick={saveEdit} style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              저장
            </button>
            <button onClick={() => setEditing(false)} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              취소
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, group: true }}
          onMouseEnter={e => { const btn = e.currentTarget.querySelector('[data-edit]'); if (btn) btn.style.opacity = 1 }}
          onMouseLeave={e => { const btn = e.currentTarget.querySelector('[data-edit]'); if (btn) btn.style.opacity = 0 }}
        >
          <p style={{ flex: 1, fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.45, cursor: 'default' }}>
            {todo.text}
            {todo._isRoutineInstance && (
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 6 }}>루틴</span>
            )}
          </p>
          <button
            data-edit
            onClick={() => setEditing(true)}
            style={{ opacity: 0, transition: 'opacity var(--duration-fast)', color: 'var(--text-muted)', padding: 2, lineHeight: 0, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', marginTop: 2 }}
          >
            <Pencil size={12} />
          </button>
        </div>
      )}

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        {/* Row 1: category + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {category && (
            <>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: category.color, flexShrink: 0 }} />
              <span style={{ color: category.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{category.name}</span>
              <span style={{ opacity: 0.3 }}>·</span>
            </>
          )}
          <span style={{ whiteSpace: 'nowrap' }}>{dateLabel}</span>
        </div>
        {/* Row 2: time range (only if time set) */}
        {todo.time && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="time" defaultValue={todo.time}
              onChange={e => onUpdate(todo._isRoutineInstance ? todo._routineId : todo.id, { time: e.target.value || null })}
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 'var(--text-xs)', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0, width: 90 }}
            />
            <span>–</span>
            <input type="time" defaultValue={todo.timeEnd ?? ''}
              onChange={e => onUpdate(todo._isRoutineInstance ? todo._routineId : todo.id, { timeEnd: e.target.value || null })}
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: 'var(--text-xs)', color: todo.timeEnd ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, padding: 0, width: 90 }}
            />
          </div>
        )}
      </div>

      {/* Memo display */}
      {todo.memo && !editing && (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
          {todo.memo}
        </p>
      )}

      {/* Quick actions — text links, no borders */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 'var(--text-xs)', fontWeight: 600 }}>
        <button onClick={handleTomorrow}
          style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          내일하기
        </button>
        <button onClick={() => setShowDatePicker(s => !s)}
          style={{ color: showDatePicker ? 'var(--accent)' : 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = showDatePicker ? 'var(--accent)' : 'var(--text-secondary)'}
        >
          날짜 변경
        </button>
      </div>

      {/* Inline date picker */}
      {showDatePicker && (
        <input type="date" defaultValue={todo.date} onChange={handleDateChange}
          style={{ ...inputStyle, marginBottom: 16, fontSize: 'var(--text-sm)' }}
          autoFocus
        />
      )}

      {/* Routine section — hidden for routine instances (controlled by parent) */}
      {!todo._isRoutineInstance && <div style={{ borderTop: '1px solid var(--border-base)', paddingTop: 14 }}>
        <button
          onClick={() => setShowRoutine(s => !s)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 'var(--text-xs)', fontWeight: 600,
            color: routineEnabled ? 'var(--accent)' : 'var(--text-muted)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <RotateCcw size={11} />
            루틴 {routineEnabled ? '켜짐' : ''}
          </span>
          {showRoutine ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {showRoutine && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>

            {/* Enable toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>루틴 사용</span>
              <button onClick={() => setRoutineEnabled(v => !v)}
                style={{ width: 34, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer', background: routineEnabled ? 'var(--accent)' : 'var(--border-base)', position: 'relative', transition: 'background var(--duration-base)' }}>
                <span style={{ position: 'absolute', top: 2, left: routineEnabled ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left var(--duration-base) var(--ease)' }} />
              </button>
            </div>

            {routineEnabled && (
              <>
                {/* Repeat type — segmented */}
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 6 }}>반복</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', background: 'var(--bg-subtle)', borderRadius: 6, padding: 2, gap: 1 }}>
                    {Object.entries(REPEAT_LABELS).map(([val, label]) => (
                      <button key={val} onClick={() => setRepeatType(val)}
                        style={{
                          flex: '1 1 auto', padding: '3px 6px', borderRadius: 4, border: 'none', cursor: 'pointer',
                          fontSize: '0.68rem', fontWeight: 600,
                          background: repeatType === val ? 'var(--bg-base)' : 'transparent',
                          color: repeatType === val ? 'var(--text-primary)' : 'var(--text-muted)',
                          boxShadow: repeatType === val ? 'var(--shadow-1)' : 'none',
                          transition: 'background var(--duration-fast), color var(--duration-fast)',
                          whiteSpace: 'nowrap',
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* Custom day picker */}
                  {repeatType === 'custom' && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                      {DAY_LABELS.map((label, i) => {
                        const active = customDays.includes(i)
                        return (
                          <button key={i}
                            onClick={() => setCustomDays(prev => active ? prev.filter(d => d !== i) : [...prev, i].sort())}
                            style={{
                              flex: 1, padding: '4px 0', borderRadius: 4, border: 'none', cursor: 'pointer',
                              fontSize: '0.68rem', fontWeight: 700,
                              background: active ? 'var(--accent)' : 'var(--bg-subtle)',
                              color: active ? '#fff' : i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : 'var(--text-muted)',
                              transition: 'background var(--duration-fast), color var(--duration-fast)',
                            }}>
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Start / End date — underline style */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>시작</div>
                    <input type="date" value={routineStart} onChange={e => setRoutineStart(e.target.value)}
                      style={{ ...inputStyle, fontSize: 'var(--text-xs)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>종료</div>
                    <input type="date" value={routineEnd} onChange={e => setRoutineEnd(e.target.value)}
                      style={{ ...inputStyle, fontSize: 'var(--text-xs)' }} />
                  </div>
                </div>

                {/* Manual add */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500 }}>수동 추가</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>끄면 날짜마다 자동 표시</div>
                  </div>
                  <button onClick={() => setManualAdd(v => !v)}
                    style={{ width: 34, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer', background: manualAdd ? 'var(--accent)' : 'var(--border-base)', position: 'relative', transition: 'background var(--duration-base)' }}>
                    <span style={{ position: 'absolute', top: 2, left: manualAdd ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left var(--duration-base) var(--ease)' }} />
                  </button>
                </div>
              </>
            )}

            <button onClick={saveRoutine}
              style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'right', alignSelf: 'flex-end' }}>
              저장
            </button>
          </div>
        )}
      </div>}

      {/* Delete — isolated at bottom, destructive */}
      <div style={{ borderTop: '1px solid var(--border-base)', marginTop: 16, paddingTop: 12 }}>
        {todo._isRoutineInstance ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => { onDeleteRoutineDate(todo._routineId, todo._routineDate); onBack() }}
              style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--status-error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <Trash2 size={11} /> 이 날만 삭제
            </button>
            <button
              onClick={() => { onDelete(todo._routineId); onBack() }}
              style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--status-error)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              루틴 전체 삭제
            </button>
          </div>
        ) : (
          <button
            onClick={() => { onDelete(todo.id); onBack() }}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--status-error)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Trash2 size={11} /> 삭제
          </button>
        )}
      </div>
    </div>
  )
}
