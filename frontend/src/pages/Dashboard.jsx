import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <p style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</p>;

  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  };

  const handlePrint = (task) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
      <head>
        <title>${escapeHtml(task.title)}</title>
        <style>
          @page { margin: 1.5cm; }
          body { font-family: Arial, sans-serif; font-size: 11pt; color: #000; }
          h1 { font-size: 18pt; border-bottom: 2px solid #000; padding-bottom: 0.3rem; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          td { padding: 0.5rem 0; border-bottom: 1px solid #ccc; vertical-align: top; }
          td:first-child { width: 30%; font-weight: bold; padding-right: 1rem; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(task.title)}</h1>
        <table>
          <tr><td>Descripción</td><td>${escapeHtml(task.description) || '—'}</td></tr>
        </table>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div style={styles.container}>
      <h2 style={{ marginBottom: '1rem' }}>Tareas</h2>
      {tasks.length === 0 ? (
        <p>No hay tareas aún. <Link to="/create">Crea una</Link></p>
      ) : (
        <div style={styles.grid}>
          {tasks.map((task) => (
            <div key={task.id} style={{ ...styles.card, opacity: task.completed ? 0.7 : 1 }}>
              <div style={styles.header}>
                <h3 style={{ ...styles.title, textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.title}
                </h3>
                <span style={styles.author}>por {task.username}</span>
              </div>
              {task.description && <p style={styles.desc}>{task.description}</p>}
              <div style={styles.actions}>
                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={!!task.completed}
                    onChange={() => toggleComplete(task)}
                  />
                  Completada
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handlePrint(task)} style={styles.printBtn}>Imprimir</button>
                  {task.user_id === user?.id && (
                    <>
                      <Link to={`/edit/${task.id}`} style={styles.editBtn}>Editar</Link>
                      <button onClick={() => handleDelete(task.id)} style={styles.deleteBtn}>Eliminar</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 800, margin: '0 auto', padding: '2rem' },
  printBtn: { padding: '0.3rem 0.8rem', background: '#16213e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem' },
  grid: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  title: { margin: 0, fontSize: '1.2rem' },
  author: { fontSize: '0.8rem', color: '#666' },
  desc: { color: '#444', marginBottom: '1rem' },
  actions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' },
  editBtn: { padding: '0.3rem 0.8rem', background: '#0f3460', color: '#fff', textDecoration: 'none', borderRadius: 4, fontSize: '0.9rem' },
  deleteBtn: { padding: '0.3rem 0.8rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '0.9rem' },
};
