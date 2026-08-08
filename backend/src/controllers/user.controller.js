const userService = require('../services/user.service');
const { success, created } = require('../utils/apiResponse');

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    return success(res, 'Users retrieved successfully', users);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return created(res, 'User created successfully', user);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, createUser };
