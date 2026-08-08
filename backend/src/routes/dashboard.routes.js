const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authenticateUser = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorize');

router.use(authenticateUser);

// GET /api/dashboard
router.get(
  '/',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  dashboardController.getDashboard
);

module.exports = router;
