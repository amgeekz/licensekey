import jwt from 'jsonwebtoken';

export default function verifyToken(req, res, next) {
  const token = req.headers['x-admin-token'] || '';
  
  if (!token) {
    return res.status(401).json({ ok: false, message: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(401).json({ ok: false, message: 'Invalid or expired token' });
  }
}