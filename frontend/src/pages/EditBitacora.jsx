import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { formStyles as s } from './formStyles';
import { getTypeConfig } from './bitacoraConfig';

export default function EditBitacora() {
  const { folio } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/bitacoras/${folio}`)
      .then((res) => {
        const b = res.data;
        const config = getTypeConfig(b.tipo);
        if (!config) return navigate('/bitacoras');
        setCfg(config);
        const defaults = {};
        config.fields.forEach((f) => {
          defaults[f.name] = b.data?.[f.name] ?? '';
        });
        setData(defaults);
      })
      .catch(() => navigate('/bitacoras'));
  }, [folio, navigate]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...data };
      if (payload.hora) payload.hora = `${payload.hora}:00`;
      await api.put(`/bitacoras/${folio}`, { data: payload });
      navigate(`/bitacoras/${folio}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al editar bitácora');
    } finally {
      setLoading(false);
    }
  };

  if (!data || !cfg) return null;

  const renderField = (field) => {
    const val = data[field.name] ?? '';
    const common = { name: field.name, value: val, onChange: handleChange, required: field.required };
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
          <input type={field.type} {...common} style={s.input} />
        )}
      </div>
    );
  };

  return (
    <div style={s.page}>
      <div style={{ ...s.card, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.75rem' }}>
          <Link to={`/bitacoras/${folio}`} style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>← Volver</Link>
          <span style={{ color: '#d1d5db' }}>|</span>
          <h1 style={{ ...s.title, margin: 0, fontSize: '1.1rem' }}>{cfg.icon} {cfg.label} #{folio}</h1>
        </div>
        {error && <div style={s.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} style={s.form}>
          {cfg.fields.map(renderField)}
          <button type="submit" style={loading ? { ...s.btn, opacity: 0.7 } : s.btn} disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}
