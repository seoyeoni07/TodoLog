export function EventBlock({ todo, category, onClick }) {
  const color = category?.color ?? '#9CA3AF'
  const done = !!todo.done

  return (
    <div
      onClick={e => { e.stopPropagation(); onClick?.(todo) }}
      title={todo.text}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        padding: '2px 5px',
        borderRadius: 4,
        background: done
          ? 'var(--bg-subtle)'
          : `${color}18`,
        borderLeft: `2.5px solid ${done ? 'var(--border-base)' : color}`,
        color: done ? 'var(--text-muted)' : color,
        fontSize: '0.7rem',
        fontWeight: done ? 400 : 500,
        lineHeight: 1.4,
        cursor: 'pointer',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        marginBottom: 2,
        textDecoration: done ? 'line-through' : 'none',
        transition: 'background var(--duration-fast) var(--ease), color var(--duration-fast) var(--ease)',
      }}
    >
      {done && <span style={{ fontSize: '0.6rem', flexShrink: 0, opacity: 0.7 }}>✓</span>}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {todo.text}
      </span>
    </div>
  )
}
