const db = require('../config/database');

const staffController = {
  // Get staff profile
  getProfile: async (req, res) => {
    try {
      const staffId = req.session.user.id;

      const [rows] = await db.execute(`
        SELECT id, staff_id, full_name, email, phone, department, position, status, created_at, last_login
        FROM staff 
        WHERE id = ?
      `, [staffId]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Staff profile not found'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });

    } catch (error) {
      console.error('Get staff profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  },

  // Update staff profile
  updateProfile: async (req, res) => {
    try {
      const staffId = req.session.user.id;
      const { fullName, email, phone } = req.body;

      // Validation
      if (!fullName || !email) {
        return res.status(400).json({
          success: false,
          message: 'Full name and email are required'
        });
      }

      // Check if email is already taken by another staff member
      const [existing] = await db.execute(
        'SELECT id FROM staff WHERE email = ? AND id != ?',
        [email, staffId]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }

      // Update profile
      await db.execute(`
        UPDATE staff 
        SET full_name = ?, email = ?, phone = ?, updated_at = NOW()
        WHERE id = ?
      `, [fullName, email, phone, staffId]);

      // Update session data
      req.session.user.name = fullName;
      req.session.user.email = email;

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('Update staff profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  },

  // Get staff dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      // Get pending requests count
      const [pendingRequests] = await db.execute(
        'SELECT COUNT(*) as count FROM requests WHERE status = "pending"'
      );

      // Get approved requests waiting for distribution
      const [approvedRequests] = await db.execute(
        'SELECT COUNT(*) as count FROM requests WHERE status = "approved"'
      );

      // Get low stock items
      const [lowStockItems] = await db.execute(
        'SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= minimum_quantity AND status = "active"'
      );

      // Get today's distributions by this staff
      const [todayDistributions] = await db.execute(`
        SELECT COUNT(*) as count FROM distributions 
        WHERE distributed_by = ? AND DATE(created_at) = CURDATE()
      `, [req.session.user.id]);

      // Get recent requests
      const [recentRequests] = await db.execute(`
        SELECT r.*, s.full_name as student_name, s.student_id, s.class,
               i.name as item_name, i.item_code
        FROM requests r
        JOIN students s ON r.student_id = s.id
        JOIN inventory_items i ON r.item_id = i.id
        WHERE r.status IN ('pending', 'approved')
        ORDER BY r.created_at DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          stats: {
            pendingRequests: pendingRequests[0].count,
            approvedRequests: approvedRequests[0].count,
            lowStockItems: lowStockItems[0].count,
            todayDistributions: todayDistributions[0].count
          },
          recentRequests
        }
      });

    } catch (error) {
      console.error('Staff dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  }
};

module.exports = staffController;