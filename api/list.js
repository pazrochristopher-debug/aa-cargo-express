import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM packages ORDER BY created_at DESC');
    
    // Map DB fields to camelCase for admin.html
    const records = rows.map(pkg => ({
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
      historyChain: pkg.history_chain,
      createdAt: pkg.created_at
    }));
    
    res.status(200).json({ records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
