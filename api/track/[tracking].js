import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method!== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tracking } = req.query;

  if (!tracking) {
    return res.status(400).json({ error: 'Tracking ID required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM packages WHERE tracking_id = $1 LIMIT 1',
      [tracking]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const pkg = result.rows[0];

    // Safely parse history_chain - handles null, string, or object
    let historyChain = [];
    if (pkg.history_chain) {
      try {
        historyChain = typeof pkg.history_chain === 'string'
         ? JSON.parse(pkg.history_chain)
          : pkg.history_chain;
      } catch (e) {
        console.error('Failed to parse history_chain:', e);
        historyChain = [];
      }
    }

    const formatted = {
      id: pkg.id,
      trackingId: pkg.tracking_id,
      senderName: pkg.sender_name,
      recipientName: pkg.recipient_name,
      recipientPhone: pkg.recipient_phone,
      recipientEmail: pkg.recipient_email,
      status: pkg.status,
      origin: pkg.origin,
      destination: pkg.destination,
      weight: pkg.weight,
      deliveryDate: pkg.delivery_date,
      currentLocation: pkg.current_location,
      description: pkg.description,
      image: pkg.image,
      historyChain: historyChain // Now always an array
    };

    return res.status(200).json({ package: formatted });
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({
      error: 'Database error',
      details: error.message // This will show the real error
    });
  }
}
