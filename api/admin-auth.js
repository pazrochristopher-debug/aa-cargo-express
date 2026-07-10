import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ADMIN_HASH = process.env.ADMIN_HASH; // Hashed password from env
const JWT_SECRET = process.env.JWT_SECRET; // Random 32+ char string

export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password ||!ADMIN_HASH ||!JWT_SECRET) {
    return res.status(500).json({ error: 'Server config error' });
  }

  try {
    const valid = await bcrypt.compare(password, ADMIN_HASH);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Auth failed' });
  }
}
