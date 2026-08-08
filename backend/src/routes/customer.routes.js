const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const authenticateUser = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorize');
const { validate } = require('../middleware/validateRequest');
const {
  createCustomerSchema,
  updateCustomerSchema,
  createFollowUpSchema,
} = require('../validators/customer.validator');

// All routes require authentication
router.use(authenticateUser);

// GET /api/customers
router.get(
  '/',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  customerController.getCustomers
);

// GET /api/customers/:id
router.get(
  '/:id',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  customerController.getCustomerById
);

// POST /api/customers
router.post(
  '/',
  authorizeRoles('Admin', 'Sales'),
  validate(createCustomerSchema),
  customerController.createCustomer
);

// PUT /api/customers/:id
router.put(
  '/:id',
  authorizeRoles('Admin', 'Sales'),
  validate(updateCustomerSchema),
  customerController.updateCustomer
);

// DELETE /api/customers/:id (soft delete)
router.delete(
  '/:id',
  authorizeRoles('Admin'),
  customerController.deleteCustomer
);

// GET /api/customers/:id/followups
router.get(
  '/:id/followups',
  authorizeRoles('Admin', 'Sales', 'Accounts'),
  customerController.getFollowUps
);

// POST /api/customers/:id/followups
router.post(
  '/:id/followups',
  authorizeRoles('Admin', 'Sales'),
  validate(createFollowUpSchema),
  customerController.createFollowUp
);

module.exports = router;
