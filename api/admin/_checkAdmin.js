export default async function checkAdmin(key) {
  const realKey = process.env.OWNER_PASSWORD;
  console.log("Checking admin key:", { 
    provided: key ? "***" : "empty", 
    expected: realKey ? "***" : "empty" 
  });
  return key === realKey;
}