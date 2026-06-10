import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formStyles as s } from './formStyles';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden');
    setLoading(true);
    setError('');
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.iconWrap}>
            <span style={s.icon}>+</span>
          </div>
          <h1 style={s.title}>Crear cuenta</h1>
          <p style={s.subtitle}>Únete para gestionar tus tareas</p>
        </div>
        {error && <div style={s.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Usuario</label>
            <input name="username" placeholder="tunombre" value={form.username} onChange={handleChange} style={s.input} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Correo electrónico</label>
            <input name="email" type="email" placeholder="tu@email.com" value={form.email} onChange={handleChange} style={s.input} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Contraseña</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} style={s.input} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Confirmar contraseña</label>
            <input name="confirm" type="password" placeholder="••••••••" value={form.confirm} onChange={handleChange} style={s.input} required />
          </div>
          <button type="submit" style={loading ? { ...s.btn, opacity: 0.7 } : s.btn} disabled={loading}>
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>
        <p style={s.switchText}>
          ¿Ya tienes cuenta? <Link to="/login" style={s.switchLink}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
