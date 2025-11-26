import { db } from '../../lib/firebaseAdmin.js';
import verifyToken from './_verifyToken.js';

export default async function handler(req, res) {
  await verifyToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, message: 'Method not allowed' });
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
        status: status || 'active',
        updatedAt: new Date()
      };

      if (status === 'unused') {
        payload.products = null;
      }

      await docRef.set(payload, { merge: true });

      return res.json({ ok: true, message: 'License disimpan/diupdate' });
    } catch (err) {
      console.error('license-save error:', err);
      return res.status(500).json({ ok: false, message: 'Server error: ' + err.message });
    }
  });
}