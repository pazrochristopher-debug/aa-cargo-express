import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const data = req.body;
    
    const query = `
      UPDATE packages SET
        tracking_id = $1, sender_name = $2, recipient_name = $3, recipient_phone = $4,
        recipient_email = $5, status = $6, origin = $7, destination = $8, weight = $9,
        delivery_date = $10, current_location = $11, description = $12, image = $13,
        history_chain = $14, updated_at = NOW()
      WHERE id = $15
      RETURNING *
    `;
    
    const values = [
      data.trackingId, data.senderName, data.recipientName, data.recipientPhone,
      data.recipientEmail, data.status, data.origin, data.destination, data.weight,
      data.deliveryDate || null, data.currentLocation, data.description, data.image,
      data.historyChain || '[]', id
    ];

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Package not found' });
    
    res.status(200).json({ success: true, package: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
