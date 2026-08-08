const authService = require('../services/auth.service');
const { success } = require('../utils/apiResponse');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    return success(res, 'Login successful', result);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    return success(res, 'User profile', req.user);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe };
