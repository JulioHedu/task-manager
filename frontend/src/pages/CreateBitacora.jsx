import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { formStyles as s } from './formStyles';

export default function CreateBitacora() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().split(' ')[0].slice(0, 5),
    categoria: '',
    severidad: '',
    descripcion: '',
    responsable_operativo: '',
    responsable_final: '',
    evidencia: '',
    acciones_ejecutadas: '',
    tiempo_resolucion: '',
    cierre: '',
    prevencion_futura: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/bitacoras', {
        ...form,
        hora: form.hora ? `${form.hora}:00` : undefined,
      });
      navigate('/bitacoras');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear bitácora');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type = 'text', opts = {}) => (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      {type === 'textarea' ? (
        <textarea name={name} value={form[name]} onChange={handleChange} style={s.textarea} {...opts} />
      ) : type === 'select' ? (
        <select name={name} value={form[name]} onChange={handleChange} style={s.input} {...opts}>
          {opts.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} name={name} value={form[name]} onChange={handleChange} style={s.input} {...opts} />
      )}
    </div>
  );

  return (
    <div style={s.page}>
      <div style={{ ...s.card, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
          <Link to="/bitacoras" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>← Volver</Link>
          <span style={{ color: '#d1d5db' }}>|</span>
          <h1 style={{ ...s.title, margin: 0, fontSize: '1.1rem' }}>Nueva bitácora</h1>
        </div>
        {error && <div style={s.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} style={s.form}>
          {field('Fecha', 'fecha', 'date')}
          {field('Hora', 'hora', 'time')}
          {field('Categoría', 'categoria', 'text', { required: true, autoFocus: true })}
          {field('Severidad', 'severidad', 'select', { required: true, options: ['Baja', 'Media', 'Alta', 'Crítica'] })}
          {field('Descripción', 'descripcion', 'textarea', { required: true })}
          {field('Responsable operativo', 'responsable_operativo')}
          {field('Responsable final', 'responsable_final')}
          {field('Evidencia', 'evidencia')}
          {field('Acciones ejecutadas', 'acciones_ejecutadas', 'textarea')}
          {field('Tiempo de resolución', 'tiempo_resolucion')}
          {field('Cierre', 'cierre', 'textarea')}
          {field('Prevención futura', 'prevencion_futura', 'textarea')}
          <button type="submit" style={loading ? { ...s.btn, opacity: 0.7 } : s.btn} disabled={loading}>
            {loading ? 'Creando…' : 'Crear bitácora'}
          </button>
        </form>
      </div>
    </div>
  );
}
