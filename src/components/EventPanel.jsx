import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { AddEventForm } from './AddEventForm'
import { TodoDetail } from './TodoDetail'

function TodoRow({ todo, onOpen, onToggle, onDelete, onDeleteRoutineDate, done }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleDeleteClick(e) {
    e.stopPropagation()
    if (todo._isRoutineInstance) {
      setConfirmDelete(true)
    } else {
      onDelete(todo.id)
    }
  }

  return (
    <div
      onClick={onOpen}
      style={{
        borderRadius: 'var(--radius-md)', cursor: 'pointer',
        transition: 'background var(--duration-fast) var(--ease)',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; if (!confirmDelete) setConfirmDelete(false) }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 4px' }}>
        <input type="checkbox" checked={!!todo.done}
          onChange={e => { e.stopPropagation(); onToggle(todo) }}
          onClick={e => e.stopPropagation()}
          style={{ cursor: 'pointer', accentColor: 'var(--accent)', flexShrink: 0, width: 14, height: 14 }}
        />
        <span style={{
          fontSize: 'var(--text-sm)', flex: 1,
          color: done ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: done ? 'line-through' : 'none',
          opacity: done ? 0.6 : 1,
        }}>
          {todo.text}
        </span>
        <button onClick={handleDeleteClick}
          style={{ color: 'var(--text-muted)', lineHeight: 0, padding: 4, borderRadius: 'var(--radius-sm)', opacity: confirmDelete ? 1 : 0, transition: 'opacity var(--duration-fast) var(--ease)', flexShrink: 0 }}
          onMouseEnter={e => e.currentTarget.style.opacity = 1}
          onMouseLeave={e => { if (!confirmDelete) e.currentTarget.style.opacity = 0 }}
        >
          <Trash2 size={12} />
        </button>
      </div>
      {confirmDelete && (
        <div onClick={e => e.stopPropagation()}
          style={{ display: 'flex', gap: 8, padding: '0 4px 6px 26px', fontSize: 'var(--text-xs)' }}>
          <button onClick={() => { onDeleteRoutineDate(todo._routineId, todo._routineDate); setConfirmDelete(false) }}
            style={{ color: 'var(--text-secondary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            이 날만
          </button>
          <button onClick={() => { onDelete(todo._routineId); setConfirmDelete(false) }}
            style={{ color: 'var(--status-error)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            루틴 전체
          </button>
          <button onClick={() => setConfirmDelete(false)}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 2 }}>
            취소
          </button>
        </div>
      )}
    </div>
  )
}

export function EventPanel({
  date, todos, categories, manualRoutines = [],
  onToggle, onDelete, onDeleteRoutineDate, onUpdate, onAdd,
  addTrigger, onAddTriggerConsumed,
}) {
  const [mode, setMode] = useState('list') // 'list' | 'add' | 'detail'
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [addInitialTime, setAddInitialTime] = useState('')
  const [showDone, setShowDone] = useState(false)

  useEffect(() => {
    if (addTrigger) {
      setAddInitialTime(addTrigger.time ?? '')
      setMode('add')
      onAddTriggerConsumed?.()
    }
  }, [addTrigger])

  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))

  const activeTodos = todos.filter(t => !t.done)
  const doneTodos = todos.filter(t => t.done)

  const groups = {}
  activeTodos.forEach(t => {
    const key = t.categoryId ?? '__none__'
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })
  const orderedKeys = [
    ...categories.map(c => c.id).filter(id => groups[id]),
    ...(groups['__none__'] ? ['__none__'] : [])
  ]

  const dateLabel = (() => {
    try { return format(parseISO(date), 'M월 d일 (EEE)', { locale: ko }) }
    catch { return date }
  })()

  function handleAdd(data) {
    onAdd(data)
    setMode('list')
  }

const dayNum = (() => { try { return format(parseISO(date), 'd') } catch { return '' } })()
  const dayOfWeek = (() => { try { return format(parseISO(date), 'EEE', { locale: ko }) } catch { return '' } })()
  const monthLabel = (() => { try { return format(parseISO(date), 'M월') } catch { return '' } })()

  return (
    <div style={{
      width: 'var(--panel-width)',
      flexShrink: 0,
      background: 'var(--bg-base)',
      borderLeft: '1px solid var(--border-base)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Date header */}
      <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid var(--border-base)', flexShrink: 0 }}>
        {mode === 'detail' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setMode('list')}
              style={{ color: 'var(--text-muted)', lineHeight: 0, padding: 4, borderRadius: 'var(--radius-sm)', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              ←
            </button>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedTodo?.text}
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>{monthLabel}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{dayNum}</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>{dayOfWeek}</span>
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>
              {activeTodos.length > 0 ? `${activeTodos.length}개` : ''}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* ── Events section ── */}
        <div style={{ padding: '14px 18px' }}>
          {/* Detail mode */}
          {mode === 'detail' && selectedTodo && (
            <TodoDetail
              todo={selectedTodo}
              category={catMap[selectedTodo.categoryId] ?? null}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onDeleteRoutineDate={onDeleteRoutineDate}
              onToggle={onToggle}
              onBack={() => setMode('list')}
            />
          )}

          {/* List mode */}
          {mode === 'list' && (
            <>
              {orderedKeys.length === 0 && doneTodos.length === 0 && manualRoutines.length === 0 && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', paddingBottom: 8 }}>일정 없음</p>
              )}
              {orderedKeys.map(key => {
                const cat = key === '__none__' ? null : catMap[key]
                return (
                  <div key={key} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${cat?.color ? cat.color + '20' : 'var(--border-base)'}` }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: cat?.color ?? 'var(--text-muted)', flexShrink: 0 }} />
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: cat?.color ?? 'var(--text-muted)', letterSpacing: '0.04em' }}>
                        {cat?.name ?? '미분류'}
                      </span>
                    </div>
                    {groups[key].map(todo => (
                      <TodoRow key={todo.id} todo={todo} onOpen={() => { setSelectedTodo(todo); setMode('detail') }} onToggle={onToggle} onDelete={onDelete} onDeleteRoutineDate={onDeleteRoutineDate} />
                    ))}
                  </div>
                )
              })}

              {/* Done section */}
              {doneTodos.length > 0 && (
                <div style={{ marginTop: orderedKeys.length ? 4 : 0 }}>
                  <button
                    onClick={() => setShowDone(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '5px 0', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', fontWeight: 600, width: '100%' }}
                  >
                    <span style={{ display: 'inline-block', transform: showDone ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform var(--duration-base) var(--ease)', fontSize: 9 }}>▶</span>
                    완료 {doneTodos.length}개
                  </button>
                  {showDone && (
                    <div style={{ marginTop: 2 }}>
                      {doneTodos.map(todo => (
                        <TodoRow key={todo.id} todo={todo} onOpen={() => { setSelectedTodo(todo); setMode('detail') }} onToggle={onToggle} onDelete={onDelete} onDeleteRoutineDate={onDeleteRoutineDate} done />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Add form */}
          {mode === 'add' && (
            <AddEventForm date={date} categories={categories} onAdd={handleAdd} onCancel={() => { setMode('list'); setAddInitialTime('') }} initialTime={addInitialTime} />
          )}

          {/* Manual routine quick-add buttons */}
          {mode === 'list' && manualRoutines.map(r => {
            const cat = catMap[r.categoryId]
            const alreadyAdded = todos.some(t => !t._isRoutineInstance && t._routineId === undefined && t.text === r.text && t.date === date)
            return (
              <button key={r.id} onClick={() => onAdd({ text: r.text, categoryId: r.categoryId ?? null, date, memo: r.memo ?? '' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  width: '100%', padding: '6px 8px', marginBottom: 4,
                  borderRadius: 'var(--radius-md)',
                  border: `1px dashed ${cat?.color ?? 'var(--border-base)'}`,
                  background: 'transparent', cursor: 'pointer', fontSize: 'var(--text-sm)',
                  color: cat?.color ?? 'var(--text-secondary)',
                  opacity: alreadyAdded ? 0.4 : 1,
                }}
              >
                <Plus size={12} />
                <span style={{ flex: 1, textAlign: 'left' }}>{r.text}</span>
                <span style={{ fontSize: 'var(--text-xs)', opacity: 0.6 }}>루틴</span>
              </button>
            )
          })}

          {/* Add button */}
          {mode === 'list' && (
            <button onClick={() => setMode('add')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                width: '100%', justifyContent: 'center',
                padding: '8px 0', marginTop: 8,
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--border-base)',
                color: 'var(--text-muted)', fontSize: 'var(--text-sm)', fontWeight: 500,
                cursor: 'pointer', background: 'transparent',
                transition: 'border-color var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-base)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              <Plus size={13} /> 일정 추가
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
