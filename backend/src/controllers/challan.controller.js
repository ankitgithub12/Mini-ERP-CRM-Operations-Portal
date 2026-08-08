const challanService = require('../services/challan.service');
const { success, created } = require('../utils/apiResponse');

const getChallans = async (req, res, next) => {
  try {
    const result = await challanService.getChallans(req.query);
    return success(res, 'Challans retrieved successfully', result);
  } catch (err) {
    next(err);
  }
};

const getChallanById = async (req, res, next) => {
  try {
    const challan = await challanService.getChallanById(req.params.id);
    return success(res, 'Challan retrieved successfully', challan);
  } catch (err) {
    next(err);
  }
};

const createChallan = async (req, res, next) => {
  try {
    const challan = await challanService.createChallan(req.body, req.user.id);
    return created(res, 'Challan created successfully', challan);
  } catch (err) {
    next(err);
  }
};

const updateChallan = async (req, res, next) => {
  try {
    const challan = await challanService.updateChallan(
      req.params.id,
      req.body,
      req.user.id
    );
    return success(res, 'Challan updated successfully', challan);
  } catch (err) {
    next(err);
  }
};

const confirmChallan = async (req, res, next) => {
  try {
    const challan = await challanService.confirmChallan(
      req.params.id,
      req.user.id
    );
    return success(res, 'Challan confirmed successfully', challan);
  } catch (err) {
    next(err);
  }
};

const cancelChallan = async (req, res, next) => {
  try {
    const challan = await challanService.cancelChallan(req.params.id);
    return success(res, 'Challan cancelled successfully', challan);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getChallans,
  getChallanById,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
};
