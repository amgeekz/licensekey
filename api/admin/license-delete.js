import { db } from '../../lib/firebaseAdmin.js';
import verifyToken from './_verifyToken.js';

export default async function handler(req, res) {
  await verifyToken(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, message: 'Method not allowed' });
    }

    try {
      const { licenseKey } = req.body || {};
      if (!licenseKey) {
        return res.status(400).json({ ok: false, message: 'licenseKey wajib diisi' });
      }

      await db.collection('licenses').doc(licenseKey).delete();
      return res.json({ ok: true, message: 'License dihapus' });
    } catch (err) {
      console.error('license-delete error:', err);
      return res.status(500).json({ ok: false, message: 'Server error: ' + err.message });
    }
  });
}