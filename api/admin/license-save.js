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
      const existingDoc = await docRef.get();
      const existingData = existingDoc.exists ? existingDoc.data() : {};

      let products = existingData.products || {};
      
      if (status === 'unused') {
        products = {
          digiflazz: { status: 'unused' },
          whatsapp: { status: 'unused' },
          telegram: { status: 'unused' }
        };
      } else if (status === 'disabled') {
        Object.keys(products).forEach(product => {
          if (products[product]) {
            products[product].status = 'disabled';
          }
        });
      }

      const payload = {
        licenseKey,
        ownerEmail: ownerEmail || '',
        status: status || 'unused',
        products: products,
        updatedAt: new Date()
      };

      if (existingData.deviceId && !products.digiflazz?.deviceId) {
        payload.products.digiflazz = {
          status: status === 'unused' ? 'unused' : 'active',
          deviceId: existingData.deviceId,
          deviceName: existingData.deviceName || '',
          firstActivated: existingData.firstActivated,
          lastCheckin: existingData.lastCheckin
        };
      }

      await docRef.set(payload, { merge: true });

      return res.json({ ok: true, message: 'License disimpan/diupdate' });
    } catch (err) {
      console.error('license-save error:', err);
      return res.status(500).json({ ok: false, message: 'Server error: ' + err.message });
    }
  });
}