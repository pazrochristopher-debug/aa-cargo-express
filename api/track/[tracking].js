import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
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
      'SELECT * FROM packages WHERE tracking_id = $1 LIMIT 1',
      [tracking]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Convert snake_case from DB to camelCase for frontend
    const pkg = result.rows[0];
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
      historyChain: pkg.history_chain
    };

    return res.status(200).json({ package: formatted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error' });
  }
}
