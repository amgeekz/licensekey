import checkAdmin from './_checkAdmin.js';
import jwt from 'jsonwebtoken';
import rateLimit from './_rateLimit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  await rateLimit(req, res, () => {});

  const adminKey = req.headers['x-admin-key'] || '';
  const valid = await checkAdmin(adminKey);

  if (!valid) {
    return res.status(401).json({ 
      ok: false, 
      message: 'Invalid admin password' 
    });
  }

  const token = jwt.sign(
    { 
      role: 'admin',
      timestamp: Date.now()
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(200).json({ 
    ok: true, 
    message: 'Login berhasil',
    token: token
  });
}