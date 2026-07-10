import jwt from 'jsonwebtoken';

function verifyAdmin(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
}

export default async function handler(req, res) {
  if (!verifyAdmin(req, res)) return; // Stops here if not logged in

  //... your existing create/update/delete code
}
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method!== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    await pool.query('DELETE FROM packages WHERE id = $1', [id]);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
}
