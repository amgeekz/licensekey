import { db } from "../../lib/firebaseAdmin.js";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { licenseKey } = req.query;

    if (!licenseKey) {
      return res.status(400).json({ ok: false, message: "licenseKey kosong" });
    }

    const docRef = db.collection("licenses").doc(licenseKey);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ ok: false, message: "License tidak ditemukan" });
    }

    const lic = snap.data();

    return res.json({
      ok: true,
      license: {
        licenseKey: lic.licenseKey,
        ownerEmail: lic.ownerEmail || null,
        status: lic.status || "unknown",
        products: lic.products || {
          digiflazz: { status: "unused" },
          whatsapp: { status: "unused" },
          telegram: { status: "unused" }
        },
        firstActivated: lic.firstActivated ? lic.firstActivated.toDate() : null,
        lastCheckin: lic.lastCheckin ? lic.lastCheckin.toDate() : null
      }
    });
  } catch (err) {
    console.error("License info error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}