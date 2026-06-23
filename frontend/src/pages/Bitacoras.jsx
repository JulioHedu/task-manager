import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ConfirmModal from '../components/ConfirmModal';

export default function Bitacoras() {
  const [bitacoras, setBitacoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/bitacoras?page=${page}&limit=${limit}`)
      .then((res) => {
        setBitacoras(res.data.bitacoras);
        setTotal(res.data.total);
      })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar bitácoras'))
      .finally(() => setLoading(false));
  }, [page]);

  const handleDelete = async (folio) => {
    try {
      await api.delete(`/bitacoras/${folio}`);
      setBitacoras(bitacoras.filter((b) => b.folio !== folio));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar');
      setDeleteTarget(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const severidadColor = (sev) => {
    const map = {
      baja: '#16a34a', media: '#ca8a04', alta: '#dc2626', crítica: '#7c3aed',
    };
    return map[sev?.toLowerCase()] || '#6b7280';
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 60px)' }}>
      <div style={{ textAlign: 'center', color: '#6b7280' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>⋯</div>
        <p style={{ fontSize: '0.875rem' }}>Cargando bitácoras…</p>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.container}>
        {error && (
          <div style={s.errorToast}>
            <span>{error}</span>
            <button onClick={() => setError('')} style={s.errorClose}>✕</button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={s.heading}>Bitácoras</h1>
          <Link to="/bitacoras/create" style={s.newBtn}>+ Nueva bitácora</Link>
        </div>

        {bitacoras.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📋</div>
            <p style={s.emptyTitle}>No hay bitácoras aún</p>
            <p style={s.emptyText}>Crea la primera para empezar.</p>
            <Link to="/bitacoras/create" style={s.emptyBtn}>+ Nueva bitácora</Link>
          </div>
        )}

        <div style={s.list}>
          {bitacoras.map((b) => (
            <div key={b.folio} style={s.card}>
              <div style={s.cardLeft}>
                <span style={s.folioBadge}>#{b.folio}</span>
              </div>
              <div style={s.cardBody}>
                <div style={s.cardTop}>
                  <Link to={`/bitacoras/${b.folio}`} style={s.cardTitle}>{b.categoria}</Link>
                  <span style={{ ...s.severidadBadge, background: severidadColor(b.severidad), color: '#fff' }}>
                    {b.severidad}
                  </span>
                </div>
                <p style={s.cardDesc}>{b.descripcion}</p>
                <div style={s.cardMeta}>
                  <span style={s.metaItem}>📅 {b.fecha}</span>
                  <span style={s.metaItem}>🕐 {b.hora?.slice(0, 5)}</span>
                  <span style={s.metaItem}>por {b.username}</span>
                  {b.cierre && <span style={{ ...s.metaItem, color: '#16a34a' }}>✓ Cerrada</span>}
                  <div style={s.actions}>
                    <Link to={`/bitacoras/${b.folio}`} style={s.actionLink} title="Ver">👁</Link>
                    <Link to={`/bitacoras/${b.folio}/edit`} style={s.actionLink} title="Editar">✏️</Link>
                    <button onClick={() => setDeleteTarget(b)} style={{ ...s.actionBtn, color: '#ef4444' }} title="Eliminar">✕</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={s.pagination}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ ...s.pageBtn, opacity: page === 1 ? 0.4 : 1 }}>← Anterior</button>
            <span style={s.pageInfo}>Página {page} de {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ ...s.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}>Siguiente →</button>
          </div>
        )}

        <ConfirmModal
          open={!!deleteTarget}
          title="Eliminar bitácora"
          message={`¿Eliminar la bitácora #${deleteTarget?.folio}? Esta acción no se puede deshacer.`}
          onConfirm={() => handleDelete(deleteTarget.folio)}
          onCancel={() => setDeleteTarget(null)}
          danger
        />
      </div>
    </div>
  );
}

const s = {
  page: { background: '#f4f5f7', minHeight: 'calc(100vh - 60px)', padding: '2rem 1rem' },
  container: { maxWidth: 720, margin: '0 auto' },
  heading: { fontSize: '1.5rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em', margin: 0 },
  errorToast: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
    padding: '0.6rem 1rem', background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: 10, marginBottom: '1rem', fontSize: '0.875rem', color: '#b91c1c',
  },
  errorClose: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#b91c1c', padding: '2px 4px', lineHeight: 1, flexShrink: 0 },
  newBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '0.45rem 1rem',
    background: '#1a1a2e', color: '#fff', textDecoration: 'none', borderRadius: 8,
    fontSize: '0.875rem', fontWeight: 600,
  },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  card: { background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '1rem 1.25rem', display: 'flex', gap: '0.9rem' },
  cardLeft: { flexShrink: 0, paddingTop: 2 },
  folioBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: 6, background: '#f3f4f6', color: '#6b7280', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#111827', textDecoration: 'none' },
  severidadBadge: { flexShrink: 0, fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 99 },
  cardDesc: { fontSize: '0.84rem', color: '#6b7280', marginBottom: 8, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 2 },
  metaItem: { fontSize: '0.75rem', color: '#9ca3af' },
  actions: { display: 'flex', gap: 2, marginLeft: 'auto' },
  actionLink: { padding: '3px 6px', borderRadius: 6, fontSize: '0.85rem', textDecoration: 'none', lineHeight: 1 },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px', borderRadius: 6, fontSize: '0.85rem', lineHeight: 1 },
  empty: { textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '0.75rem' },
  emptyTitle: { fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: 6 },
  emptyText: { fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.25rem' },
  emptyBtn: { display: 'inline-block', padding: '0.55rem 1.25rem', background: '#1a1a2e', color: '#fff', textDecoration: 'none', borderRadius: 9, fontSize: '0.875rem', fontWeight: 600 },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' },
  pageBtn: { padding: '0.4rem 1rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.85rem', cursor: 'pointer', color: '#374151' },
  pageInfo: { fontSize: '0.85rem', color: '#6b7280' },
};
