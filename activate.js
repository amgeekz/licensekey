import { db, admin } from "../../lib/firebaseAdmin.js";

export default async function handler(req, res) {
  // === CORS HEADERS - PASTIKAN INI ADA ===
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // === END CORS ===

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { licenseKey, deviceId, deviceName } = req.body || {};

    if (!licenseKey || !deviceId) {
      return res.status(400).json({ ok: false, message: "licenseKey / deviceId kosong" });
    }

    const docRef = db.collection("licenses").doc(licenseKey);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ ok: false, message: "License tidak ditemukan" });
    }

    const lic = snap.data();

    if (!lic.deviceId) {
      await docRef.update({
        deviceId,
        deviceName: deviceName || null,
        status: "active",
        firstActivated: lic.firstActivated || admin.firestore.FieldValue.serverTimestamp(),
        lastCheckin: admin.firestore.FieldValue.serverTimestamp()
      });
      return res.json({ ok: true, message: "Aktivasi berhasil (pertama kali)" });
    }

    if (lic.deviceId === deviceId) {
      await docRef.update({
        status: "active",
        lastCheckin: admin.firestore.FieldValue.serverTimestamp()
      });
      return res.json({ ok: true, message: "Device sama, diizinkan" });
    }

    return res.status(403).json({
      ok: false,
      message: "License sudah digunakan di perangkat lain. Lepaskan dulu dari dashboard."
    });
  } catch (err) {
    console.error("License activate error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}