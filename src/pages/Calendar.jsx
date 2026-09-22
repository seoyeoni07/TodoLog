import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { addMonths, subMonths, format, parseISO, addWeeks, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, LogOut, Tag, Check, Settings, MoreHorizontal, Plus } from 'lucide-react'
import { useTodos } from '../hooks/useTodos'
import { useCategories, CATEGORY_COLORS } from '../hooks/useCategories'
import { useUserProfile } from '../hooks/useUserProfile'
import { useUser } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { WeekTimetable } from '../components/WeekTimetable'
import { CategoryItem } from '../components/CategoryItem'
import { ProfileModal } from '../components/ProfileModal'
import { AddEventForm } from '../components/AddEventForm'
import { TodoDetail } from '../components/TodoDetail'
import { CalendarWidget } from '../components/CalendarWidget'
import { useNavigate } from 'react-router-dom'

const ACCENT_PRESETS = [
  '#6366F1', '#3B82F6', '#8B5CF6', '#EC4899',
  '#F43F5E', '#F97316', '#F59E0B', '#22C55E',
  '#14B8A6', '#64748B',
]

function darken(hex, f = 0.82) {
  if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return hex
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * f)
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * f)
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * f)
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
}

function getStored(key, fallback) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback }
  catch { return fallback }
}

function HeaderDropdown({ children, onClose }) {
  const ref = useRef()
  useEffect(() => {
    function handler(e) { if (!ref.current?.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])
  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0,
      background: 'var(--bg-base)', border: '1px solid var(--border-base)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-3)',
      minWidth: 260, zIndex: 200, overflow: 'hidden',
    }}>
      {children}
    </div>
  )
}

