const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin role requirement to all routes
router.use(requireAuth);
router.use(requireRole(['admin']));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Staff management
router.get('/staff', adminController.getAllStaff);
router.post('/staff', adminController.createStaff);
router.put('/staff/:id', adminController.updateStaff);
router.delete('/staff/:id', adminController.deleteStaff);

// Student management
router.get('/students', adminController.getAllStudents);
router.post('/students', adminController.createStudent);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

module.exports = router;