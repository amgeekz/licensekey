import { db } from '../../lib/firebaseAdmin.js';
import checkAdmin from './_checkAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const adminKey = req.headers['x-admin-key'] || '';
  const valid = await checkAdmin(adminKey);

  if (!valid) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }

  try {
    const { licenseKey, ownerEmail, status } = req.body || {};

    if (!licenseKey) {
      return res.status(400).json({ ok: false, message: 'licenseKey wajib diisi' });
    }

    const docRef = db.collection('licenses').doc(licenseKey);

    const payload = {
      licenseKey,
      ownerEmail: ownerEmail || '',
      status: status || 'unused',
      updatedAt: new Date()
    };

    await docRef.set(payload, { merge: true });

    return res.json({ ok: true, message: 'License disimpan/diupdate' });
  } catch (err) {
    console.error('license-save error:', err);
    return res.status(500).json({ ok: false, message: 'Server error: ' + err.message });
  }
}