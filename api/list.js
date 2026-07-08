import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM packages ORDER BY id DESC');
    res.status(200).json({ records: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
