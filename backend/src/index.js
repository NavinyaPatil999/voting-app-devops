const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'voting',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS options (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      votes INTEGER DEFAULT 0
    )
  `);
  const { rows } = await pool.query('SELECT COUNT(*) FROM options');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`INSERT INTO options (name) VALUES ('Option A'), ('Option B'), ('Option C')`);
  }
}
initDB().catch(console.error);

app.get('/api/options', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM options ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vote/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE options SET votes = votes + 1 WHERE id = $1', [id]);
    const { rows } = await pool.query('SELECT * FROM options WHERE id = $1', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));