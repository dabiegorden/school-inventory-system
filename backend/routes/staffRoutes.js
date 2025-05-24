const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and staff/admin role requirement to all routes
router.use(requireAuth);
router.use(requireRole(['admin', 'staff']));

// Staff-specific routes can be added here
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: req.session.user
  });
});

module.exports = router;