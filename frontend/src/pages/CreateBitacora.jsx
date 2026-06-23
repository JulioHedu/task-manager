import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { formStyles as s } from './formStyles';
import { BITACORA_TYPES, getTypeConfig } from './bitacoraConfig';

export default function CreateBitacora() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState('');
  const [data, setData] = useState({});
  const [step, setStep] = useState('select');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cfg = getTypeConfig(tipo);

  const handleSelectType = (tipoId) => {
    setTipo(tipoId);
    const config = getTypeConfig(tipoId);
    const defaults = {};
    if (config) {
      config.fields.forEach((f) => {
        if (f.type === 'date') defaults[f.name] = new Date().toISOString().split('T')[0];
        else if (f.type === 'time') defaults[f.name] = new Date().toTimeString().split(' ')[0].slice(0, 5);
        else defaults[f.name] = '';
      });
    }
    setData(defaults);
    setStep('form');
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...data };
      if (payload.hora) payload.hora = `${payload.hora}:00`;
      await api.post('/bitacoras', { tipo, data: payload });
      navigate('/bitacoras');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear bitácora');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'select') {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, maxWidth: 500 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
            <Link to="/bitacoras" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>← Volver</Link>
            <span style={{ color: '#d1d5db' }}>|</span>
            <h1 style={{ ...s.title, margin: 0, fontSize: '1.1rem' }}>Nueva bitácora</h1>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1.25rem' }}>Selecciona el tipo de bitácora que deseas crear:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BITACORA_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectType(t.id)}
                style={s.typeCard}
              >
                <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#111827', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{t.fields.length} campos</div>
                </div>
                <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '1.2rem' }}>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderField = (field) => {
    const val = data[field.name] ?? '';
    const common = { name: field.name, value: val, onChange: handleChange, required: field.required, placeholder: field.placeholder };
    return (
      <div style={s.field} key={field.name}>
        <label style={s.label}>{field.label}</label>
        {field.type === 'textarea' ? (
          <textarea {...common} style={s.textarea} />
        ) : field.type === 'select' ? (
          <select {...common} style={s.input}>
            <option value="">Seleccionar…</option>
            {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : (
          <input type={field.type} {...common} style={s.input} autoFocus={field.required} />
        )}
      </div>
    );
  };

  return (
    <div style={s.page}>
      <div style={{ ...s.card, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
          <button onClick={() => setStep('select')} style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>← Tipos</button>
          <span style={{ color: '#d1d5db' }}>|</span>
          <h1 style={{ ...s.title, margin: 0, fontSize: '1.1rem' }}>{cfg?.icon} {cfg?.label}</h1>
        </div>
        {error && <div style={s.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} style={s.form}>
          {cfg?.fields.map(renderField)}
          <button type="submit" style={loading ? { ...s.btn, opacity: 0.7 } : s.btn} disabled={loading}>
            {loading ? 'Creando…' : 'Crear bitácora'}
          </button>
        </form>
      </div>
    </div>
  );
}
