const customerService = require('../services/customer.service');
const { success, created } = require('../utils/apiResponse');

const getCustomers = async (req, res, next) => {
  try {
    const result = await customerService.getCustomers(req.query);
    return success(res, 'Customers retrieved successfully', result);
  } catch (err) {
    next(err);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    return success(res, 'Customer retrieved successfully', customer);
  } catch (err) {
    next(err);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return created(res, 'Customer created successfully', customer);
  } catch (err) {
    next(err);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    return success(res, 'Customer updated successfully', customer);
  } catch (err) {
    next(err);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const result = await customerService.deleteCustomer(req.params.id);
    return success(res, result.message);
  } catch (err) {
    next(err);
  }
};

const getFollowUps = async (req, res, next) => {
  try {
    const followUps = await customerService.getFollowUps(req.params.id);
    return success(res, 'Follow-ups retrieved successfully', followUps);
  } catch (err) {
    next(err);
  }
};

const createFollowUp = async (req, res, next) => {
  try {
    const followUp = await customerService.createFollowUp(
      req.params.id,
      req.body,
      req.user.id
    );
    return created(res, 'Follow-up created successfully', followUp);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getFollowUps,
  createFollowUp,
};
