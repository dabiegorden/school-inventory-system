const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/check', authController.checkAuth);

// NEW: Registration routes (public - no authentication required)
router.post('/register/staff', authController.registerStaff);
router.post('/register/student', authController.registerStudent);

// Protected routes (authentication required)
router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;