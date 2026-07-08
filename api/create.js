// /api/create.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const xataRes = await fetch(`${process.env.XATA_DATABASE_URL}/tables/packages/data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.XATA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await xataRes.json();
    if (!xataRes.ok) return res.status(500).json({ error: 'Create failed', details: data });
    res.status(200).json({ success: true, record: data });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}