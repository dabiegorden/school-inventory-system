const bcrypt = require('bcryptjs');
const db = require('../config/database');

const adminController = {
  // Dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      // Get total counts
      const [staffCount] = await db.execute('SELECT COUNT(*) as count FROM staff WHERE status = "active"');
      const [studentCount] = await db.execute('SELECT COUNT(*) as count FROM students WHERE status = "active"');
      const [itemCount] = await db.execute('SELECT COUNT(*) as count FROM inventory_items WHERE status = "active"');
      const [pendingRequests] = await db.execute('SELECT COUNT(*) as count FROM requests WHERE status = "pending"');
      
      // Get low stock items
      const [lowStockItems] = await db.execute(
        'SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= minimum_quantity AND status = "active"'
      );

      // Get recent activities
      const [recentActivities] = await db.execute(`
        SELECT 'request' as type, r.id, r.created_at, s.full_name as user_name, 'Item request submitted' as activity
        FROM requests r 
        JOIN students s ON r.student_id = s.id 
        WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        UNION ALL
        SELECT 'distribution' as type, d.id, d.created_at, st.full_name as user_name, 'Item distributed' as activity
        FROM distributions d 
        JOIN staff st ON d.distributed_by = st.id 
        WHERE d.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY created_at DESC 
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          stats: {
            totalStaff: staffCount[0].count,
            totalStudents: studentCount[0].count,
            totalItems: itemCount[0].count,
            pendingRequests: pendingRequests[0].count,
            lowStockItems: lowStockItems[0].count
          },
          recentActivities
        }
      });

    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  },

  // Staff Management
  getAllStaff: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT id, staff_id, full_name, email, phone, department, position, status, created_at, last_login
        FROM staff 
        ORDER BY created_at DESC
      `);

      res.json({
        success: true,
        data: rows
      });

    } catch (error) {
      console.error('Get all staff error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch staff members'
      });
    }
  },

  createStaff: async (req, res) => {
    try {
      const { staffId, fullName, email, phone, department, position, username, password } = req.body;

      // Validation
      if (!staffId || !fullName || !email || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Staff ID, full name, email, username, and password are required'
        });
      }

      // Check if staff ID or username already exists
      const [existing] = await db.execute(
        'SELECT id FROM staff WHERE staff_id = ? OR username = ? OR email = ?',
        [staffId, username, email]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Staff ID, username, or email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert new staff
      const [result] = await db.execute(`
        INSERT INTO staff (staff_id, full_name, email, phone, department, position, username, password, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `, [staffId, fullName, email, phone, department, position, username, hashedPassword]);

      res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        data: { id: result.insertId }
      });

    } catch (error) {
      console.error('Create staff error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create staff member'
      });
    }
  },

  updateStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, email, phone, department, position, status } = req.body;

      // Check if staff exists
      const [existing] = await db.execute('SELECT id FROM staff WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      // Update staff
      await db.execute(`
        UPDATE staff 
        SET full_name = ?, email = ?, phone = ?, department = ?, position = ?, status = ?, updated_at = NOW()
        WHERE id = ?
      `, [fullName, email, phone, department, position, status, id]);

      res.json({
        success: true,
        message: 'Staff member updated successfully'
      });

    } catch (error) {
      console.error('Update staff error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update staff member'
      });
    }
  },

  deleteStaff: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if staff exists
      const [existing] = await db.execute('SELECT id FROM staff WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found'
        });
      }

      // Soft delete (update status to inactive)
      await db.execute('UPDATE staff SET status = "inactive", updated_at = NOW() WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Staff member deleted successfully'
      });

    } catch (error) {
      console.error('Delete staff error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete staff member'
      });
    }
  },

  // Student Management
  getAllStudents: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT id, student_id, full_name, email, phone, class, year_group, status, created_at, last_login
        FROM students 
        ORDER BY created_at DESC
      `);

      res.json({
        success: true,
        data: rows
      });

    } catch (error) {
      console.error('Get all students error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch students'
      });
    }
  },

  createStudent: async (req, res) => {
    try {
      const { studentId, fullName, email, phone, className, yearGroup, username, password } = req.body;

      // Validation
      if (!studentId || !fullName || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, full name, username, and password are required'
        });
      }

      // Check if student ID or username already exists
      const [existing] = await db.execute(
        'SELECT id FROM students WHERE student_id = ? OR username = ? OR email = ?',
        [studentId, username, email]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, username, or email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insert new student
      const [result] = await db.execute(`
        INSERT INTO students (student_id, full_name, email, phone, class, year_group, username, password, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `, [studentId, fullName, email, phone, className, yearGroup, username, hashedPassword]);

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: { id: result.insertId }
      });

    } catch (error) {
      console.error('Create student error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create student'
      });
    }
  },

  updateStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const { fullName, email, phone, className, yearGroup, status } = req.body;

      // Check if student exists
      const [existing] = await db.execute('SELECT id FROM students WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Update student
      await db.execute(`
        UPDATE students 
        SET full_name = ?, email = ?, phone = ?, class = ?, year_group = ?, status = ?, updated_at = NOW()
        WHERE id = ?
      `, [fullName, email, phone, className, yearGroup, status, id]);

      res.json({
        success: true,
        message: 'Student updated successfully'
      });

    } catch (error) {
      console.error('Update student error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update student'
      });
    }
  },

  deleteStudent: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if student exists
      const [existing] = await db.execute('SELECT id FROM students WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }

      // Soft delete (update status to inactive)
      await db.execute('UPDATE students SET status = "inactive", updated_at = NOW() WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Student deleted successfully'
      });

    } catch (error) {
      console.error('Delete student error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete student'
      });
    }
  }
};

module.exports = adminController;