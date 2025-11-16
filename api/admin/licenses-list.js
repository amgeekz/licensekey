import checkAdmin from "./_checkAdmin";

export default async function handler(req, res) {
  const adminKey = req.headers["x-admin-key"] || "";
  const valid = await checkAdmin(adminKey);

  if (!valid)
    return res.status(401).json({ ok: false, message: "Invalid admin key" });

  // AMBIL DATA FILE JSON DI ROOT
  const fs = require("fs");
  const path = require("path");
  const file = path.join(process.cwd(), "licenses.json");

  let data = [];
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {}

  res.status(200).json({ ok: true, items: data });
}
