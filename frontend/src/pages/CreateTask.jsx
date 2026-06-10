import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { formStyles as s } from './formStyles';

export default function CreateTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tasks', { title, description });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={{ ...s.card, maxWidth: 460 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
          <Link to="/" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>← Volver</Link>
          <span style={{ color: '#d1d5db' }}>|</span>
          <h1 style={{ ...s.title, margin: 0, fontSize: '1.1rem' }}>Nueva tarea</h1>
        </div>
        {error && <div style={s.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Título</label>
            <input
              placeholder="¿Qué hay que hacer?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={s.input}
              required
              autoFocus
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Descripción <span style={{ color: '#9ca3af', fontWeight: 400 }}>(opcional)</span></label>
            <textarea
              placeholder="Agrega más detalles…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={s.textarea}
            />
          </div>
          <button type="submit" style={loading ? { ...s.btn, opacity: 0.7 } : s.btn} disabled={loading}>
            {loading ? 'Creando…' : 'Crear tarea'}
          </button>
        </form>
      </div>
    </div>
  );
}
