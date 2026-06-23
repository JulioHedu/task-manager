const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { initDb, query, get, run } = require('./db');
const { authenticate, generateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

app.post('/api/register', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const exists = await get('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
  if (exists) {
    return res.status(409).json({ error: 'El usuario o email ya existe' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const result = await run(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
    [username, email, hashed]
  );

  const user = { id: result.rows[0].id, username, email };
  const token = generateToken(user);

  res.status(201).json({ user, token });
}));

app.post('/api/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  const user = await get('SELECT * FROM users WHERE email = $1', [email]);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = generateToken(user);
  res.json({
    user: { id: user.id, username: user.username, email: user.email },
    token
  });
}));

app.get('/api/tasks', authenticate, asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  const { count } = await get('SELECT COUNT(*) as count FROM tasks');
  const tasks = await query(`
    SELECT t.*, u.username 
    FROM tasks t 
    JOIN users u ON t.user_id = u.id 
    ORDER BY t.created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  res.json({ tasks, total: parseInt(count), page, limit });
}));

app.get('/api/tasks/:id', authenticate, asyncHandler(async (req, res) => {
  const task = await get(`
    SELECT t.*, u.username 
    FROM tasks t 
    JOIN users u ON t.user_id = u.id 
    WHERE t.id = $1
  `, [req.params.id]);

  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(task);
}));

app.post('/api/tasks', authenticate, asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'El título es obligatorio' });
  }

  const result = await run(
    'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING id',
    [title.trim(), description || null, req.user.id]
  );

  const task = await get(
    'SELECT t.*, u.username FROM tasks t JOIN users u ON t.user_id = u.id WHERE t.id = $1',
    [result.rows[0].id]
  );

  await run(
    'INSERT INTO notifications (message, task_id, created_by, type) VALUES ($1, $2, $3, $4)',
    [`${req.user.username} creó la tarea "${task.title}"`, task.id, req.user.id, 'created']
  );

  res.status(201).json(task);
}));

app.put('/api/tasks/:id', authenticate, asyncHandler(async (req, res) => {
  const { title, description, completed } = req.body;
  const task = await get('SELECT * FROM tasks WHERE id = $1', [req.params.id]);

  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  if (task.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para editar esta tarea' });
  }

  await run(
    'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), completed = COALESCE($3, completed) WHERE id = $4',
    [
      title || null,
      description !== undefined ? description : null,
      completed !== undefined ? completed : null,
      req.params.id
    ]
  );

  if (completed && !task.completed) {
    await run(
      'INSERT INTO notifications (message, task_id, created_by, type) VALUES ($1, $2, $3, $4)',
      [`${req.user.username} completó la tarea "${task.title}"`, task.id, req.user.id, 'completed']
    );
  }

  const updated = await get(
    'SELECT t.*, u.username FROM tasks t JOIN users u ON t.user_id = u.id WHERE t.id = $1',
    [req.params.id]
  );
  res.json(updated);
}));

app.get('/api/notifications', authenticate, asyncHandler(async (req, res) => {
  const notifications = await query(`
    SELECT n.*, u.username 
    FROM notifications n 
    JOIN users u ON n.created_by = u.id 
    ORDER BY n.created_at DESC 
    LIMIT 20
  `);
  res.json(notifications);
}));

app.put('/api/notifications/read-all', authenticate, asyncHandler(async (req, res) => {
  await run('UPDATE notifications SET read = true WHERE created_by IN (SELECT id FROM users WHERE id = $1)', [req.user.id]);
  res.json({ message: 'Todas marcadas como leídas' });
}));

app.put('/api/notifications/:id/read', authenticate, asyncHandler(async (req, res) => {
  await run('UPDATE notifications SET read = true WHERE id = $1', [req.params.id]);
  res.json({ message: 'Notificación marcada como leída' });
}));

app.delete('/api/tasks/:id', authenticate, asyncHandler(async (req, res) => {
  const task = await get('SELECT * FROM tasks WHERE id = $1', [req.params.id]);

  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  if (task.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea' });
  }

  await run('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.json({ message: 'Tarea eliminada' });
}));

// ---- Bitácoras ----

app.get('/api/bitacoras', authenticate, asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const offset = (page - 1) * limit;

  const { count } = await get('SELECT COUNT(*) as count FROM bitacoras');
  const bitacoras = await query(`
    SELECT b.*, u.username
    FROM bitacoras b
    JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  res.json({ bitacoras, total: parseInt(count), page, limit });
}));

