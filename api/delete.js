import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method!== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check admin auth first
  if (!verifyAdmin(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Package ID required' });
  }

  try {
    const result = await pool.query('DELETE FROM packages WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete API Error:', error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
}
