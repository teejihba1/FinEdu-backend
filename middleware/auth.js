const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ERROR_MESSAGES } = require('../utils/constants');

module.exports = async function (req, res, next) {
  let token;

  // Get token from header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) {
      return res.status(401).json({ error: ERROR_MESSAGES.UNAUTHORIZED, message: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: ERROR_MESSAGES.INVALID_TOKEN, message: 'Invalid or expired token' });
  }
}; 