app.get('/api/bitacoras/:folio', authenticate, asyncHandler(async (req, res) => {
  const bitacora = await get(`
    SELECT b.*, u.username
    FROM bitacoras b
    JOIN users u ON b.user_id = u.id
    WHERE b.folio = $1
  `, [req.params.folio]);

  if (!bitacora) return res.status(404).json({ error: 'Bitácora no encontrada' });
  res.json(bitacora);
}));

app.post('/api/bitacoras', authenticate, asyncHandler(async (req, res) => {
  const {
    fecha, hora, categoria, severidad, descripcion,
    responsable_operativo, responsable_final, evidencia,
    acciones_ejecutadas, tiempo_resolucion, cierre, prevencion_futura
  } = req.body;

  if (!categoria || !severidad || !descripcion) {
    return res.status(400).json({ error: 'Categoría, severidad y descripción son obligatorios' });
  }

  const result = await run(`
    INSERT INTO bitacoras (fecha, hora, categoria, severidad, descripcion,
      responsable_operativo, responsable_final, evidencia,
      acciones_ejecutadas, tiempo_resolucion, cierre, prevencion_futura, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING folio
  `, [
    fecha || new Date().toISOString().split('T')[0],
    hora || new Date().toTimeString().split(' ')[0],
    categoria, severidad, descripcion,
    responsable_operativo || null, responsable_final || null, evidencia || null,
    acciones_ejecutadas || null, tiempo_resolucion || null, cierre || null, prevencion_futura || null,
    req.user.id
  ]);

  const bitacora = await get(
    'SELECT b.*, u.username FROM bitacoras b JOIN users u ON b.user_id = u.id WHERE b.folio = $1',
    [result.rows[0].folio]
  );

  res.status(201).json(bitacora);
}));

app.put('/api/bitacoras/:folio', authenticate, asyncHandler(async (req, res) => {
  const bitacora = await get('SELECT * FROM bitacoras WHERE folio = $1', [req.params.folio]);
  if (!bitacora) return res.status(404).json({ error: 'Bitácora no encontrada' });
  if (bitacora.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para editar esta bitácora' });
  }

  const {
    fecha, hora, categoria, severidad, descripcion,
    responsable_operativo, responsable_final, evidencia,
    acciones_ejecutadas, tiempo_resolucion, cierre, prevencion_futura
  } = req.body;

  await run(`
    UPDATE bitacoras SET
      fecha = COALESCE($1, fecha),
      hora = COALESCE($2, hora),
      categoria = COALESCE($3, categoria),
      severidad = COALESCE($4, severidad),
      descripcion = COALESCE($5, descripcion),
      responsable_operativo = COALESCE($6, responsable_operativo),
      responsable_final = COALESCE($7, responsable_final),
      evidencia = COALESCE($8, evidencia),
      acciones_ejecutadas = COALESCE($9, acciones_ejecutadas),
      tiempo_resolucion = COALESCE($10, tiempo_resolucion),
      cierre = COALESCE($11, cierre),
      prevencion_futura = COALESCE($12, prevencion_futura)
    WHERE folio = $13
  `, [
    fecha || null, hora || null, categoria || null, severidad || null, descripcion || null,
    responsable_operativo ?? null, responsable_final ?? null, evidencia ?? null,
    acciones_ejecutadas ?? null, tiempo_resolucion ?? null, cierre ?? null, prevencion_futura ?? null,
    req.params.folio
  ]);

  const updated = await get(
    'SELECT b.*, u.username FROM bitacoras b JOIN users u ON b.user_id = u.id WHERE b.folio = $1',
    [req.params.folio]
  );
  res.json(updated);
}));

app.delete('/api/bitacoras/:folio', authenticate, asyncHandler(async (req, res) => {
  const bitacora = await get('SELECT * FROM bitacoras WHERE folio = $1', [req.params.folio]);
  if (!bitacora) return res.status(404).json({ error: 'Bitácora no encontrada' });
  if (bitacora.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar esta bitácora' });
  }

  await run('DELETE FROM bitacoras WHERE folio = $1', [req.params.folio]);
  res.json({ message: 'Bitácora eliminada' });
}));

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
