import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function BitacoraDetail() {
  const { folio } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bitacora, setBitacora] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bitacoras/${folio}`)
      .then((res) => setBitacora(res.data))
      .catch(() => navigate('/bitacoras'))
      .finally(() => setLoading(false));
  }, [folio, navigate]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⋯</div>
        <p style={{ fontSize: '0.875rem' }}>Cargando…</p>
      </div>
    </div>
  );

  if (!bitacora) return null;

  const Row = ({ label, value }) => (
    <tr>
      <td style={s.labelCell}>{label}</td>
      <td style={s.valueCell}>{value || <span style={{ color: '#d1d5db' }}>—</span>}</td>
    </tr>
  );

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
          <Link to="/bitacoras" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>← Bitácoras</Link>
          <span style={{ color: '#d1d5db' }}>|</span>
          <h1 style={s.heading}>Bitácora #{bitacora.folio}</h1>
          {bitacora.user_id === user?.id && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <Link to={`/bitacoras/${folio}/edit`} style={s.editBtn}>✏️ Editar</Link>
            </div>
          )}
        </div>

        <div style={s.card}>
          <table style={s.table}>
            <tbody>
              <Row label="Folio" value={`#${bitacora.folio}`} />
              <Row label="Fecha" value={bitacora.fecha} />
              <Row label="Hora" value={bitacora.hora?.slice(0, 5)} />
              <Row label="Categoría" value={bitacora.categoria} />
              <Row label="Severidad" value={bitacora.severidad} />
              <Row label="Descripción" value={bitacora.descripcion} />
              <Row label="Responsable operativo" value={bitacora.responsable_operativo} />
              <Row label="Responsable final" value={bitacora.responsable_final} />
              <Row label="Evidencia" value={bitacora.evidencia} />
              <Row label="Acciones ejecutadas" value={bitacora.acciones_ejecutadas} />
              <Row label="Tiempo de resolución" value={bitacora.tiempo_resolucion} />
              <Row label="Cierre" value={bitacora.cierre} />
              <Row label="Prevención futura" value={bitacora.prevencion_futura} />
              <Row label="Creado por" value={bitacora.username} />
              <Row label="Registrado el" value={new Date(bitacora.created_at).toLocaleString()} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: '#f4f5f7', minHeight: 'calc(100vh - 60px)', padding: '2rem 1rem' },
  container: { maxWidth: 680, margin: '0 auto' },
  heading: { fontSize: '1.3rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: 0 },
  editBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.9rem',
    background: '#1a1a2e', color: '#fff', textDecoration: 'none', borderRadius: 8,
    fontSize: '0.85rem', fontWeight: 600,
  },
  card: { background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '1.5rem 2rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  labelCell: {
    padding: '0.6rem 1rem 0.6rem 0', fontWeight: 600, fontSize: '0.82rem',
    color: '#374151', whiteSpace: 'nowrap', verticalAlign: 'top', width: '35%',
    borderBottom: '1px solid #f3f4f6',
  },
  valueCell: {
    padding: '0.6rem 0', fontSize: '0.9rem', color: '#111827',
    borderBottom: '1px solid #f3f4f6', lineHeight: 1.5, whiteSpace: 'pre-wrap',
  },
};
