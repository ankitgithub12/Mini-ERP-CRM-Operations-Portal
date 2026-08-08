const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validateRequest');
const { loginSchema } = require('../validators/auth.validator');
const authenticateUser = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// GET /api/auth/me
router.get('/me', authenticateUser, authController.getMe);

module.exports = router;
