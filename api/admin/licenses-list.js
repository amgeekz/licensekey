// api/admin/licenses-list.js
const { db } = require("../lib/firebaseAdmin");
const { isAdmin } = require("./_checkAdmin");

module.exports = async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const snap = await db.collection("licenses").orderBy("licenseKey").get();
    const items = [];
    snap.forEach(doc => {
      const d = doc.data();
      items.push({
        licenseKey: d.licenseKey || doc.id,
        ownerEmail: d.ownerEmail || "",
        status: d.status || "unused",
        deviceId: d.deviceId || null,
        deviceName: d.deviceName || null,
        firstActivated: d.firstActivated ? d.firstActivated.toDate() : null,
        lastCheckin: d.lastCheckin ? d.lastCheckin.toDate() : null
      });
    });

    return res.json({ ok: true, items });
  } catch (err) {
    console.error("licenses-list error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};
