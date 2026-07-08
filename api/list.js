import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await pool.query('SELECT * FROM packages ORDER BY id DESC');

    const packages = result.rows.map(pkg => {
      // This handles null, [], "[]", {} safely - no more crashes
      let historyChain = [];
      try {
        if (pkg.history_chain) {
          historyChain = typeof pkg.history_chain === 'object'
           ? pkg.history_chain
            : JSON.parse(pkg.history_chain);
        }
      } catch (e) {
        console.error('Bad history_chain for id', pkg.id, e.message);
        historyChain = [];
      }

      return {
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
        historyChain: Array.isArray(historyChain) ? historyChain : []
      };
    });

    return res.status(200).json({ packages });
  } catch (error) {
    console.error('List API Error:', error);
    return res.status(500).json({
      error: 'Database error',
      details: error.message
    });
  }
}
