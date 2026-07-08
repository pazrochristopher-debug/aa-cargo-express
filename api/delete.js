import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method!== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const { rowCount } = await pool.query('DELETE FROM packages WHERE id = $1', [parseInt(id)]);
    if (rowCount === 0) return res.status(404).json({ error: 'Package not found' });
    
    res.status(200).json({ success: true, message: 'Package deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
