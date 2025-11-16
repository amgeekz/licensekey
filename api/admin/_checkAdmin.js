// api/admin/_checkAdmin.js
function isAdmin(req) {
  const keyFromHeader = req.headers["x-admin-key"] || req.headers["X-Admin-Key"];
  const ownerPassword = process.env.OWNER_PASSWORD;
  if (!ownerPassword) return false;
  return keyFromHeader === ownerPassword;
}

module.exports = { isAdmin };
