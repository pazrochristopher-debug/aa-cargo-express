// /api/list.js
export default async function handler(req, res) {
  try {
    const xataRes = await fetch(`${process.env.XATA_DATABASE_URL}/tables/packages/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.XATA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ page: { size: 100 } })
    });
    const data = await xataRes.json();
    if (!xataRes.ok) {
      return res.status(500).json({ 
        error: 'Xata error', 
        status: xataRes.status, 
        details: data 
      });
    }
    res.status(200).json({ records: data.records || [] });
  } catch (e) {
    res.status(500).json({ error: 'Server error', message: e.message });
  }
}