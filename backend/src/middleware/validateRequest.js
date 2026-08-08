const AppError = require('../utils/AppError');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return next(new AppError('Validation failed', 400, messages));
    }

    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return next(new AppError('Validation failed', 400, messages));
    }

    next();
  };
};

module.exports = { validate, validateQuery };