function FeedTodoItem({ todo, catColor, onToggle, onDelete, onDeleteRoutineDate, onOpenDetail }) {
  const [hover, setHover] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 9,
        padding: '7px 10px', borderRadius: 8, position: 'relative',
        background: hover ? 'var(--bg-hover)' : 'transparent',
        transition: 'background var(--duration-fast)',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setConfirmDelete(false) }}
    >
      <button
        onClick={e => { e.stopPropagation(); onToggle(todo) }}
        style={{
          width: 17, height: 17, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${todo.done ? catColor : 'var(--border-base)'}`,
          background: todo.done ? catColor : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        {todo.done && <Check size={9} color="white" strokeWidth={3} />}
      </button>
      <span
        style={{
          flex: 1, fontSize: 'var(--text-sm)',
          textDecoration: todo.done ? 'line-through' : 'none',
          color: todo.done ? 'var(--text-muted)' : 'var(--text-primary)',
          cursor: 'pointer',
        }}
        onClick={() => onOpenDetail(todo)}
      >{todo.text}</span>
      {todo.time && (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {todo.time}{todo.timeEnd ? `–${todo.timeEnd}` : ''}
        </span>
      )}

      {todo._isRoutineInstance && hover && !confirmDelete && (
        <button
          onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
          style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: 4, flexShrink: 0, border: '1px solid var(--border-base)', background: 'transparent', cursor: 'pointer' }}
        >이날만 삭제</button>
      )}
      {todo._isRoutineInstance && confirmDelete && (
        <div style={{ display: 'flex', gap: 6, fontSize: 'var(--text-xs)', flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onDeleteRoutineDate(todo._routineId, todo._routineDate) }} style={{ color: 'var(--status-error)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>확인</button>
          <button onClick={e => { e.stopPropagation(); setConfirmDelete(false) }} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>취소</button>
        </div>
      )}

      {!todo._isRoutineInstance && hover && !confirmDelete && (
        <button
          onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
          style={{ lineHeight: 0, color: 'var(--text-muted)', padding: 3, borderRadius: 4, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <MoreHorizontal size={13} />
        </button>
      )}
      {!todo._isRoutineInstance && confirmDelete && (
        <div style={{ display: 'flex', gap: 6, fontSize: 'var(--text-xs)', flexShrink: 0 }}>
          <button onClick={e => { e.stopPropagation(); onDelete(todo.id) }} style={{ color: 'var(--status-error)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>삭제</button>
          <button onClick={e => { e.stopPropagation(); setConfirmDelete(false) }} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>취소</button>
        </div>
      )}
    </div>
  )
}

function FeedSection({ category, todos, routines = [], date, categories, onToggle, onDelete, onDeleteRoutineDate, onAdd, onOpenDetail }) {
  const [adding, setAdding] = useState(false)
  const color = category?.color ?? '#94A3B8'
  const name = category?.name ?? '미분류'
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 8px 5px 12px', marginBottom: 4,
        borderLeft: `3px solid ${color}`,
      }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)', flex: 1, letterSpacing: '0.02em' }}>{name}</span>
        <button
          onClick={() => setAdding(a => !a)}
          style={{
            lineHeight: 0, padding: 4, borderRadius: 'var(--radius-sm)',
            border: 'none', cursor: 'pointer',
            color: adding ? 'var(--accent)' : 'var(--text-muted)',
            background: adding ? 'var(--accent-subtle)' : 'transparent',
            transition: 'background var(--duration-fast), color var(--duration-fast)',
          }}
        >
          <Plus size={12} />
        </button>
      </div>

      {routines.filter(r => !todos.some(t => t.text === r.text)).map(r => (
        <button
          key={r.id}
          onClick={() => onAdd({ text: r.text, categoryId: r.categoryId ?? null, date, memo: r.memo ?? '' })}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '6px 10px', marginBottom: 2,
            borderRadius: 8, border: `1.5px dashed ${color}40`,
            background: 'transparent', cursor: 'pointer',
            fontSize: 'var(--text-sm)', color, opacity: 0.7,
            transition: 'opacity var(--duration-fast), background var(--duration-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = `${color}0a` }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.7; e.currentTarget.style.background = 'transparent' }}
        >
          <Plus size={11} />
          <span style={{ flex: 1, textAlign: 'left' }}>{r.text}</span>
          <span style={{ fontSize: 'var(--text-xs)', opacity: 0.55, fontWeight: 500 }}>루틴</span>
        </button>
      ))}

      {todos.map(t => (
        <FeedTodoItem key={t.id} todo={t} catColor={color}
          onToggle={onToggle} onDelete={onDelete}
          onDeleteRoutineDate={onDeleteRoutineDate}
          onOpenDetail={onOpenDetail}
        />
      ))}
      {adding && (
        <div style={{ margin: '6px 0 4px 14px', padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 10 }}>
          <AddEventForm
            date={date}
            categories={categories}
            fixedCategoryId={category?.id ?? null}
            onAdd={d => { onAdd(d); setAdding(false) }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}
    </div>
  )
}

export function Calendar() {
  const { todos, addTodo, updateTodo, toggleTodo, removeTodo, removeRoutineDate } = useTodos()
  const { categories, addCategory, updateCategory, removeCategory } = useCategories()
  const { profile, saveProfile } = useUserProfile()
  const user = useUser()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [weekStartsOn, setWeekStartsOn] = useState(() => getStored('weekStartsOn', 1))
  const [darkMode, setDarkMode] = useState(() => getStored('darkMode', false))
  const [accentColor, setAccentColor] = useState(() => getStored('accentColor', '#6366F1'))
  const [view, setView] = useState('month')
  const [openPanel, setOpenPanel] = useState(null)
  const [editingBio, setEditingBio] = useState(false)
  const [bioVal, setBioVal] = useState('')
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 700)
  const [mobileTab, setMobileTab] = useState('feed')

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 700)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  const accentInputRef = useRef()
  const catColorInputRef = useRef()
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#6366F1')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', accentColor)
    root.style.setProperty('--accent-hover', darken(accentColor))
    root.style.setProperty('--accent-subtle', accentColor + '1a')
    root.style.setProperty('--accent-subtle-strong', accentColor + '29')
    localStorage.setItem('accentColor', JSON.stringify(accentColor))
  }, [accentColor])

  // Sync bio state when profile loads
  useEffect(() => {
    if (profile?.bio !== undefined) setBioVal(profile.bio ?? '')
  }, [profile?.bio])


  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function handleWeekToggle(val) {
    setWeekStartsOn(val)
    localStorage.setItem('weekStartsOn', JSON.stringify(val))
  }

  const weekStart = useMemo(() => {
    try { return startOfWeek(parseISO(selectedDate), { weekStartsOn }) }
    catch { return startOfWeek(new Date(), { weekStartsOn }) }
  }, [selectedDate, weekStartsOn])

  // Always month-range so CalendarWidget always has full month data
  const visibleTodos = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const result = []

    for (const t of todos) {
      const r = t.routine
      if (!r?.enabled) {
        const d = t.date
        if (d && d >= format(monthStart, 'yyyy-MM-dd') && d <= format(monthEnd, 'yyyy-MM-dd')) result.push(t)
        continue
      }
      if (r.manualAdd) continue // template only — shown via manualRoutines quick-add

      let cursor
      try { cursor = parseISO(r.startDate) } catch { continue }
      const end = r.endDate ? parseISO(r.endDate) : monthEnd

      if (cursor > monthEnd || end < monthStart) continue

      const rangeStart = cursor < monthStart ? monthStart : cursor
      const rangeEnd = end < monthEnd ? end : monthEnd
      if (rangeStart > rangeEnd) continue

      const completedDates = t.completedDates ?? {}

      for (const day of eachDayOfInterval({ start: rangeStart, end: rangeEnd })) {
        const dateStr = format(day, 'yyyy-MM-dd')
        const diffDays = Math.round((day - cursor) / 86400000)
        let match = false
        const dow = day.getDay()
        if (r.repeatType === 'daily') match = true
        else if (r.repeatType === 'weekdays') match = dow >= 1 && dow <= 5
        else if (r.repeatType === 'weekly') match = diffDays % 7 === 0
        else if (r.repeatType === 'biweekly') match = diffDays % 14 === 0
        else if (r.repeatType === 'monthly') match = day.getDate() === cursor.getDate()
        else if (r.repeatType === 'yearly') match = day.getDate() === cursor.getDate() && day.getMonth() === cursor.getMonth()
        else if (r.repeatType === 'custom') match = (r.customDays ?? []).includes(dow)

        const deletedDates = t.deletedDates ?? {}
        if (match && !deletedDates[dateStr]) {
          result.push({
            ...t,
            id: t.id + '_' + dateStr,
            date: dateStr,
            done: completedDates[dateStr] ?? false,
            _isRoutineInstance: true,
            _routineId: t.id,
            _routineDate: dateStr,
            _completedDates: completedDates,
          })
        }
      }
    }
    return result
  }, [todos, currentMonth])

  // For week view: also expand todos for the current week
  const weekTodos = useMemo(() => {
    if (view !== 'week') return []
    const wStart = weekStart
    const wEnd = endOfWeek(weekStart, { weekStartsOn })
    const result = []

    for (const t of todos) {
      const r = t.routine
      if (!r?.enabled) {
        const d = t.date
        if (d && d >= format(wStart, 'yyyy-MM-dd') && d <= format(wEnd, 'yyyy-MM-dd')) result.push(t)
        continue
      }
      if (r.manualAdd) continue

      let cursor
      try { cursor = parseISO(r.startDate) } catch { continue }
      const end = r.endDate ? parseISO(r.endDate) : wEnd

      if (cursor > wEnd || end < wStart) continue

      const rangeStart = cursor < wStart ? wStart : cursor
      const rangeEnd = end < wEnd ? end : wEnd
      if (rangeStart > rangeEnd) continue

      const completedDates = t.completedDates ?? {}

      for (const day of eachDayOfInterval({ start: rangeStart, end: rangeEnd })) {
        const dateStr = format(day, 'yyyy-MM-dd')
        const diffDays = Math.round((day - cursor) / 86400000)
        let match = false
        const dow = day.getDay()
        if (r.repeatType === 'daily') match = true
        else if (r.repeatType === 'weekdays') match = dow >= 1 && dow <= 5
        else if (r.repeatType === 'weekly') match = diffDays % 7 === 0
        else if (r.repeatType === 'biweekly') match = diffDays % 14 === 0
        else if (r.repeatType === 'monthly') match = day.getDate() === cursor.getDate()
        else if (r.repeatType === 'yearly') match = day.getDate() === cursor.getDate() && day.getMonth() === cursor.getMonth()
        else if (r.repeatType === 'custom') match = (r.customDays ?? []).includes(dow)

        const deletedDates = t.deletedDates ?? {}
        if (match && !deletedDates[dateStr]) {
          result.push({
            ...t,
            id: t.id + '_' + dateStr,
            date: dateStr,
            done: completedDates[dateStr] ?? false,
            _isRoutineInstance: true,
            _routineId: t.id,
            _routineDate: dateStr,
            _completedDates: completedDates,
          })
        }
      }
    }
    return result
  }, [todos, weekStart, weekStartsOn, view])

  const manualRoutines = useMemo(() => {
    return todos.filter(t => {
      const r = t.routine
      if (!r?.enabled || !r.manualAdd || !r.startDate) return false
      if (selectedDate < r.startDate) return false
      if (r.endDate && selectedDate > r.endDate) return false
      return true
    })
  }, [todos, selectedDate])

  const panelTodos = visibleTodos.filter(t => t.date === selectedDate)

  // Group panel todos by category — always show all categories
  const feedSections = useMemo(() => {
    const groups = {}
    for (const t of panelTodos) {
      const key = t.categoryId ?? '__none__'
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    }
    const sections = categories.map(cat => ({ category: cat, todos: groups[cat.id] ?? [] }))
    if (groups['__none__']) sections.push({ category: null, todos: groups['__none__'] })
    return sections
  }, [panelTodos, categories])

  const displayName = profile?.displayName || user?.displayName || ''
  const avatarURL = profile?.photoURL || user?.photoURL

  const iconBtn = (active) => ({
    position: 'relative', padding: 7, lineHeight: 0, borderRadius: 'var(--radius-md)',
    border: 'none', cursor: 'pointer',
    background: active ? 'var(--accent-subtle)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    transition: 'background var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease)',
  })

  const selectedCat = selectedTodo ? categories.find(c => c.id === selectedTodo.categoryId) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top bar ── */}
      <header style={{
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-base)',
        padding: '0 20px',
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--accent)', letterSpacing: '-0.03em' }}>
          todolog
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Tag: category management */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenPanel(p => p === 'newcat' ? null : 'newcat')}
              style={iconBtn(openPanel === 'newcat')}
              title="카테고리"
            >
              <Tag size={16} />
            </button>
            {openPanel === 'newcat' && (
              <HeaderDropdown onClose={() => { setOpenPanel(null); setNewCatName('') }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-base)' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>카테고리</span>
                </div>
                <div style={{ padding: '8px 8px 4px', maxHeight: 200, overflowY: 'auto' }}>
                  {categories.length === 0 && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', padding: '4px 8px' }}>카테고리 없음</p>
                  )}
                  {categories.map(cat => (
                    <CategoryItem key={cat.id} category={cat} isFiltered={false} onFilter={() => {}} onUpdate={updateCategory} onDelete={removeCategory} />
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border-base)', padding: '10px 16px 12px' }}>
                  <form
                    onSubmit={e => { e.preventDefault(); if (!newCatName.trim()) return; addCategory(newCatName.trim(), newCatColor); setNewCatName('') }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  >
                    <input value={newCatName} onChange={e => setNewCatName(e.target.value)}
                      placeholder="새 카테고리..."
                      onKeyDown={e => e.key === 'Escape' && setOpenPanel(null)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', borderBottom: '1px solid var(--border-base)', fontSize: 'var(--text-sm)', padding: '2px 0 5px', color: 'var(--text-primary)', width: '100%' }}
                    />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
                      {CATEGORY_COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setNewCatColor(c)}
                          style={{ width: 15, height: 15, borderRadius: '50%', background: c, padding: 0, border: newCatColor === c ? '2.5px solid var(--text-primary)' : '2px solid transparent', flexShrink: 0, cursor: 'pointer' }}
                        />
                      ))}
                      <button type="button" onClick={() => catColorInputRef.current.click()}
                        style={{ width: 15, height: 15, borderRadius: '50%', padding: 0, flexShrink: 0, background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)', border: '2px solid var(--border-base)', cursor: 'pointer' }}
                      />
                      <input ref={catColorInputRef} type="color" value={newCatColor}
                        onChange={e => setNewCatColor(e.target.value)}
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                      />
                    </div>
                    <button type="submit"
                      style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: newCatName.trim() ? 'var(--accent)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: newCatName.trim() ? 'pointer' : 'default', padding: 0, textAlign: 'left' }}>
                      + 추가
                    </button>
                  </form>
                </div>
              </HeaderDropdown>
            )}
          </div>

          {/* Settings gear */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenPanel(p => p === 'settings' ? null : 'settings')}
              style={iconBtn(openPanel === 'settings')}
              title="설정"
            >
              <Settings size={16} />
            </button>
            {openPanel === 'settings' && (
              <HeaderDropdown onClose={() => setOpenPanel(null)}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-base)' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>설정</span>
                </div>
                <div style={{ padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
                    <span style={{ fontSize: 'var(--text-sm)' }}>다크 모드</span>
                    <button
                      onClick={() => setDarkMode(d => !d)}
                      style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: darkMode ? 'var(--accent)' : 'var(--border-base)', position: 'relative', transition: 'background 0.2s' }}
                    >
                      <span style={{ position: 'absolute', top: 3, left: darkMode ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
                    <span style={{ fontSize: 'var(--text-sm)' }}>달력 시작 요일</span>
                    <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: 2, gap: 2 }}>
                      {[{ label: '일', value: 0 }, { label: '월', value: 1 }].map(opt => (
                        <button key={opt.value} onClick={() => handleWeekToggle(opt.value)}
                          style={{ padding: '3px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 600, background: weekStartsOn === opt.value ? 'var(--bg-base)' : 'transparent', color: weekStartsOn === opt.value ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: weekStartsOn === opt.value ? 'var(--shadow-1)' : 'none' }}
                        >{opt.label}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-base)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>테마 색상</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
                      {ACCENT_PRESETS.map(c => (
                        <button key={c} onClick={() => setAccentColor(c)}
                          style={{ width: 20, height: 20, borderRadius: '50%', background: c, padding: 0, border: accentColor === c ? '2.5px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer', flexShrink: 0, boxShadow: accentColor === c ? `0 0 0 1px ${c}` : 'none', transition: 'transform var(--duration-fast)' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        />
                      ))}
                      <button
                        onClick={() => accentInputRef.current.click()}
                        style={{ width: 20, height: 20, borderRadius: '50%', padding: 0, flexShrink: 0, background: 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)', border: '2px solid var(--border-base)', cursor: 'pointer', transition: 'transform var(--duration-fast)' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      <input ref={accentInputRef} type="color" value={accentColor}
                        onChange={e => setAccentColor(e.target.value)}
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                      />
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-base)', marginTop: 4 }}>
                    <button onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--status-error)' }}>
                      <LogOut size={14} /> 로그아웃
                    </button>
                  </div>
                </div>
              </HeaderDropdown>
            )}
          </div>

          {/* Profile avatar */}
          <button
            onClick={() => { setOpenPanel(null); setShowProfile(true) }}
            style={{ display: 'flex', alignItems: 'center', marginLeft: 4, padding: 4, borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {avatarURL
              ? <img src={avatarURL} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  {(displayName || '?')[0].toUpperCase()}
                </div>
            }
          </button>
        </div>
      </header>

      {/* ── App body ── */}
      <div style={{ flex: 1, maxWidth: isMobile ? '100%' : 960, width: '100%', margin: '0 auto', display: 'flex', overflow: 'hidden', height: `calc(100vh - ${isMobile ? 96 : 48}px)` }}>

        {/* ── Left panel ── */}
        <aside style={{
          width: isMobile ? '100%' : 400,
          flexShrink: 0,
          borderRight: isMobile ? 'none' : '1px solid var(--border-base)',
          background: 'var(--bg-base)',
          display: !isMobile || mobileTab === 'calendar' ? 'flex' : 'none',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '20px 16px 24px',
          gap: 0,
        }}>

          {/* Profile section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <button
              onClick={() => { setOpenPanel(null); setShowProfile(true) }}
              style={{ flexShrink: 0, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '50%' }}
            >
              {avatarURL
                ? <img src={avatarURL} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>
                    {(displayName || '?')[0].toUpperCase()}
                  </div>
              }
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: 2 }}>{displayName}</div>
              {editingBio ? (
                <textarea
                  autoFocus
                  value={bioVal}
                  onChange={e => setBioVal(e.target.value)}
                  onBlur={() => { setEditingBio(false); saveProfile({ bio: bioVal }) }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setEditingBio(false); saveProfile({ bio: bioVal }) } if (e.key === 'Escape') { setEditingBio(false); setBioVal(profile?.bio ?? '') } }}
                  rows={2}
                  style={{ width: '100%', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-base)', outline: 'none', resize: 'none', fontFamily: 'inherit', lineHeight: 1.4 }}
                />
              ) : (
                <div
                  onClick={() => setEditingBio(true)}
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', cursor: 'text', lineHeight: 1.4, minHeight: 16 }}
                >
                  {profile?.bio || <span style={{ opacity: 0.4 }}>자기소개 입력…</span>}
                </div>
              )}
            </div>
          </div>

          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button
              onClick={() => setCurrentMonth(m => subMonths(m, 1))}
              style={{ padding: 4, lineHeight: 0, borderRadius: 4, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            ><ChevronLeft size={14} /></button>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              {format(currentMonth, 'yyyy년 M월')}
            </span>
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              style={{ padding: 4, lineHeight: 0, borderRadius: 4, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            ><ChevronRight size={14} /></button>
          </div>

          {/* CalendarWidget */}
          <CalendarWidget
            currentMonth={currentMonth}
            todos={visibleTodos}
            categories={categories}
            selectedDate={selectedDate}
            onDateSelect={d => { setSelectedDate(d); setSelectedTodo(null); if (isMobile) setMobileTab('feed') }}
            weekStartsOn={weekStartsOn}
          />

          {/* Day summary */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-base)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {format(parseISO(selectedDate), 'M월 d일 (E)', { locale: ko })}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {panelTodos.filter(t => t.done).length} / {panelTodos.length}
              </span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--border-base)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: panelTodos.length > 0 ? `${(panelTodos.filter(t => t.done).length / panelTodos.length) * 100}%` : '0%',
                background: 'var(--accent)',
                borderRadius: 2,
                transition: 'width var(--duration-base) var(--ease)',
              }} />
            </div>
          </div>

        </aside>

        {/* ── Right panel (Feed) ── */}
        <main style={{ flex: 1, display: !isMobile || mobileTab === 'feed' ? 'flex' : 'none', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-base)' }}>

          {/* Feed header */}
          <div style={{
            padding: '14px 20px 12px',
            borderBottom: '1px solid var(--border-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              {selectedTodo ? (
                <h1 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text-primary)', lineHeight: 1 }}>상세</h1>
              ) : (
                <>
                  <h1 style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--text-primary)', lineHeight: 1 }}>
                    {format(parseISO(selectedDate), 'M월 d일', { locale: ko })}
                  </h1>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {format(parseISO(selectedDate), '(E)', { locale: ko })}
                  </span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {selectedTodo && (
                <button
                  onClick={() => setSelectedTodo(null)}
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-base)', background: 'transparent', cursor: 'pointer' }}
                >← 목록</button>
              )}
              {!selectedTodo && (
                <>
                  <button
                    onClick={() => { const today = format(new Date(), 'yyyy-MM-dd'); setSelectedDate(today); setCurrentMonth(new Date()) }}
                    style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', padding: '3px 8px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-base)', background: 'transparent', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-base)' }}
                  >오늘</button>
                  {/* view toggle */}
                  <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '2px 3px', gap: 1 }}>
                    {[{ v: 'month', label: '월' }, { v: 'week', label: '주' }].map(({ v, label }) => (
                      <button key={v} onClick={() => setView(v)}
                        style={{
                          padding: '2px 9px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer',
                          fontSize: 'var(--text-xs)', fontWeight: 700,
                          background: view === v ? 'var(--bg-base)' : 'transparent',
                          color: view === v ? 'var(--text-primary)' : 'var(--text-muted)',
                          boxShadow: view === v ? 'var(--shadow-1)' : 'none',
                          transition: 'background var(--duration-fast)',
                        }}>{label}</button>
                    ))}
                  </div>
                  {view === 'week' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <button onClick={() => setSelectedDate(format(subWeeks(parseISO(selectedDate), 1), 'yyyy-MM-dd'))} style={{ padding: 4, lineHeight: 0, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 4 }}><ChevronLeft size={13} /></button>
                      <button onClick={() => setSelectedDate(format(addWeeks(parseISO(selectedDate), 1), 'yyyy-MM-dd'))} style={{ padding: 4, lineHeight: 0, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 4 }}><ChevronRight size={13} /></button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Feed content */}
          {view === 'week' && !selectedTodo ? (
            <WeekTimetable
              weekStart={weekStart}
              todos={weekTodos}
              categories={categories}
              selectedDate={selectedDate}
              weekStartsOn={weekStartsOn}
              onCellClick={(dateStr, timeStr) => {
                setSelectedDate(dateStr)
                setSelectedTodo(null)
              }}
            />
          ) : selectedTodo ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              <TodoDetail
                todo={selectedTodo}
                category={selectedCat}
                onUpdate={(id, updates) => { updateTodo(id, updates); setSelectedTodo(prev => ({ ...prev, ...updates })) }}
                onDelete={id => { removeTodo(id); setSelectedTodo(null) }}
                onDeleteRoutineDate={(parentId, date) => { removeRoutineDate(parentId, date); setSelectedTodo(null) }}
                onToggle={todo => { toggleTodo(todo); setSelectedTodo(prev => ({ ...prev, done: !prev.done })) }}
                onBack={() => setSelectedTodo(null)}
              />
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {feedSections.map(({ category, todos }) => (
                <FeedSection
                  key={category?.id ?? '__none__'}
                  category={category}
                  todos={todos}
                  routines={manualRoutines.filter(r => (r.categoryId ?? null) === (category?.id ?? null))}
                  date={selectedDate}
                  categories={categories}
                  onToggle={toggleTodo}
                  onDelete={removeTodo}
                  onDeleteRoutineDate={removeRoutineDate}
                  onAdd={addTodo}
                  onOpenDetail={todo => setSelectedTodo(todo)}
                />
              ))}
              {categories.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 6 }}>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>카테고리를 만들어 할 일을 정리해보세요</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', opacity: 0.6 }}>상단 Tag 아이콘 → 카테고리 추가</div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile bottom tab bar ── */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, height: 52,
          background: 'var(--bg-base)', borderTop: '1px solid var(--border-base)',
          display: 'flex', zIndex: 100,
        }}>
          {[
            { tab: 'calendar', label: '달력' },
            { tab: 'feed', label: '오늘' },
          ].map(({ tab, label }) => (
            <button key={tab} onClick={() => setMobileTab(tab)}
              style={{
                flex: 1, border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 'var(--text-xs)', fontWeight: 700,
                color: mobileTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                borderTop: mobileTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'color var(--duration-fast)',
              }}
            >{label}</button>
          ))}
        </div>
      )}

      {showProfile && profile && (
        <ProfileModal
          profile={profile}
          onSave={saveProfile}
          onClose={() => setShowProfile(false)}
          weekStartsOn={weekStartsOn}
          onWeekToggle={handleWeekToggle}
        />
      )}
    </div>
  )
}
