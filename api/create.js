import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function generateTrackingId() {
  const prefix = 'AAC';
  const num = Math.floor(10000 + Math.random() * 90000);
  const suffix = ['NX', 'XL', 'QR', 'YT', 'ZW'][Math.floor(Math.random() * 5)];
  return `${prefix}-${num}-${suffix}`;
}

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;
    const trackingId = data.trackingId || generateTrackingId();
    
    const query = `
      INSERT INTO packages (
        tracking_id, sender_name, recipient_name, recipient_phone, recipient_email,
        status, origin, destination, weight, delivery_date, current_location,
        description, image, history_chain
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const values = [
      trackingId, data.senderName || '', data.recipientName || '', data.recipientPhone || '',
      data.recipientEmail || '', data.status || 'IN TRANSIT', data.origin || '',
      data.destination || '', data.weight || '', data.deliveryDate || null,
      data.currentLocation || '', data.description || '', data.image || '',
      data.historyChain || '[]'
    ];

    const { rows } = await pool.query(query, values);
    
    // Map DB snake_case to JS camelCase for your admin.html
    const pkg = rows[0];
    const mapped = {
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
    };
    
    res.status(201).json({ success: true, package: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
