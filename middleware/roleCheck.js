const { ERROR_MESSAGES } = require('../utils/constants');

function roleCheck(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: ERROR_MESSAGES.FORBIDDEN, message: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = roleCheck; 