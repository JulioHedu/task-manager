const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT false,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
  CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'created',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
}

async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  if (sql.trim().toUpperCase().startsWith('SELECT') && result.rows.length === 1 && /\bWHERE\b/i.test(sql)) {
    return result.rows[0];
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_notifications_created_by ON notifications(created_by)
  `);
}
  return result.rows;
}

async function get(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows[0] || null;
}

async function run(sql, params = []) {
  const result = await pool.query(sql, params);
  return result;
}

module.exports = { initDb, query, get, run };
