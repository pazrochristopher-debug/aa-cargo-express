import { XataClient } from '@xata.io/client';

const xata = new XataClient({
  apiKey: process.env.XATA_API_KEY,
  branch: process.env.XATA_BRANCH
});

export default async function handler(req, res) {
  try {
    const records = await xata.db.packages.getMany({
      pagination: { size: 100 }
    });
    res.status(200).json({ records });
  } catch (e) {
    res.status(500).json({ 
      error: 'Xata SDK error', 
      message: e.message 
    });
  }
}
