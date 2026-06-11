export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', danger = false }) {
  if (!open) return null;
  return (
    <div style={overlay} onClick={onCancel}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={modalTitle}>{title}</h3>
        <p style={modalMsg}>{message}</p>
        <div style={modalActions}>
          <button onClick={onCancel} style={btnCancel}>{cancelLabel}</button>
          <button onClick={onConfirm} style={danger ? btnDanger : btnConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, animation: 'fadeIn 150ms ease',
};
const modal = {
  background: '#fff', borderRadius: 14, padding: '1.5rem',
  minWidth: 300, maxWidth: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
};
const modalTitle = { margin: '0 0 0.5rem', fontSize: '1.05rem', color: '#111827' };
const modalMsg = { margin: 0, fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.5 };
const modalActions = { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1.25rem' };
const btnBase = { padding: '0.45rem 1rem', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer' };
const btnCancel = { ...btnBase, background: '#f3f4f6', color: '#374151' };
const btnConfirm = { ...btnBase, background: '#6c63ff', color: '#fff' };
const btnDanger = { ...btnBase, background: '#ef4444', color: '#fff' };
