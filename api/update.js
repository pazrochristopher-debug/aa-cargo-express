import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method!== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const {
    trackingId, senderName, recipientName, recipientPhone, recipientEmail,
    status, origin, destination, weight, deliveryDate, currentLocation,
    description, image, historyChain
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE packages SET
        tracking_id = $1, sender_name = $2, recipient_name = $3, recipient_phone = $4,
        recipient_email = $5, status = $6, origin = $7, destination = $8, weight = $9,
        delivery_date = $10, current_location = $11, description = $12, image = $13,
        history_chain = $14
      WHERE id = $15 RETURNING *`,
      [
        trackingId, senderName, recipientName, recipientPhone, recipientEmail,
        status, origin, destination, weight, deliveryDate, currentLocation,
        description, image, JSON.stringify(historyChain || []), id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const pkg = result.rows[0];
    return res.status(200).json({
      package: {
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
      }
    });
  } catch (error) {
    console.error('Database error:', error.message);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
}
