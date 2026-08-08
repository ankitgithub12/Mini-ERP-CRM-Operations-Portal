const dashboardService = require('../services/dashboard.service');
const { success } = require('../utils/apiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardData();
    return success(res, 'Dashboard data retrieved successfully', data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
