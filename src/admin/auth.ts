// Client-side "auth" for the admin editor. This is deliberately NOT real
// security — the whole app is static, so anyone can read the bundle. Storing a
// SHA-256 hash instead of the plaintext password is just light obfuscation to
// make casual cheating slightly harder, which is all that's needed here since
// the admin only exports a JSON file (it can't change any live data).
//
// Default password: "galaxy-admin".
// To change it, compute a new hash and paste it below:
//   bun -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"
const PASSWORD_HASH = "02cf450d2bbc05853453669c825ff78ff7efb1c27eec2d5e7648afa2f5c4b4d9";

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function checkPassword(input: string): Promise<boolean> {
  return (await sha256Hex(input)) === PASSWORD_HASH;
}
