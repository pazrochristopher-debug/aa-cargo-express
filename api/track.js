// /api/track.js
export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Missing tracking ID' });
  }

  try {
    const xataRes = await fetch(`${process.env.XATA_DATABASE_URL}/tables/packages/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.XATA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: { trackingId: id },
        page: { size: 1 }
      })
    });
    
    const data = await xataRes.json();
    
    if (!xataRes.ok) {
      console.log('Xata error:', data);
      return res.status(500).json({ error: 'Database error' });
    }
    
    const match = data.records?.[0];
    
    if (!match) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.status(200).json({ match });
  } catch (e) {
    console.log('API error:', e);
    res.status(500).json({ error: 'Server error' });
  }
}