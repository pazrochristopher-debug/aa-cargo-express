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

  try {
    const result = await pool.query('SELECT * FROM packages ORDER BY id DESC');

    // Convert snake_case to camelCase for frontend
    const packages = result.rows.map(pkg => ({
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
      historyChain: pkg.history_chain? JSON.parse(pkg.history_chain) : []
    }));

    return res.status(200).json({ packages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
}
