import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return setError('Las contraseñas no coinciden');
    }
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Registrarse</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input name="username" placeholder="Usuario" value={form.username} onChange={handleChange} style={styles.input} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} required />
        <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} style={styles.input} required />
        <input name="confirm" type="password" placeholder="Confirmar Contraseña" value={form.confirm} onChange={handleChange} style={styles.input} required />
        <button type="submit" style={styles.btn}>Crear Cuenta</button>
        <p style={styles.text}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh',
  },
  form: {
    display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem',
    background: '#fff', borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', width: 320,
  },
  input: { padding: '0.6rem', border: '1px solid #ddd', borderRadius: 4, fontSize: '1rem' },
  btn: { padding: '0.6rem', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 4, fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#e94560', margin: 0 },
  text: { textAlign: 'center', margin: 0 },
};
