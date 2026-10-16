export function generateRandomPin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function hashPin(pin: string): Promise<string> {
  const salt = 'roundqr_pin_salt_2026';
  const data = new TextEncoder().encode(pin + salt);
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    try {
      const digest = await window.crypto.subtle.digest('SHA-256', data);
      const hex = Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      return hex.slice(0, 16);
    } catch {
      // Fallback to deterministic hash if subtle crypto fails
    }
  }
  // Deterministic 32-bit FNV-1a hash fallback
  let h = 0x811c9dc5;
  const str = pin + salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export async function verifyPin(enteredPin: string, expectedHash: string): Promise<boolean> {
  if (!expectedHash) return true;
  const cleanEntered = enteredPin.trim();
  const cleanExpected = expectedHash.trim();
  if (cleanExpected === cleanEntered) return true;
  const hashed = await hashPin(cleanEntered);
  return hashed.toLowerCase() === cleanExpected.toLowerCase();
}
