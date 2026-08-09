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

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return success(res, 'User updated successfully', user);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    return success(res, result.message, null);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };
