import { db, admin } from "../../lib/firebaseAdmin.js";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { licenseKey, deviceId, deviceName, product = "digiflazz" } = req.body || {};

    if (!licenseKey || !deviceId) {
      return res.status(400).json({ ok: false, message: "licenseKey / deviceId kosong" });
    }

    const validProducts = ["digiflazz", "whatsapp", "telegram"];
    if (!validProducts.includes(product)) {
      return res.status(400).json({ ok: false, message: "Product tidak valid" });
    }

    const docRef = db.collection("licenses").doc(licenseKey);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ ok: false, message: "License tidak ditemukan" });
    }

    const lic = snap.data();
    
    if (lic.status === "disabled") {
      return res.status(403).json({ ok: false, message: "License dinonaktifkan" });
    }

    const productData = lic.products?.[product] || {};
    const now = admin.firestore.FieldValue.serverTimestamp();

    if (!productData.deviceId) {
      await docRef.update({
        [`products.${product}`]: {
          status: "active",
          deviceId,
          deviceName: deviceName || null,
          firstActivated: productData.firstActivated || now,
          lastCheckin: now
        },
        status: "active",
        lastCheckin: now
      });
      return res.json({ 
        ok: true, 
        message: `Aktivasi ${product} berhasil`,
        product: product
      });
    }

    if (productData.deviceId === deviceId) {
      await docRef.update({
        [`products.${product}.lastCheckin`]: now,
        [`products.${product}.status`]: "active",
        lastCheckin: now
      });
      return res.json({ 
        ok: true, 
        message: `Device ${product} sama, diizinkan`,
        product: product
      });
    }

    return res.status(403).json({
      ok: false,
      message: `License sudah digunakan di perangkat ${product} lain.`
    });

  } catch (err) {
    console.error("License activate error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}