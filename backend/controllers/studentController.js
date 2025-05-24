const db = require('../config/database');

const studentController = {
  // Get student profile
  getProfile: async (req, res) => {
    try {
      const studentId = req.session.user.id;

      const [rows] = await db.execute(`
        SELECT id, student_id, full_name, email, phone, class, year_group, status, created_at, last_login
        FROM students 
        WHERE id = ?
      `, [studentId]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });

    } catch (error) {
      console.error('Get student profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }
  },

  // Update student profile
  updateProfile: async (req, res) => {
    try {
      const studentId = req.session.user.id;
      const { fullName, email, phone } = req.body;

      // Validation
      if (!fullName || !email) {
        return res.status(400).json({
          success: false,
          message: 'Full name and email are required'
        });
      }

      // Check if email is already taken by another student
      const [existing] = await db.execute(
        'SELECT id FROM students WHERE email = ? AND id != ?',
        [email, studentId]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }

      // Update profile
      await db.execute(`
        UPDATE students 
        SET full_name = ?, email = ?, phone = ?, updated_at = NOW()
        WHERE id = ?
      `, [fullName, email, phone, studentId]);

      // Update session data
      req.session.user.name = fullName;
      req.session.user.email = email;

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });

    } catch (error) {
      console.error('Update student profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  },

  // Get student dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      const studentId = req.session.user.id;

      // Get request counts by status
      const [requestStats] = await db.execute(`
        SELECT status, COUNT(*) as count 
        FROM requests 
        WHERE student_id = ? 
        GROUP BY status
      `, [studentId]);

      // Get recent requests
      const [recentRequests] = await db.execute(`
        SELECT r.*, i.name as item_name, i.item_code, i.quantity as available_quantity,
               st.full_name as processed_by_name
        FROM requests r
        JOIN inventory_items i ON r.item_id = i.id
        LEFT JOIN staff st ON r.processed_by = st.id
        WHERE r.student_id = ?
        ORDER BY r.created_at DESC
        LIMIT 10
      `, [studentId]);

      // Get recent distributions
      const [recentDistributions] = await db.execute(`
        SELECT d.*, i.name as item_name, i.item_code,
               st.full_name as distributed_by_name
        FROM distributions d
        JOIN inventory_items i ON d.item_id = i.id
        JOIN staff st ON d.distributed_by = st.id
        WHERE d.student_id = ?
        ORDER BY d.created_at DESC
        LIMIT 5
      `, [studentId]);

      // Format request stats
      const stats = {
        pending: 0,
        approved: 0,
        rejected: 0,
        distributed: 0,
        cancelled: 0
      };

      requestStats.forEach(stat => {
        stats[stat.status] = stat.count;
      });

      res.json({
        success: true,
        data: {
          stats,
          recentRequests,
          recentDistributions
        }
      });

    } catch (error) {
      console.error('Student dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  },

  // Get available items for request
  getAvailableItems: async (req, res) => {
    try {
      const { search, categoryId } = req.query;

      let query = `
        SELECT i.*, c.name as category_name
        FROM inventory_items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.status = 'active' AND i.quantity > 0
      `;
      const params = [];

      if (search) {
        query += ' AND (i.name LIKE ? OR i.description LIKE ? OR i.item_code LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (categoryId) {
        query += ' AND i.category_id = ?';
        params.push(categoryId);
      }

      query += ' ORDER BY i.name';

      const [rows] = await db.execute(query, params);

      res.json({
        success: true,
        data: rows
      });

    } catch (error) {
      console.error('Get available items error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available items'
      });
    }
  }
};

module.exports = studentController;