const express = require("express")
const studentController = require("../controllers/studentController")
const { requireAuth, requireRole } = require("../middleware/auth")

const router = express.Router()

// Apply authentication and student role requirement to all routes
router.use(requireAuth)
router.use(requireRole(["student"]))

// Student profile routes
router.get("/profile", studentController.getProfile)
router.put("/profile", studentController.updateProfile)

// Student dashboard routes
router.get("/dashboard/stats", studentController.getDashboardStats)

// Student inventory routes (available items for requesting)
router.get("/inventory", studentController.getAvailableItems)

// Student requests routes
router.get("/requests", async (req, res) => {
  try {
    const studentId = req.session.user.id
    const { status, search, limit } = req.query

    let query = `
      SELECT r.*, i.name as item_name, i.item_code, i.quantity as available_quantity,
             st.full_name as processed_by_name
      FROM requests r
      JOIN inventory_items i ON r.item_id = i.id
      LEFT JOIN staff st ON r.processed_by = st.id
      WHERE r.student_id = ?
    `
    const params = [studentId]

    if (status && status !== "all") {
      query += " AND r.status = ?"
      params.push(status)
    }

    if (search) {
      query += " AND (i.name LIKE ? OR i.item_code LIKE ? OR r.purpose LIKE ?)"
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }

    query += " ORDER BY r.created_at DESC"

    if (limit) {
      query += " LIMIT ?"
      params.push(Number.parseInt(limit))
    }

    const db = require("../config/database")
    const [rows] = await db.execute(query, params)

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Get student requests error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
    })
  }
})

router.post("/requests", async (req, res) => {
  try {
    const { itemId, quantity, purpose, notes } = req.body
    const studentId = req.session.user.id

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

    const db = require("../config/database")

    // Check if item exists and is active
    const [items] = await db.execute('SELECT * FROM inventory_items WHERE id = ? AND status = "active"', [itemId])

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found or inactive",
      })
    }

    const item = items[0]

    // Check if requested quantity is available
    if (quantity > item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${item.quantity}, Requested: ${quantity}`,
      })
    }

    // Check if student has pending request for the same item
    const [existingRequests] = await db.execute(
      'SELECT id FROM requests WHERE student_id = ? AND item_id = ? AND status = "pending"',
      [studentId, itemId],
    )

    if (existingRequests.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request for this item",
      })
    }

    // Create request
    const [result] = await db.execute(
      `
      INSERT INTO requests (student_id, item_id, quantity, purpose, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', NOW())
    `,
      [studentId, itemId, quantity, purpose, notes],
    )

    res.status(201).json({
      success: true,
      message: "Request submitted successfully",
      data: { id: result.insertId },
    })
  } catch (error) {
    console.error("Create student request error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create request",
    })
  }
})

router.get("/requests/:id", async (req, res) => {
  try {
    const { id } = req.params
    const studentId = req.session.user.id

    const db = require("../config/database")
    const [rows] = await db.execute(
      `
      SELECT r.*, i.name as item_name, i.item_code, i.quantity as available_quantity,
             st.full_name as processed_by_name
      FROM requests r
      JOIN inventory_items i ON r.item_id = i.id
      LEFT JOIN staff st ON r.processed_by = st.id
      WHERE r.id = ? AND r.student_id = ?
    `,
      [id, studentId],
    )

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      })
    }

    res.json({
      success: true,
      data: rows[0],
    })
  } catch (error) {
    console.error("Get student request error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch request details",
    })
  }
})

router.put("/requests/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params
    const studentId = req.session.user.id

    const db = require("../config/database")

    // Check if request exists and belongs to student
    const [requests] = await db.execute("SELECT * FROM requests WHERE id = ? AND student_id = ?", [id, studentId])

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      })
    }

    const request = requests[0]

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled",
      })
    }

    // Update request status to cancelled
    await db.execute('UPDATE requests SET status = "cancelled", updated_at = NOW() WHERE id = ?', [id])

    res.json({
      success: true,
      message: "Request cancelled successfully",
    })
  } catch (error) {
    console.error("Cancel student request error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cancel request",
    })
  }
})

module.exports = router
