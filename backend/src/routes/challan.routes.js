const express = require('express');
const router = express.Router();
const challanController = require('../controllers/challan.controller');
const authenticateUser = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorize');
const { validate } = require('../middleware/validateRequest');
const {
  createChallanSchema,
  updateChallanSchema,
} = require('../validators/challan.validator');

// All routes require authentication
router.use(authenticateUser);

// GET /api/challans
router.get(
  '/',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  challanController.getChallans
);

// GET /api/challans/:id
router.get(
  '/:id',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  challanController.getChallanById
);

// POST /api/challans
router.post(
  '/',
  authorizeRoles('Admin', 'Sales'),
  validate(createChallanSchema),
  challanController.createChallan
);

// PUT /api/challans/:id
router.put(
  '/:id',
  authorizeRoles('Admin', 'Sales'),
  validate(updateChallanSchema),
  challanController.updateChallan
);

// POST /api/challans/:id/confirm
router.post(
  '/:id/confirm',
  authorizeRoles('Admin', 'Sales'),
  challanController.confirmChallan
);

// POST /api/challans/:id/cancel
router.post(
  '/:id/cancel',
  authorizeRoles('Admin', 'Sales'),
  challanController.cancelChallan
);

module.exports = router;
