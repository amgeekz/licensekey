import checkAdmin from '../_checkAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const adminKey = req.headers['x-admin-key'] || '';
  const valid = await checkAdmin(adminKey);

  if (!valid) {
    console.log('Invalid admin password attempt');
    return res.status(401).json({ 
      ok: false, 
      message: 'Invalid admin password' 
    });
  }

  return res.status(200).json({ 
    ok: true, 
    message: 'Login berhasil' 
  });
}