// lib/keyCache.ts
export const apiKeyCache: Record<string, { encryptedKey: string; iv: string; tag: string }> = {};
