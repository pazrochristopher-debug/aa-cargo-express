import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method!== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tracking } = req.query;
  
  if (!tracking) {
    return res.status(400).json({ error: 'Tracking ID is required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM packages WHERE tracking_id = $1',
      [tracking]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.status(200).json({ package: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
