/**
 * Lightweight in-memory rate limiter for the admin login endpoint.
 *
 * No extra npm dependency needed (works with a plain in-memory Map),
 * which is enough for a single-Node-process deployment. If you ever run
 * multiple server instances behind a load balancer, replace the Map with
 * a shared store (Redis) so attempt counts are shared across instances.
 *
 * Behaviour: after MAX_ATTEMPTS failed logins from the same IP+email
 * combo within WINDOW_MS, further attempts are blocked with a 429 for
 * BLOCK_MS. A successful login clears the counter immediately.
 */

const WINDOW_MS = 15 * 60 * 1000; // failed attempts counted within this window
const MAX_ATTEMPTS = 5; // attempts allowed before lockout
const BLOCK_MS = 15 * 60 * 1000; // lockout duration once exceeded

const attempts = new Map(); // key -> { count, firstAttempt, blockedUntil }

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || req.ip || 'unknown';

const getKey = (req) => {
  const ip = getClientIp(req);
  const email = (req.body?.email || '').toLowerCase().trim();
  return `${ip}:${email}`;
};

// Runs BEFORE the login controller — blocks the request outright if this
// IP+email combo is currently locked out.
export const loginRateLimiter = (req, res, next) => {
  const key = getKey(req);
  const record = attempts.get(key);
  const now = Date.now();

  if (record?.blockedUntil && record.blockedUntil > now) {
    const waitMinutes = Math.ceil((record.blockedUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Please try again in ${waitMinutes} minute(s).`,
    });
  }

  next();
};

// Call from the login controller after a failed credential check.
export const registerFailedLogin = (req) => {
  const key = getKey(req);
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttempt: now, blockedUntil: null });
    return;
  }

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_MS;
  }
  attempts.set(key, record);
};

// Call from the login controller after a successful login, so a
// legitimate user isn't left with a lingering near-lockout count.
export const clearLoginAttempts = (req) => {
  attempts.delete(getKey(req));
};

// Periodic sweep so the Map doesn't grow unbounded over a long-running
// server process. Doesn't keep the event loop alive on its own.
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attempts.entries()) {
    const staleWindow = !record.blockedUntil && now - record.firstAttempt > WINDOW_MS;
    const staleBlock = record.blockedUntil && record.blockedUntil < now;
    if (staleWindow || staleBlock) attempts.delete(key);
  }
}, 10 * 60 * 1000);
cleanupTimer.unref?.();