// /api/update.js
export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { id,...updateData } = req.body;
    
    // First find the Xata record ID using tracking_number
    const findRes = await fetch(`${process.env.XATA_DATABASE_URL}/tables/packages/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.XATA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filter: { tracking_number: id }, page: { size: 1 } })
    });
    const findData = await findRes.json();
    const recordId = findData.records?.[0]?.id;
    
    if (!recordId) return res.status(404).json({ error: 'Package not found' });
    
    // Update the record
    const xataRes = await fetch(`${process.env.XATA_DATABASE_URL}/tables/packages/data/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.XATA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    const data = await xataRes.json();
    if (!xataRes.ok) return res.status(500).json({ error: 'Update failed', details: data });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}