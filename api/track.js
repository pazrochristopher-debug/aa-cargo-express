import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method!== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tracking } = req.query;

  if (!tracking) {
    return res.status(400).json({ error: 'Tracking ID required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM packages WHERE "trackingId" = $1 LIMIT 1',
      [tracking]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    return res.status(200).json({ package: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error' });
  }
}
