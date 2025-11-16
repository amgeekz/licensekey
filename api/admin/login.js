// api/admin/login.js
const { isAdmin } = require("./_checkAdmin");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({ ok: false, message: "Password salah" });
  }

  return res.json({ ok: true, message: "Login berhasil" });
};
