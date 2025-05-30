const db = require("../config/database")

const stockRequestController = {
  // Get all stock requests
  getAllStockRequests: async (req, res) => {
    try {
      const { status, priority, requestedBy } = req.query

      let query = `
        SELECT sr.*, i.name as item_name, i.item_code, i.quantity as current_stock,
               i.minimum_quantity, s.full_name as requested_by_name, s.department,
               ap.full_name as approved_by_name
        FROM stock_requests sr
        JOIN inventory_items i ON sr.item_id = i.id
        JOIN staff s ON sr.requested_by = s.id
        LEFT JOIN staff ap ON sr.approved_by = ap.id
        WHERE 1=1
      `
      const params = []

      if (status) {
        query += " AND sr.status = ?"
        params.push(status)
      }

      if (priority) {
        query += " AND sr.priority = ?"
        params.push(priority)
      }

      if (requestedBy) {
        query += " AND sr.requested_by = ?"
        params.push(requestedBy)
      }

      query += " ORDER BY sr.created_at DESC"

      const [rows] = await db.execute(query, params)

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Get stock requests error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch stock requests",
      })
    }
  },

  // Create new stock request
  createStockRequest: async (req, res) => {
    try {
      const { itemId, quantity, priority, reason, supplierInfo, estimatedCost } = req.body
      const requestedBy = req.session.user.id

      if (!itemId || !quantity || !reason) {
        return res.status(400).json({
          success: false,
          message: "Item, quantity, and reason are required",
        })
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be greater than 0",
        })
      }

      // Check if item exists
      const [items] = await db.execute('SELECT * FROM inventory_items WHERE id = ? AND status = "active"', [itemId])
      if (items.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found or inactive",
        })
      }

      const [result] = await db.execute(
        `
        INSERT INTO stock_requests (
          item_id, quantity, priority, reason, supplier_info, estimated_cost,
          requested_by, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
      `,
        [itemId, quantity, priority || "medium", reason, supplierInfo, estimatedCost, requestedBy],
      )

      res.status(201).json({
        success: true,
        message: "Stock request created successfully",
        data: { id: result.insertId },
      })
    } catch (error) {
      console.error("Create stock request error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to create stock request",
      })
    }
  },

  // Update stock request
  updateStockRequest: async (req, res) => {
    try {
      const { id } = req.params
      const { quantity, priority, reason, supplierInfo, estimatedCost } = req.body

      const [existing] = await db.execute("SELECT * FROM stock_requests WHERE id = ?", [id])
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Stock request not found",
        })
      }

      if (existing[0].status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending requests can be updated",
        })
      }

      await db.execute(
        `
        UPDATE stock_requests 
        SET quantity = ?, priority = ?, reason = ?, supplier_info = ?, 
            estimated_cost = ?, updated_at = NOW()
        WHERE id = ?
      `,
        [quantity, priority, reason, supplierInfo, estimatedCost, id],
      )

      res.json({
        success: true,
        message: "Stock request updated successfully",
      })
    } catch (error) {
      console.error("Update stock request error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update stock request",
      })
    }
  },

  // Update stock request status
  updateStockRequestStatus: async (req, res) => {
    try {
      const { id } = req.params
      const { status, adminNotes, approvedQuantity, actualCost } = req.body
      const approvedBy = req.session.user.id

      if (!status || !["approved", "rejected", "ordered", "received"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Valid status is required (approved, rejected, ordered, received)",
        })
      }

      const [requests] = await db.execute(
        `
        SELECT sr.*, i.name as item_name
        FROM stock_requests sr
        JOIN inventory_items i ON sr.item_id = i.id
        WHERE sr.id = ?
      `,
        [id],
      )

      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Stock request not found",
        })
      }

      const request = requests[0]

      await db.execute(
        `
        UPDATE stock_requests 
        SET status = ?, admin_notes = ?, approved_quantity = ?, actual_cost = ?,
            approved_by = ?, processed_at = NOW(), updated_at = NOW()
        WHERE id = ?
      `,
        [status, adminNotes, approvedQuantity || request.quantity, actualCost, approvedBy, id],
      )

      // If received, update inventory stock
      if (status === "received") {
        const receivedQuantity = approvedQuantity || request.quantity

        // Get current stock
        const [currentStock] = await db.execute("SELECT quantity FROM inventory_items WHERE id = ?", [request.item_id])
        const previousQuantity = currentStock[0].quantity
        const newQuantity = previousQuantity + receivedQuantity

        // Update inventory stock
        await db.execute("UPDATE inventory_items SET quantity = ?, updated_at = NOW() WHERE id = ?", [
          newQuantity,
          request.item_id,
        ])

        // Log stock movement
        await db.execute(
          `
          INSERT INTO stock_movements (
            item_id, movement_type, quantity, previous_quantity, new_quantity, 
            reason, created_by, created_at
          ) VALUES (?, 'add', ?, ?, ?, ?, ?, NOW())
        `,
          [
            request.item_id,
            receivedQuantity,
            previousQuantity,
            newQuantity,
            `Stock replenishment (Request #${id})`,
            approvedBy,
          ],
        )
      }

      res.json({
        success: true,
        message: `Stock request ${status} successfully`,
      })
    } catch (error) {
      console.error("Update stock request status error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update stock request status",
      })
    }
  },

  // Get stock request details
  getStockRequest: async (req, res) => {
    try {
      const { id } = req.params

      const [rows] = await db.execute(
        `
        SELECT sr.*, i.name as item_name, i.item_code, i.quantity as current_stock,
               i.minimum_quantity, s.full_name as requested_by_name, s.department,
               ap.full_name as approved_by_name
        FROM stock_requests sr
        JOIN inventory_items i ON sr.item_id = i.id
        JOIN staff s ON sr.requested_by = s.id
        LEFT JOIN staff ap ON sr.approved_by = ap.id
        WHERE sr.id = ?
      `,
        [id],
      )

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Stock request not found",
        })
      }

      res.json({
        success: true,
        data: rows[0],
      })
    } catch (error) {
      console.error("Get stock request error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch stock request details",
      })
    }
  },

  // Delete stock request
  deleteStockRequest: async (req, res) => {
    try {
      const { id } = req.params

      const [requests] = await db.execute(
        'SELECT * FROM stock_requests WHERE id = ? AND status IN ("pending", "rejected")',
        [id],
      )
      if (requests.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Stock request not found or cannot be deleted",
        })
      }

      await db.execute("DELETE FROM stock_requests WHERE id = ?", [id])

      res.json({
        success: true,
        message: "Stock request deleted successfully",
      })
    } catch (error) {
      console.error("Delete stock request error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to delete stock request",
      })
    }
  },

  // Get stock request dashboard stats
  getStockRequestStats: async (req, res) => {
    try {
      const [stats] = await db.execute(`
        SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
          COUNT(CASE WHEN status = 'ordered' THEN 1 END) as ordered_requests,
          COUNT(CASE WHEN status = 'received' THEN 1 END) as received_requests,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
          SUM(CASE WHEN status = 'received' THEN actual_cost ELSE 0 END) as total_spent,
          SUM(CASE WHEN status IN ('approved', 'ordered') THEN estimated_cost ELSE 0 END) as pending_cost
        FROM stock_requests
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `)

      res.json({
        success: true,
        data: stats[0],
      })
    } catch (error) {
      console.error("Get stock request stats error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch stock request statistics",
      })
    }
  },
}

module.exports = stockRequestController
