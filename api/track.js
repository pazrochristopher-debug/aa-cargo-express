import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method!== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const tracking = req.query.tracking;
  
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

    const pkg = rows[0];
    const mapped = {
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

    res.status(200).json({ package: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
