// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_dev_key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // console.log('authHeader:', authHeader);
  if (!authHeader) return res.status(401).json({ error: 'missing authorization header' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'malformed authorization header' });
  const token = parts[1];
  // console.log('## called from server', token)
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) return res.status(401).json({ error: 'invalid or expired token' });
    // attach user id to req
    req.user = { id: payload.sub, email: payload.email };
    // console.log('payload', payload)
    console.log('## called from server auth middleware', req.user)
    next();
  });
}

module.exports = authenticateToken;
