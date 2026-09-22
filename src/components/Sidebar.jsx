import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useUser } from '../context/AuthContext'
import { CategoryItem } from './CategoryItem'
import { CATEGORY_COLORS } from '../hooks/useCategories'

export function Sidebar({ categories, filterCategoryId, onFilter, onAddCategory, onUpdateCategory, onDeleteCategory }) {
  const { logout } = useAuth()
  const user = useUser()
  const navigate = useNavigate()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(CATEGORY_COLORS[0])

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return
    onAddCategory(newName, newColor)
    setNewName('')
    setShowAddForm(false)
  }

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      background: 'var(--bg-base)',
      borderRight: '1px solid var(--border-base)',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--space-4)',
      flexShrink: 0,
      height: '100%',
      overflow: 'hidden',
    }}>
      <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--accent)', marginBottom: 'var(--space-6)', paddingLeft: 4 }}>
        todolog
      </div>

      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', paddingLeft: 4 }}>
        카테고리
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {categories.map(cat => (
          <CategoryItem
            key={cat.id}
            category={cat}
            isFiltered={filterCategoryId === cat.id}
            onFilter={id => onFilter(filterCategoryId === id ? null : id)}
            onUpdate={onUpdateCategory}
            onDelete={onDeleteCategory}
          />
        ))}

        {showAddForm ? (
          <form onSubmit={handleAdd} style={{ marginTop: 4, padding: '6px 8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="카테고리 이름..."
              autoFocus
              onKeyDown={e => e.key === 'Escape' && setShowAddForm(false)}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 'var(--text-sm)', marginBottom: 6 }}
            />
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 8 }}>
              {CATEGORY_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setNewColor(c)} style={{
                  width: 16, height: 16, borderRadius: '50%', background: c,
                  border: newColor === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                  padding: 0,
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="submit" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent)' }}>추가</button>
              <button type="button" onClick={() => setShowAddForm(false)} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>취소</button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 8px', marginTop: 2,
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
              border: 'none', background: 'transparent', cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              width: '100%',
            }}
          >
            <Plus size={13} /> 카테고리 추가
          </button>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border-base)', paddingTop: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {user?.photoURL && <img src={user.photoURL} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />}
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.displayName}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--text-muted)', padding: '4px 4px' }}
        >
          <LogOut size={13} /> 로그아웃
        </button>
      </div>
    </aside>
  )
}
