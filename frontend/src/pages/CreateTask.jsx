import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { title, description });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear tarea');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Nueva Tarea</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          required
        />
        <textarea
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...styles.input, minHeight: 100, resize: 'vertical' }}
        />
        <button type="submit" style={styles.btn}>Crear Tarea</button>
      </form>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: 400 },
  input: { padding: '0.6rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem' },
  btn: { padding: '0.6rem', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 4, fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#e94560', margin: 0 },
};
