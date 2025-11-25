import { db } from '../../lib/firebaseAdmin.js';
import verifyToken from './_verifyToken.js';

export default async function handler(req, res) {
  await verifyToken(req, res, async () => {
    try {
      const licensesRef = db.collection('licenses');
      const snapshot = await licensesRef.get();
      
      const items = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        
        items.push({
          licenseKey: data.licenseKey,
          ownerEmail: data.ownerEmail || '',
          status: data.status || 'unused',
          deviceId: data.deviceId || null,
          deviceName: data.deviceName || null,
          products: data.products || null,
          firstActivated: data.firstActivated ? data.firstActivated.toDate() : null,
          lastCheckin: data.lastCheckin ? data.lastCheckin.toDate() : null
        });
      });

      res.status(200).json({ ok: true, items });
    } catch (err) {
      console.error('Licenses list error:', err);
      res.status(500).json({ ok: false, message: 'Database error' });
    }
  });
}