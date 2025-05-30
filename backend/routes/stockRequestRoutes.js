const express = require("express")
const stockRequestController = require("../controllers/stockRequestController")
const { requireAuth, requireRole } = require("../middleware/auth")

const router = express.Router()

// Apply authentication to all routes
router.use(requireAuth)

// Routes for admin and staff
router.get("/", requireRole(["admin", "staff"]), stockRequestController.getAllStockRequests)
router.post("/", requireRole(["admin", "staff"]), stockRequestController.createStockRequest)
router.get("/stats", requireRole(["admin", "staff"]), stockRequestController.getStockRequestStats)
router.get("/:id", requireRole(["admin", "staff"]), stockRequestController.getStockRequest)
router.put("/:id", requireRole(["admin", "staff"]), stockRequestController.updateStockRequest)
router.put("/:id/status", requireRole(["admin"]), stockRequestController.updateStockRequestStatus)
router.delete("/:id", requireRole(["admin", "staff"]), stockRequestController.deleteStockRequest)

module.exports = router
