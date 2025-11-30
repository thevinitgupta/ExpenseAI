// Client-side encryption for API keys
export async function encryptApiKey(apiKey: string): Promise<string> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode('expense-tracker-key-v1'),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
  
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode('expense-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
  
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(apiKey)
    );
  
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
  
    return btoa(String.fromCharCode(...combined));
  }
  
  export async function decryptApiKey(encrypted: string): Promise<string> {
    const enc = new TextEncoder();
    const dec = new TextDecoder();
  
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
  
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode('expense-tracker-key-v1'),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
  
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode('expense-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
  
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
  
    return dec.decode(decrypted);
  }