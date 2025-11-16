export default async function checkAdmin(key) {
  
  const realKey = process.env.ADMIN_KEY;

  return key && key === realKey;
}
