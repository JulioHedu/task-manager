export const BITACORA_TYPES = [
  {
    id: 'tecnologica',
    label: 'Bitácora Tecnológica',
    icon: '💻',
    fields: [
      { name: 'fecha', label: 'Fecha', type: 'date', required: true },
      { name: 'cambio_realizado', label: 'Cambio realizado', type: 'text', required: true },
      { name: 'sistema_afectado', label: 'Sistema afectado', type: 'text', required: true },
      { name: 'responsable', label: 'Responsable', type: 'text' },
      { name: 'pruebas_ejecutadas', label: 'Pruebas ejecutadas', type: 'textarea' },
      { name: 'resultado', label: 'Resultado', type: 'select', options: ['Exitoso', 'Fallido', 'Pendiente', 'Parcial'] },
      { name: 'aprobacion', label: 'Aprobación', type: 'text' },
      { name: 'incidencias_asociadas', label: 'Incidencias asociadas', type: 'textarea' },
    ],
    preview: (data) => [
      { label: 'Cambio', value: data.cambio_realizado },
      { label: 'Sistema', value: data.sistema_afectado },
      { label: 'Resultado', value: data.resultado },
    ],
    badge: (data) => data.resultado,
    badgeColor: (data) => {
      const map = { exitoso: '#16a34a', fallido: '#dc2626', pendiente: '#ca8a04', parcial: '#f97316' };
      return map[data.resultado?.toLowerCase()] || '#6b7280';
    },
  },
  {
    id: 'trabajo_socios',
    label: 'Bitácora de Trabajo de Socios',
    icon: '🤝',
    fields: [
      { name: 'fecha', label: 'Fecha', type: 'date', required: true },
      { name: 'actividad', label: 'Actividad', type: 'text', required: true },
      { name: 'responsable', label: 'Responsable', type: 'text', required: true },
      { name: 'horas_invertidas', label: 'Horas invertidas', type: 'text' },
      { name: 'entregable', label: 'Entregable', type: 'text' },
      { name: 'evidencia', label: 'Evidencia', type: 'text' },
      { name: 'resultado', label: 'Resultado', type: 'textarea' },
      { name: 'impacto', label: 'Impacto', type: 'select', options: ['Bajo', 'Medio', 'Alto', 'Crítico'] },
    ],
    preview: (data) => [
      { label: 'Actividad', value: data.actividad },
      { label: 'Responsable', value: data.responsable },
      { label: 'Impacto', value: data.impacto },
    ],
    badge: (data) => data.impacto,
    badgeColor: (data) => {
      const map = { bajo: '#16a34a', medio: '#ca8a04', alto: '#f97316', crítico: '#dc2626' };
      return map[data.impacto?.toLowerCase()] || '#6b7280';
    },
  },
  {
    id: 'membresias',
    label: 'Bitácora de Membresías',
    icon: '💳',
    fields: [
      { name: 'afiliado', label: 'Afiliado', type: 'text', required: true },
      { name: 'tipo_membresia', label: 'Tipo de membresía', type: 'select', options: ['Básica', 'Premium', 'VIP', 'Corporativa'], required: true },
      { name: 'monto', label: 'Monto', type: 'text' },
      { name: 'fecha_pago', label: 'Fecha de pago', type: 'date' },
      { name: 'vigencia', label: 'Vigencia', type: 'date' },
      { name: 'renovacion', label: 'Renovación', type: 'text' },
      { name: 'estatus', label: 'Estatus', type: 'select', options: ['Activa', 'Vencida', 'Cancelada', 'Pendiente'] },
    ],
    preview: (data) => [
      { label: 'Afiliado', value: data.afiliado },
      { label: 'Membresía', value: data.tipo_membresia },
      { label: 'Estatus', value: data.estatus },
    ],
    badge: (data) => data.estatus,
    badgeColor: (data) => {
      const map = { activa: '#16a34a', vencida: '#dc2626', cancelada: '#6b7280', pendiente: '#ca8a04' };
      return map[data.estatus?.toLowerCase()] || '#6b7280';
    },
  },
  {
    id: 'crm',
    label: 'Bitácora Comercial (CRM)',
    icon: '📞',
    fields: [
      { name: 'prospecto', label: 'Prospecto', type: 'text', required: true },
      { name: 'fecha_contacto', label: 'Fecha de contacto', type: 'date', required: true },
      { name: 'canal_origen', label: 'Canal de origen', type: 'text' },
      { name: 'subcanal', label: 'Subcanal', type: 'text' },
      { name: 'scout_responsable', label: 'Scout responsable', type: 'text' },
      { name: 'estatus', label: 'Estatus', type: 'select', options: ['Nuevo', 'En seguimiento', 'Negociación', 'Cerrado ganado', 'Cerrado perdido'] },
      { name: 'objeciones', label: 'Objeciones', type: 'textarea' },
      { name: 'proxima_accion', label: 'Próxima acción', type: 'text' },
      { name: 'resultado', label: 'Resultado', type: 'textarea' },
    ],
    preview: (data) => [
      { label: 'Prospecto', value: data.prospecto },
      { label: 'Estatus', value: data.estatus },
      { label: 'Canal', value: data.canal_origen },
    ],
    badge: (data) => data.estatus,
    badgeColor: (data) => {
      const map = { nuevo: '#6c63ff', 'en seguimiento': '#ca8a04', negociación: '#f97316', 'cerrado ganado': '#16a34a', 'cerrado perdido': '#dc2626' };
      return map[data.estatus?.toLowerCase()] || '#6b7280';
    },
  },
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
