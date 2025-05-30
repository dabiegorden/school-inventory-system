const express = require("express")
const reportController = require("../controllers/reportController")
const { requireAuth, requireRole } = require("../middleware/auth")
const db = require("../config/database")

const router = express.Router()

// Apply authentication and admin/staff role requirement to all routes
router.use(requireAuth)
router.use(requireRole(["admin", "staff"]))

// Report CRUD operations
router.get("/", reportController.getAllReports)
router.post("/", reportController.createReport)
router.get("/:id", reportController.getReport)
router.put("/:id", reportController.updateReport)
router.delete("/:id", reportController.deleteReport)

// Report generation and download
router.post("/:id/generate", reportController.generateReport)
router.get("/:id/download", reportController.downloadReport)

// Quick reports (existing functionality)
router.get("/quick/inventory", async (req, res) => {
  try {
    const { category, status, search } = req.query
    let query = `
      SELECT i.*, c.name as category_name,
             CASE 
               WHEN i.quantity <= i.minimum_quantity AND i.quantity > 0 THEN 'Low Stock'
               WHEN i.quantity = 0 THEN 'Out of Stock'
               ELSE 'In Stock'
             END as stock_status,
             (i.quantity * COALESCE(i.unit_price, 0)) as total_value
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.status = 'active'
    `
    const params = []

    if (category) {
      query += " AND i.category_id = ?"
      params.push(category)
    }

    if (search) {
      query += " AND (i.name LIKE ? OR i.description LIKE ? OR i.item_code LIKE ?)"
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    query += " ORDER BY i.name"

    const [rows] = await db.execute(query, params)

    res.json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Quick inventory report error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate inventory report",
    })
  }
})

module.exports = router
