const bcrypt = require('bcryptjs');
const db = require('../config/database');

const authController = {
  // Existing login function (unchanged)
  login: async (req, res) => {
    try {
      const { username, password, userType } = req.body;

      if (!username || !password || !userType) {
        return res.status(400).json({
          success: false,
          message: 'Username, password, and user type are required'
        });
      }

      let query;
      let tableName;

      switch (userType) {
        case 'admin':
          tableName = 'admins';
          query = 'SELECT * FROM admins WHERE username = ? AND status = "active"';
          break;
        case 'staff':
          tableName = 'staff';
          query = 'SELECT * FROM staff WHERE (username = ? OR staff_id = ?) AND status = "active"';
          break;
        case 'student':
          tableName = 'students';
          query = 'SELECT * FROM students WHERE (username = ? OR student_id = ?) AND status = "active"';
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid user type'
          });
      }

      const [rows] = userType === 'admin' 
        ? await db.execute(query, [username])
        : await db.execute(query, [username, username]);

      if (rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = rows[0];

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        userType: userType,
        name: user.full_name || user.name,
        email: user.email,
        ...(userType === 'staff' && { staffId: user.staff_id }),
        ...(userType === 'student' && { studentId: user.student_id })
      };

      const updateQuery = `UPDATE ${tableName} SET last_login = NOW() WHERE id = ?`;
      await db.execute(updateQuery, [user.id]);

      res.json({
        success: true,
        message: 'Login successful',
        user: req.session.user
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // NEW: Staff registration function
  registerStaff: async (req, res) => {
    try {
      const { 
        staffId, 
        fullName, 
        email, 
        phone, 
        department, 
        position, 
        username, 
        password,
        confirmPassword 
      } = req.body;

      // Validation
      if (!staffId || !fullName || !email || !username || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Staff ID, full name, email, username, password, and confirm password are required'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Check if staff ID, username, or email already exists
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

      // Insert new staff with active status (no admin approval needed)
      const [result] = await db.execute(`
        INSERT INTO staff (
          staff_id, full_name, email, phone, department, position, 
          username, password, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `, [staffId, fullName, email, phone, department, position, username, hashedPassword]);

      res.status(201).json({
        success: true,
        message: 'Staff registration successful. You can now login.',
        data: { id: result.insertId }
      });

    } catch (error) {
      console.error('Staff registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  },

  // NEW: Student registration function
  registerStudent: async (req, res) => {
    try {
      const { 
        studentId, 
        fullName, 
        email, 
        phone, 
        className, 
        yearGroup, 
        username, 
        password,
        confirmPassword 
      } = req.body;

      // Validation
      if (!studentId || !fullName || !username || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, full name, username, password, and confirm password are required'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Email validation (if provided)
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
          });
        }
      }

      // Check if student ID, username, or email already exists
      const [existing] = await db.execute(
        'SELECT id FROM students WHERE student_id = ? OR username = ? OR (email = ? AND email IS NOT NULL)',
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

      // Insert new student with active status (no admin approval needed)
      const [result] = await db.execute(`
        INSERT INTO students (
          student_id, full_name, email, phone, class, year_group, 
          username, password, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `, [studentId, fullName, email, phone, className, yearGroup, username, hashedPassword]);

      res.status(201).json({
        success: true,
        message: 'Student registration successful. You can now login.',
        data: { id: result.insertId }
      });

    } catch (error) {
      console.error('Student registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  },

  // Existing functions (logout, checkAuth, changePassword) remain unchanged
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Could not log out'
        });
      }
      res.json({
        success: true,
        message: 'Logout successful'
      });
    });
  },

  checkAuth: (req, res) => {
    if (req.session.user) {
      res.json({
        success: true,
        authenticated: true,
        user: req.session.user
      });
    } else {
      res.json({
        success: true,
        authenticated: false
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.session.user.id;
      const userType = req.session.user.userType;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      const tableName = userType === 'admin' ? 'admins' : userType === 'staff' ? 'staff' : 'students';
      const [rows] = await db.execute(`SELECT password FROM ${tableName} WHERE id = ?`, [userId]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, rows[0].password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      await db.execute(
        `UPDATE ${tableName} SET password = ?, updated_at = NOW() WHERE id = ?`,
        [hashedNewPassword, userId]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = authController;