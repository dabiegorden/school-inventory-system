const db = require("../config/database")

const staffController = {
  // Get staff profile
  getProfile: async (req, res) => {
    try {
      const staffId = req.session.user.id

      const [rows] = await db.execute(
        `
        SELECT id, staff_id, full_name, email, phone, department, position, status, created_at, last_login
        FROM staff 
        WHERE id = ?
      `,
        [staffId],
      )

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Staff profile not found",
        })
      }

      res.json({
        success: true,
        data: rows[0],
      })
    } catch (error) {
      console.error("Get staff profile error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch profile",
      })
    }
  },

  // Update staff profile
  updateProfile: async (req, res) => {
    try {
      const staffId = req.session.user.id
      const { fullName, email, phone } = req.body

      // Validation
      if (!fullName || !email) {
        return res.status(400).json({
          success: false,
          message: "Full name and email are required",
        })
      }

      // Check if email is already taken by another staff member
      const [existing] = await db.execute("SELECT id FROM staff WHERE email = ? AND id != ?", [email, staffId])

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email is already taken",
        })
      }

      // Update profile
      await db.execute(
        `
        UPDATE staff 
        SET full_name = ?, email = ?, phone = ?, updated_at = NOW()
        WHERE id = ?
      `,
        [fullName, email, phone, staffId],
      )

      // Update session data
      req.session.user.name = fullName
      req.session.user.email = email

      res.json({
        success: true,
        message: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Update staff profile error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
      })
    }
  },

  // Get staff dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      // Get pending requests count
      const [pendingRequests] = await db.execute('SELECT COUNT(*) as count FROM requests WHERE status = "pending"')

      // Get approved requests waiting for distribution
      const [approvedRequests] = await db.execute('SELECT COUNT(*) as count FROM requests WHERE status = "approved"')

      // Get low stock items
      const [lowStockItems] = await db.execute(
        'SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= minimum_quantity AND status = "active"',
      )

      // Get today's distributions by this staff
      const [todayDistributions] = await db.execute(
        `
        SELECT COUNT(*) as count FROM distributions 
        WHERE distributed_by = ? AND DATE(created_at) = CURDATE()
      `,
        [req.session.user.id],
      )

      // Get staff requests count
      const [staffRequestsCount] = await db.execute("SELECT COUNT(*) as count FROM staff_requests WHERE staff_id = ?", [
        req.session.user.id,
      ])

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
      `)

      res.json({
        success: true,
        data: {
          stats: {
            pendingRequests: pendingRequests[0].count,
            approvedRequests: approvedRequests[0].count,
            lowStockItems: lowStockItems[0].count,
            todayDistributions: todayDistributions[0].count,
            staffRequests: staffRequestsCount[0].count,
          },
          recentRequests,
        },
      })
    } catch (error) {
      console.error("Staff dashboard stats error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics",
      })
    }
  },

  // Get all staff requests (for staff viewing their own requests)
  getStaffRequests: async (req, res) => {
    try {
      const staffId = req.session.user.id
      const { status, search } = req.query

      let query = `
        SELECT sr.*, 
               i.name as item_name, i.item_code, i.quantity as available_quantity,
               s.full_name as staff_name,
               ps.full_name as processed_by_name
        FROM staff_requests sr
        JOIN inventory_items i ON sr.item_id = i.id
        JOIN staff s ON sr.staff_id = s.id
        LEFT JOIN staff ps ON sr.processed_by = ps.id
        WHERE sr.staff_id = ?
      `

      const params = [staffId]

      // Add status filter
      if (status && status !== "all") {
        query += " AND sr.status = ?"
        params.push(status)
      }

      // Add search filter
      if (search) {
        query += " AND (i.name LIKE ? OR i.item_code LIKE ? OR sr.purpose LIKE ?)"
        const searchTerm = `%${search}%`
        params.push(searchTerm, searchTerm, searchTerm)
      }

      query += " ORDER BY sr.created_at DESC"

      const [rows] = await db.execute(query, params)

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Get staff requests error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch staff requests",
      })
    }
  },

  // Get all staff requests (for admin/staff to view all staff requests)
  getAllStaffRequests: async (req, res) => {
    try {
      const { status, search } = req.query

      let query = `
        SELECT sr.*, 
               i.name as item_name, i.item_code, i.quantity as available_quantity,
               s.full_name as staff_name, s.staff_id as staff_employee_id,
               ps.full_name as processed_by_name
        FROM staff_requests sr
        JOIN inventory_items i ON sr.item_id = i.id
        JOIN staff s ON sr.staff_id = s.id
        LEFT JOIN staff ps ON sr.processed_by = ps.id
        WHERE 1=1
      `

      const params = []

      // Add status filter
      if (status && status !== "all") {
        query += " AND sr.status = ?"
        params.push(status)
      }

      // Add search filter
      if (search) {
        query += " AND (i.name LIKE ? OR i.item_code LIKE ? OR sr.purpose LIKE ? OR s.full_name LIKE ?)"
        const searchTerm = `%${search}%`
        params.push(searchTerm, searchTerm, searchTerm, searchTerm)
      }

      query += " ORDER BY sr.created_at DESC"

      const [rows] = await db.execute(query, params)

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Get all staff requests error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch staff requests",
      })
    }
  },

  // Create staff request
  createStaffRequest: async (req, res) => {
    try {
      const staffId = req.session.user.id
      const { itemId, quantity, purpose, urgency, notes } = req.body

      // Validation
      if (!itemId || !quantity || !purpose) {
        return res.status(400).json({
          success: false,
          message: "Item, quantity, and purpose are required",
        })
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0",
        })
      }

      // Check if item exists and is active
      const [items] = await db.execute(
        'SELECT id, name, quantity FROM inventory_items WHERE id = ? AND status = "active"',
        [itemId],
      )

      if (items.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found or inactive",
        })
      }

      // Insert request
      const [result] = await db.execute(
        `
        INSERT INTO staff_requests 
        (staff_id, item_id, quantity, purpose, urgency, notes, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
      `,
        [staffId, itemId, quantity, purpose, urgency || "medium", notes || null],
      )

      res.status(201).json({
        success: true,
        message: "Request created successfully",
        data: { id: result.insertId },
      })
    } catch (error) {
      console.error("Create staff request error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to create request",
      })
    }
  },

  // Update staff request status (for processing by admin/staff)
  updateStaffRequestStatus: async (req, res) => {
    try {
      const { id } = req.params
      const { status, remarks, approvedQuantity } = req.body
      const processedBy = req.session.user.id

      // Validation
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        })
      }

      const validStatuses = ["approved", "rejected", "distributed", "cancelled"]
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        })
      }

      // Check if request exists
      const [requests] = await db.execute("SELECT * FROM staff_requests WHERE id = ?", [id])
      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        })
      }

      const request = requests[0]

      // Check if request can be updated
      if (request.status === "distributed" || request.status === "cancelled") {
        return res.status(400).json({
          success: false,
          message: "Cannot update a distributed or cancelled request",
        })
      }

      // Prepare update data
      let updateQuery = `
        UPDATE staff_requests 
        SET status = ?, processed_by = ?, processed_at = NOW(), updated_at = NOW()
      `
      const updateParams = [status, processedBy]

      // Add approved quantity if provided
      if (status === "approved" && approvedQuantity !== undefined) {
        updateQuery += ", approved_quantity = ?"
        updateParams.push(approvedQuantity)
      }

      // Add remarks if provided
      if (remarks) {
        updateQuery += ", remarks = ?"
        updateParams.push(remarks)
      }

      updateQuery += " WHERE id = ?"
      updateParams.push(id)

      // Update the request
      await db.execute(updateQuery, updateParams)

      // If distributing, update inventory
      if (status === "distributed") {
        const quantityToDistribute = approvedQuantity || request.quantity

        // Check if enough stock is available
        const [items] = await db.execute("SELECT quantity FROM inventory_items WHERE id = ?", [request.item_id])
        if (items.length === 0 || items[0].quantity < quantityToDistribute) {
          return res.status(400).json({
            success: false,
            message: "Insufficient stock available",
          })
        }

        // Update inventory
        await db.execute("UPDATE inventory_items SET quantity = quantity - ?, updated_at = NOW() WHERE id = ?", [
          quantityToDistribute,
          request.item_id,
        ])

        // Create stock movement record
        await db.execute(
          `
          INSERT INTO stock_movements 
          (item_id, movement_type, quantity, reason, reference_type, reference_id, created_by, created_at)
          VALUES (?, 'out', ?, ?, 'staff_request', ?, ?, NOW())
        `,
          [
            request.item_id,
            quantityToDistribute,
            `Staff request distribution - ${remarks || "No remarks"}`,
            id,
            processedBy,
          ],
        )
      }

      res.json({
        success: true,
        message: "Request updated successfully",
      })
    } catch (error) {
      console.error("Update staff request status error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update request",
      })
    }
  },

  // Cancel staff request (by the requesting staff)
  cancelStaffRequest: async (req, res) => {
    try {
      const { id } = req.params
      const staffId = req.session.user.id

      // Check if request exists and belongs to the staff
      const [requests] = await db.execute("SELECT * FROM staff_requests WHERE id = ? AND staff_id = ?", [id, staffId])
      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        })
      }

      const request = requests[0]

      // Check if request can be cancelled
      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending requests can be cancelled",
        })
      }

      // Update request status
      await db.execute("UPDATE staff_requests SET status = 'cancelled', updated_at = NOW() WHERE id = ?", [id])

      res.json({
        success: true,
        message: "Request cancelled successfully",
      })
    } catch (error) {
      console.error("Cancel staff request error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to cancel request",
      })
    }
  },
}

module.exports = staffController
