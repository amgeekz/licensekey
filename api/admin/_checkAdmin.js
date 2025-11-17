// _checkAdmin.js
export default async function checkAdmin(key) {
  const realKey = process.env.OWNER_PASSWORD; // Ganti dari ADMIN_KEY ke OWNER_PASSWORD
  return key && key === realKey;
}

export function isAdmin(req) {
  const adminKey = req.headers["x-admin-key"] || "";
  return checkAdmin(adminKey);
}