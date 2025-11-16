// api/admin/license-save.js
const { db } = require("../lib/firebaseAdmin");
const { isAdmin } = require("./_checkAdmin");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const { licenseKey, ownerEmail, status } = req.body || {};

    if (!licenseKey) {
      return res.status(400).json({ ok: false, message: "licenseKey wajib diisi" });
    }

    const docRef = db.collection("licenses").doc(licenseKey);

    const payload = {
      licenseKey,
      ownerEmail: ownerEmail || "",
      status: status || "unused"
    };

    // jangan sentuh deviceId/deviceName di sini, fokus hanya data lisensi
    await docRef.set(payload, { merge: true });

    return res.json({ ok: true, message: "License disimpan/diupdate" });
  } catch (err) {
    console.error("license-save error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};
