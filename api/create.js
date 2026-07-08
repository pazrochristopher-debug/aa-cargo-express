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

    return res.status(200).json({ package: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
}
