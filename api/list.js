import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    trackingId, senderName, recipientName, recipientPhone, recipientEmail,
    status, origin, destination, weight, deliveryDate, currentLocation,
    description, image, historyChain
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO packages (
        tracking_id, sender_name, recipient_name, recipient_phone, recipient_email,
        status, origin, destination, weight, delivery_date, current_location,
        description, image, history_chain
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        trackingId, senderName, recipientName, recipientPhone, recipientEmail,
        status, origin, destination, weight, deliveryDate, currentLocation,
        description, image, JSON.stringify(historyChain || [])
      ]
    );

    const pkg = result.rows[0];
    return res.status(201).json({
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
