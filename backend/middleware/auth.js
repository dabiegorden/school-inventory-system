// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.session.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Admin only middleware
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Staff or Admin middleware
const requireStaffOrAdmin = (req, res, next) => {
  if (!req.session.user || !['admin', 'staff'].includes(req.session.user.userType)) {
    return res.status(403).json({
      success: false,
      message: 'Staff or Admin access required'
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
  requireStaffOrAdmin
};