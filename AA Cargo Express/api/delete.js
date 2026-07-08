export default async function handler(req, res) {
  const { id } = req.query;
  try {
    await fetch(`${process.env.XATA_DATABASE_URL}/tables/packages/data/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${process.env.XATA_API_KEY}` }
    });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}