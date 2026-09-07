import {httpError} from '../utils/http.mjs';
export function createRateLimiter() {
  const limits = new Map();
  const limited = (key, max = 30) => {
    const now = Date.now();
    if (limits.size > 10000)
      for (const [k, v] of limits) if (v.until < now) limits.delete(k);
    const v = limits.get(key);
    if (!v || v.until < now) limits.set(key, { n: 1, until: now + 60000 });
    else if (++v.n > max) throw httpError(429, "잠시 후 다시 시도해주세요.");
  };

return limited;
}
