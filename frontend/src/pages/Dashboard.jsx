import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    api.get('/tasks')
      .then((res) => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const toggleComplete = async (task) => {
    try {
      const res = await api.put(`/tasks/${task.id}`, { completed: !task.completed });
      setTasks(tasks.map((t) => (t.id === task.id ? res.data : t)));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar');
    }
  };

  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  };

  const handlePrint = (task) => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>${escapeHtml(task.title)}</title><style>@page{margin:1.5cm}body{font-family:Arial,sans-serif;font-size:11pt}h1{font-size:18pt;border-bottom:2px solid #000;padding-bottom:.3rem}table{width:100%;border-collapse:collapse;margin-top:1rem}td{padding:.5rem 0;border-bottom:1px solid #ccc;vertical-align:top}td:first-child{width:30%;font-weight:bold;padding-right:1rem}</style></head><body><h1>${escapeHtml(task.title)}</h1><table><tr><td>Descripción</td><td>${escapeHtml(task.description)||'—'}</td></tr></table></body></html>`);
    win.document.close();
    win.print();
  };

  const done = tasks.filter(t => t.completed).length;
  const total = tasks.length;

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⋯</div>
        <p style={{ fontSize: '0.875rem' }}>Cargando tareas…</p>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.pageHeader}>
          <div>
            <h1 style={s.heading}>Mis tareas</h1>
            {total > 0 && (
              <p style={s.subheading}>{done} de {total} completadas</p>
            )}
          </div>
          {total > 0 && (
            <div style={s.progressWrap}>
              <div style={s.progressBar}>
                <div style={{ ...s.progressFill, width: `${total ? (done / total) * 100 : 0}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        {total > 0 && (
          <div style={s.tabs}>
            {[['all', 'Todas', total], ['pending', 'Pendientes', tasks.filter(t=>!t.completed).length], ['done', 'Completadas', done]].map(([key, label, count]) => (
              <button key={key} onClick={() => setFilter(key)} style={filter === key ? s.tabActive : s.tab}>
                {label}
                <span style={filter === key ? s.tabBadgeActive : s.tabBadge}>{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📋</div>
            <p style={s.emptyTitle}>{filter === 'all' ? 'No hay tareas aún' : filter === 'pending' ? 'Nada pendiente' : 'Sin completadas'}</p>
            <p style={s.emptyText}>{filter === 'all' ? 'Crea tu primera tarea para empezar.' : ''}</p>
            {filter === 'all' && <Link to="/create" style={s.emptyBtn}>+ Nueva tarea</Link>}
          </div>
        )}

        {/* Task list */}
        <div style={s.list}>
          {filtered.map((task) => (
            <div key={task.id} style={task.completed ? { ...s.card, ...s.cardDone } : s.card}>
              <div style={s.cardLeft}>
                <button
                  onClick={() => toggleComplete(task)}
                  style={task.completed ? s.checkDone : s.check}
                  aria-label={task.completed ? 'Marcar pendiente' : 'Marcar completada'}
                >
                  {task.completed && <span style={s.checkMark}>✓</span>}
                </button>
              </div>
              <div style={s.cardBody}>
                <div style={s.cardTop}>
                  <span style={task.completed ? { ...s.taskTitle, ...s.taskTitleDone } : s.taskTitle}>
                    {task.title}
                  </span>
                  <span style={task.completed ? s.badgeDone : s.badgePending}>
                    {task.completed ? 'Completada' : 'Pendiente'}
                  </span>
                </div>
                {task.description && <p style={s.taskDesc}>{task.description}</p>}
                <div style={s.cardMeta}>
                  <span style={s.author}>por {task.username}</span>
                  <div style={s.actions}>
                    <button onClick={() => handlePrint(task)} style={s.actionBtn} title="Imprimir">🖨</button>
                    {task.user_id === user?.id && (
                      <>
                        <Link to={`/edit/${task.id}`} style={s.actionBtnLink} title="Editar">✏️</Link>
                        <button onClick={() => handleDelete(task.id)} style={{ ...s.actionBtn, color: '#ef4444' }} title="Eliminar">✕</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: '#f4f5f7', minHeight: 'calc(100vh - 60px)', padding: '2rem 1rem' },
  container: { maxWidth: 680, margin: '0 auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' },
  subheading: { fontSize: '0.875rem', color: '#6b7280', marginTop: 3 },
  progressWrap: { flex: '0 0 120px' },
  progressBar: { height: 6, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #6c63ff, #10b981)', borderRadius: 99, transition: 'width 400ms ease' },
  tabs: { display: 'flex', gap: 4, marginBottom: '1.25rem', background: '#fff', padding: 4, borderRadius: 10, border: '1px solid #e5e7eb' },
  tab: { flex: 1, padding: '0.45rem 0.5rem', background: 'transparent', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontWeight: 500 },
  tabActive: { flex: 1, padding: '0.45rem 0.5rem', background: '#1a1a2e', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: '0.82rem', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontWeight: 600 },
  tabBadge: { background: '#f3f4f6', color: '#9ca3af', borderRadius: 99, padding: '1px 7px', fontSize: '0.75rem', fontWeight: 600 },
  tabBadgeActive: { background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: '0.75rem', fontWeight: 600 },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  card: { background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '1rem 1.25rem', display: 'flex', gap: '0.9rem', transition: 'box-shadow 150ms ease' },
  cardDone: { opacity: 0.65 },
  cardLeft: { paddingTop: 2, flexShrink: 0 },
  check: { width: 22, height: 22, borderRadius: '50%', border: '2px solid #d1d5db', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease' },
  checkDone: { width: 22, height: 22, borderRadius: '50%', border: '2px solid #10b981', background: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#fff', fontSize: '0.75rem', fontWeight: 700, lineHeight: 1 },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
  taskTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  taskTitleDone: { textDecoration: 'line-through', color: '#9ca3af' },
  badgePending: { flexShrink: 0, fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#eff6ff', color: '#2563eb' },
  badgeDone: { flexShrink: 0, fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#f0fdf4', color: '#16a34a' },
  taskDesc: { fontSize: '0.84rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5 },
  cardMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  author: { fontSize: '0.75rem', color: '#9ca3af' },
  actions: { display: 'flex', gap: 2 },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px', borderRadius: 6, fontSize: '0.85rem', color: '#6b7280', lineHeight: 1 },
  actionBtnLink: { padding: '3px 6px', borderRadius: 6, fontSize: '0.85rem', textDecoration: 'none', lineHeight: 1 },
  empty: { textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '0.75rem' },
  emptyTitle: { fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: 6 },
  emptyText: { fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.25rem' },
  emptyBtn: { display: 'inline-block', padding: '0.55rem 1.25rem', background: '#1a1a2e', color: '#fff', textDecoration: 'none', borderRadius: 9, fontSize: '0.875rem', fontWeight: 600 },
};
