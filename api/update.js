import { XataClient } from '@xata.io/client';

const xata = new XataClient({
  apiKey: process.env.XATA_API_KEY,
  branch: process.env.XATA_BRANCH
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { id, ...fields } = req.body;
    let record;
    if (id) {
      record = await xata.db.packages.update(id, fields);
    } else {
      record = await xata.db.packages.create(fields);
    }
    res.status(200).json(record);
  } catch (e) {
    res.status(500).json({ 
      error: 'Xata SDK error', 
      message: e.message 
    });
  }
}
