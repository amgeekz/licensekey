const loginAttempts = new Map();

export default function rateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 menit
  const maxAttempts = 5;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
  } else {
    const attemptData = loginAttempts.get(ip);
    if (now - attemptData.lastAttempt > windowMs) {
      attemptData.count = 1;
    } else {
      attemptData.count++;
    }
    attemptData.lastAttempt = now;

    if (attemptData.count > maxAttempts) {
      return res.status(429).json({ 
        ok: false, 
        message: 'Too many login attempts. Try again in 15 minutes.' 
      });
    }
  }

  next();
}