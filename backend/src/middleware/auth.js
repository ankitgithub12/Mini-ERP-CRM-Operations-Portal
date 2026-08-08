const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const AppError = require('../utils/AppError');

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(err);
  }
};

module.exports = authenticateUser;
