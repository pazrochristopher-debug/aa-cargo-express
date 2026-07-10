import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'PUT') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing package id' });

  const {
    trackingId, senderName, recipientName, recipientPhone, recipientEmail,
    status, origin, destination, weight, deliveryDate, currentLocation,
    description, image, historyChain
  } = req.body;

  // Convert empty strings to null + fix date format
  const cleanValue = (val) => val === '' || val === undefined? null : val;

  // Fix: Convert "2026-07-20T00:00:00.000Z" to "2026-07-20" for date column
  const cleanDate = (val) => {
    if (!val) return null;
    return val.includes('T')? val.split('T')[0] : val;
  };

  try {
    const result = await pool.query(
      `UPDATE packages SET
        tracking_id = $1, sender_name = $2, recipient_name = $3, recipient_phone = $4,
        recipient_email = $5, status = $6, origin = $7, destination = $8, weight = $9,
        delivery_date = $10, current_location = $11, description = $12, image = $13,
        history_chain = $14
      WHERE id = $15 RETURNING *`,
      [
        cleanValue(trackingId),
        cleanValue(senderName),
        cleanValue(recipientName),
        cleanValue(recipientPhone),
        cleanValue(recipientEmail),
        cleanValue(status),
        cleanValue(origin),
        cleanValue(destination),
        cleanValue(weight),
        cleanDate(deliveryDate), // <-- Fixed date handling
        cleanValue(currentLocation),
        cleanValue(description),
        cleanValue(image),
        JSON.stringify(historyChain || []),
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    return res.status(200).json({ package: result.rows[0] });
  } catch (error) {
    console.error('Update API Error:', error);
    return res.status(500).json({
      error: 'Database error',
      details: error.message
    });
  }
}
