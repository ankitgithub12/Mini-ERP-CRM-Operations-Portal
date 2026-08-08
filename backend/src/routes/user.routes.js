const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticateUser = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorize');

router.use(authenticateUser);

// GET /api/users — Admin only
router.get('/', authorizeRoles('Admin'), userController.getUsers);

// POST /api/users — Admin only
router.post('/', authorizeRoles('Admin'), userController.createUser);

module.exports = router;
