const { nodeEnv } = require('../config/env');
const { error } = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.details.map((d) => d.message);
  }

  // Log error in development
  if (nodeEnv === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
    });
  }

  return error(res, message, statusCode, errors);
};

module.exports = errorHandler;
