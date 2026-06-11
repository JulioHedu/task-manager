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

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const exists = await get('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
  if (exists) {
    return res.status(409).json({ error: 'El usuario o email ya existe' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const result = await run(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
    [username, email, hashed]
  );

  const user = { id: result.rows[0].id, username, email };
  const token = generateToken(user);

  res.status(201).json({ user, token });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  const user = await get('SELECT * FROM users WHERE email = $1', [email]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = generateToken(user);
  res.json({
    user: { id: user.id, username: user.username, email: user.email },
    token
  });
});

app.get('/api/tasks', authenticate, async (req, res) => {
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
});

app.get('/api/tasks/:id', authenticate, async (req, res) => {
  const task = await get(`
    SELECT t.*, u.username 
    FROM tasks t 
    JOIN users u ON t.user_id = u.id 
    WHERE t.id = $1
  `, [req.params.id]);

  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  res.json(task);
});

app.post('/api/tasks', authenticate, async (req, res) => {
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
});

app.put('/api/tasks/:id', authenticate, async (req, res) => {
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
});

app.get('/api/notifications', authenticate, async (req, res) => {
  const notifications = await query(`
    SELECT n.*, u.username 
    FROM notifications n 
    JOIN users u ON n.created_by = u.id 
    ORDER BY n.created_at DESC 
    LIMIT 20
  `);
  res.json(notifications);
});

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  const task = await get('SELECT * FROM tasks WHERE id = $1', [req.params.id]);

  if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
  if (task.user_id !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea' });
  }

  await run('DELETE FROM tasks WHERE id = $1', [req.params.id]);
  res.json({ message: 'Tarea eliminada' });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});
