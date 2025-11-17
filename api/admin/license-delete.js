// api/admin/license-delete.js
import { db } from "../../lib/firebaseAdmin.js";
import checkAdmin from "../_checkAdmin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const adminKey = req.headers["x-admin-key"] || "";
  const valid = await checkAdmin(adminKey);

  if (!valid) {
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
    return res.status(500).json({ ok: false, message: "Server error: " + err.message });
  }
}