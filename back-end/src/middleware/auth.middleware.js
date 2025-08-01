const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt.config');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido', type: 'session_expired' });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido', type: 'session_expired' });
    req.user = { userId: decoded.userId };
    next();
  });
};

module.exports = authenticateToken;