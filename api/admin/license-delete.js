// api/admin/license-delete.js
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
    const { licenseKey } = req.body || {};
    if (!licenseKey) {
      return res.status(400).json({ ok: false, message: "licenseKey wajib diisi" });
    }

    await db.collection("licenses").doc(licenseKey).delete();
    return res.json({ ok: true, message: "License dihapus" });
  } catch (err) {
    console.error("license-delete error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};
