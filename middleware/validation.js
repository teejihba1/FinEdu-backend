const Joi = require('joi');
const { ERROR_MESSAGES } = require('../utils/constants');

function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false, allowUnknown: true });
    if (error) {
      return res.status(400).json({
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        message: error.details.map(d => d.message).join(', ')
      });
    }
    next();
  };
}

module.exports = validate; 