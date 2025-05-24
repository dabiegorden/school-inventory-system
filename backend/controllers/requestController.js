const db = require('../config/database');

const requestController = {
  // Get all requests (for admin/staff)
  getAllRequests: async (req, res) => {
    try {
      const { status, studentId, itemId } = req.query;
      let query = `
        SELECT r.*, s.full_name as student_name, s.student_id, s.class, s.year_group,
               i.name as item_name, i.item_code, i.quantity as available_quantity,
               st.full_name as processed_by_name
        FROM requests r
        JOIN students s ON r.student_id = s.id
        JOIN inventory_items i ON r.item_id = i.id
        LEFT JOIN staff st ON r.processed_by = st.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ' AND r.status = ?';
        params.push(status);
      }

      if (studentId) {
        query += ' AND r.student_id = ?';
        params.push(studentId);
      }

      if (itemId) {
        query += ' AND r.item_id = ?';
        params.push(itemId);
      }

      query += ' ORDER BY r.created_at DESC';

      const [rows] = await db.execute(query, params);

      res.json({
        success: true,
        data: rows
      });

    } catch (error) {
      console.error('Get all requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch requests'
      });
    }
  },

  // Get student's own requests
  getStudentRequests: async (req, res) => {
    try {
      const studentId = req.session.user.id;
      const { status } = req.query;

      let query = `
        SELECT r.*, i.name as item_name, i.item_code, i.quantity as available_quantity,
               st.full_name as processed_by_name
        FROM requests r
        JOIN inventory_items i ON r.item_id = i.id
        LEFT JOIN staff st ON r.processed_by = st.id
        WHERE r.student_id = ?
      `;
      const params = [studentId];

      if (status) {
        query += ' AND r.status = ?';
        params.push(status);
      }

      query += ' ORDER BY r.created_at DESC';

      const [rows] = await db.execute(query, params);

      res.json({
        success: true,
        data: rows
      });

    } catch (error) {
      console.error('Get student requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your requests'
      });
    }
  },

  // Create new request (student only)
  createRequest: async (req, res) => {
    try {
      const { itemId, quantity, purpose, urgency } = req.body;
      const studentId = req.session.user.id;

      // Validation
      if (!itemId || !quantity || !purpose) {
        return res.status(400).json({
          success: false,
          message: 'Item, quantity, and purpose are required'
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      // Check if item exists and is active
      const [items] = await db.execute(
        'SELECT * FROM inventory_items WHERE id = ? AND status = "active"',
        [itemId]
      );

      if (items.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Item not found or inactive'
        });
      }

      const item = items[0];

      // Check if requested quantity is available
      if (quantity > item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}`
        });
      }

      // Check if student has pending request for the same item
      const [existingRequests] = await db.execute(
        'SELECT id FROM requests WHERE student_id = ? AND item_id = ? AND status = "pending"',
        [studentId, itemId]
      );

      if (existingRequests.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'You already have a pending request for this item'
        });
      }

      // Create request
      const [result] = await db.execute(`
        INSERT INTO requests (student_id, item_id, quantity, purpose, urgency, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'pending', NOW())
      `, [studentId, itemId, quantity, purpose, urgency || 'normal']);

      res.status(201).json({
        success: true,
        message: 'Request submitted successfully',
        data: { id: result.insertId }
      });

    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create request'
      });
    }
  },

  // Update request status (admin/staff only)
  updateRequestStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, remarks, approvedQuantity } = req.body;
      const processedBy = req.session.user.id;

      // Validation
      if (!status || !['approved', 'rejected', 'distributed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status is required (approved, rejected, distributed)'
        });
      }

      // Get request details
      const [requests] = await db.execute(`
        SELECT r.*, i.quantity as available_quantity, i.name as item_name
        FROM requests r
        JOIN inventory_items i ON r.item_id = i.id
        WHERE r.id = ?
      `, [id]);

      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }

      const request = requests[0];

      if (request.status !== 'pending' && status !== 'distributed') {
        return res.status(400).json({
          success: false,
          message: 'Only pending requests can be approved or rejected'
        });
      }

      let finalQuantity = request.quantity;

      // If approving, check stock availability
      if (status === 'approved') {
        if (approvedQuantity) {
          if (approvedQuantity > request.quantity) {
            return res.status(400).json({
              success: false,
              message: 'Approved quantity cannot exceed requested quantity'
            });
          }
          finalQuantity = approvedQuantity;
        }

        if (finalQuantity > request.available_quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock. Available: ${request.available_quantity}, Requested: ${finalQuantity}`
          });
        }
      }

      // Update request
      await db.execute(`
        UPDATE requests 
        SET status = ?, remarks = ?, approved_quantity = ?, processed_by = ?, processed_at = NOW(), updated_at = NOW()
        WHERE id = ?
      `, [status, remarks, status === 'approved' ? finalQuantity : null, processedBy, id]);

      // If distributed, create distribution record and update stock
      if (status === 'distributed') {
        const distributedQuantity = request.approved_quantity || request.quantity;

        // Create distribution record
        await db.execute(`
          INSERT INTO distributions (request_id, student_id, item_id, quantity, distributed_by, created_at)
          VALUES (?, ?, ?, ?, ?, NOW())
        `, [id, request.student_id, request.item_id, distributedQuantity, processedBy]);

        // Update inventory stock
        await db.execute(
          'UPDATE inventory_items SET quantity = quantity - ?, updated_at = NOW() WHERE id = ?',
          [distributedQuantity, request.item_id]
        );

        // Log stock movement
        await db.execute(`
          INSERT INTO stock_movements (item_id, movement_type, quantity, previous_quantity, new_quantity, reason, created_by, created_at)
          VALUES (?, 'subtract', ?, ?, ?, ?, ?, NOW())
        `, [
          request.item_id,
          distributedQuantity,
          request.available_quantity,
          request.available_quantity - distributedQuantity,
          `Distribution to student (Request #${id})`,
          processedBy
        ]);
      }

      res.json({
        success: true,
        message: `Request ${status} successfully`
      });

    } catch (error) {
      console.error('Update request status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update request status'
      });
    }
  },

  // Cancel request (student only)
  cancelRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const studentId = req.session.user.id;

      // Check if request exists and belongs to student
      const [requests] = await db.execute(
        'SELECT * FROM requests WHERE id = ? AND student_id = ?',
        [id, studentId]
      );

      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }

      const request = requests[0];

      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Only pending requests can be cancelled'
        });
      }

      // Update request status to cancelled
      await db.execute(
        'UPDATE requests SET status = "cancelled", updated_at = NOW() WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Request cancelled successfully'
      });

    } catch (error) {
      console.error('Cancel request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel request'
      });
    }
  },

  // Get request details
  getRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const userType = req.session.user.userType;
      const userId = req.session.user.id;

      let query = `
        SELECT r.*, s.full_name as student_name, s.student_id, s.class, s.year_group,
               i.name as item_name, i.item_code, i.quantity as available_quantity,
               st.full_name as processed_by_name
        FROM requests r
        JOIN students s ON r.student_id = s.id
        JOIN inventory_items i ON r.item_id = i.id
        LEFT JOIN staff st ON r.processed_by = st.id
        WHERE r.id = ?
      `;
      const params = [id];

      // If student, only allow viewing own requests
      if (userType === 'student') {
        query += ' AND r.student_id = ?';
        params.push(userId);
      }

      const [rows] = await db.execute(query, params);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });

    } catch (error) {
      console.error('Get request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch request details'
      });
    }
  }
};

module.exports = requestController;