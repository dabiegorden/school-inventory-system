const express = require('express');
const requestController = require('../controllers/requestController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

// Routes for students
router.post('/', requireRole(['student']), requestController.createRequest);
router.get('/my-requests', requireRole(['student']), requestController.getStudentRequests);
router.put('/:id/cancel', requireRole(['student']), requestController.cancelRequest);

// Routes for admin and staff
router.get('/', requireRole(['admin', 'staff']), requestController.getAllRequests);
router.put('/:id/status', requireRole(['admin', 'staff']), requestController.updateRequestStatus);

// Routes accessible by all authenticated users
router.get('/:id', requestController.getRequest);

module.exports = router;