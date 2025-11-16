// api/license/release.js
import { db } from "../../lib/firebaseAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { licenseKey } = req.body || {};

    if (!licenseKey) {
      return res.status(400).json({ ok: false, message: "licenseKey kosong" });
    }

    const docRef = db.collection("licenses").doc(licenseKey);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ ok: false, message: "License tidak ditemukan" });
    }

    await docRef.update({
      deviceId: null,
      deviceName: null,
      status: "unused"
    });

    return res.json({ ok: true, message: "Device dilepas, license siap dipakai di perangkat lain." });
  } catch (err) {
    console.error("License release error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
}