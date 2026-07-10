import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function verifyAdmin(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
}

export default async function handler(req, res) {
  // CORS headers - added Authorization so browser can send token
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Check admin auth before touching DB
  if (!verifyAdmin(req, res)) return;

  const {
    trackingId, senderName, recipientName, recipientPhone, recipientEmail,
    status, origin, destination, weight, deliveryDate, currentLocation,
    description, image, historyChain
  } = req.body;

  if (!trackingId) return res.status(400).json({ error: 'Tracking ID is required' });

  // Convert empty strings to null + fix date format
  const cleanValue = (val) => val === '' || val === undefined? null : val;

  const cleanDate = (val) => {
    if (!val) return null;
    return val.includes('T')? val.split('T')[0] : val;
  };

  try {
    const result = await pool.query(
      `INSERT INTO packages (
        tracking_id, sender_name, recipient_name, recipient_phone, recipient_email,
        status, origin, destination, weight, delivery_date, current_location,
        description, image, history_chain
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
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
        cleanDate(deliveryDate),
        cleanValue(currentLocation),
        cleanValue(description),
        cleanValue(image),
        JSON.stringify(historyChain || [])
      ]
    );

    return res.status(201).json({ package: result.rows[0] });
  } catch (error) {
    console.error('Create API Error:', error);
    return res.status(500).json({
      error: 'Database error',
      details: error.message
    });
  }
}
