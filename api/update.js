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

  const {
    id, trackingId, senderName, recipientName, recipientPhone, recipientEmail,
    status, origin, destination, weight, deliveryDate, currentLocation,
    description, image, historyChain
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE packages SET
        tracking_id=$2, sender_name=$3, recipient_name=$4, recipient_phone=$5, recipient_email=$6,
        status=$7, origin=$8, destination=$9, weight=$10, delivery_date=$11, current_location=$12,
        description=$13, image=$14, history_chain=$15
      WHERE id=$1 RETURNING *`,
      [
        id, trackingId, senderName, recipientName, recipientPhone, recipientEmail,
        status, origin, destination, weight, deliveryDate, currentLocation,
        description, image, JSON.stringify(historyChain || [])
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    return res.status(200).json({ package: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
}
