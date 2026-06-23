export const BITACORA_TYPES = [
  {
    id: 'incidencias',
    label: 'Bitácora Maestra de Incidencias',
    icon: '⚠️',
    fields: [
      { name: 'fecha', label: 'Fecha', type: 'date' },
      { name: 'hora', label: 'Hora', type: 'time' },
      { name: 'categoria', label: 'Categoría', type: 'text', required: true },
      { name: 'severidad', label: 'Severidad', type: 'select', options: ['Baja', 'Media', 'Alta', 'Crítica'], required: true },
      { name: 'descripcion', label: 'Descripción', type: 'textarea', required: true },
      { name: 'responsable_operativo', label: 'Responsable operativo', type: 'text' },
      { name: 'responsable_final', label: 'Responsable final', type: 'text' },
      { name: 'evidencia', label: 'Evidencia', type: 'text' },
      { name: 'acciones_ejecutadas', label: 'Acciones ejecutadas', type: 'textarea' },
      { name: 'tiempo_resolucion', label: 'Tiempo de resolución', type: 'text' },
      { name: 'cierre', label: 'Cierre', type: 'textarea' },
      { name: 'prevencion_futura', label: 'Prevención futura', type: 'textarea' },
    ],
    preview: (data) => [
      { label: 'Categoría', value: data.categoria },
      { label: 'Severidad', value: data.severidad },
      { label: 'Descripción', value: data.descripcion?.slice(0, 80) },
    ],
    badge: (data) => data.severidad,
    badgeColor: (data) => {
      const map = { baja: '#16a34a', media: '#ca8a04', alta: '#dc2626', crítica: '#7c3aed' };
      return map[data.severidad?.toLowerCase()] || '#6b7280';
    },
  },
  {
    id: 'afiliados',
    label: 'Bitácora de Afiliados',
    icon: '🤝',
    fields: [
      { name: 'fecha_alta', label: 'Fecha de alta', type: 'date', required: true },
      { name: 'negocio_afiliado', label: 'Negocio afiliado', type: 'text', required: true },
      { name: 'responsable', label: 'Responsable', type: 'text' },
      { name: 'categoria_comercial', label: 'Categoría comercial', type: 'text' },
      { name: 'tipo_membresia', label: 'Tipo membresía', type: 'select', options: ['Básica', 'Premium', 'VIP', 'Corporativa'] },
      { name: 'estatus', label: 'Estatus', type: 'select', options: ['Activo', 'Inactivo', 'Pendiente', 'Cancelado'] },
      { name: 'fecha_activacion', label: 'Fecha de activación', type: 'date' },
      { name: 'fecha_renovacion', label: 'Fecha de renovación', type: 'date' },
      { name: 'incidencias_relevantes', label: 'Incidencias relevantes', type: 'textarea' },
    ],
    preview: (data) => [
      { label: 'Negocio', value: data.negocio_afiliado },
      { label: 'Estatus', value: data.estatus },
      { label: 'Membresía', value: data.tipo_membresia },
    ],
    badge: (data) => data.estatus,
    badgeColor: (data) => {
      const map = { activo: '#16a34a', inactivo: '#6b7280', pendiente: '#ca8a04', cancelado: '#dc2626' };
      return map[data.estatus?.toLowerCase()] || '#6b7280';
    },
  },
];

export function getTypeConfig(tipoId) {
  return BITACORA_TYPES.find((t) => t.id === tipoId);
}
