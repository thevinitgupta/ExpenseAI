const memoryLimits = new Map();

export function allowUser(email: string, max = 7, intervalMs = 60000) {
  const now = Date.now();
  const entry = memoryLimits.get(email) || { count: 0, reset: now + intervalMs };

  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + intervalMs;
  }

  entry.count++;
  memoryLimits.set(email, entry);

  return entry.count <= max;
}