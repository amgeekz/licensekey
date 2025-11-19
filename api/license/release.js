import { db } from "../../lib/firebaseAdmin.js";

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
    const { licenseKey, product = "digiflazz" } = req.body || {};

    if (!licenseKey) {
      return res.status(400).json({ ok: false, message: "licenseKey kosong" });
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
    
    await docRef.update({
      [`products.${product}.deviceId`]: null,
      [`products.${product}.deviceName`]: null,
      [`products.${product}.status`]: "unused"
    });

    return res.json({ 
      ok: true, 
      message: `Device ${product} berhasil dilepas. License siap dipakai di perangkat lain.` 
    });
  } catch (err) {
    console.error("License release error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}