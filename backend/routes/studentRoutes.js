const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and student role requirement to all routes
router.use(requireAuth);
router.use(requireRole(['student']));

// Student-specific routes
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: req.session.user
  });
});

module.exports = router;