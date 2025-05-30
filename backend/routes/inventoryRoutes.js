const express = require("express")
const inventoryController = require("../controllers/inventoryController")
const { requireAuth, requireRole } = require("../middleware/auth")

const router = express.Router()

// Apply authentication to all routes
router.use(requireAuth)

// Routes accessible by all authenticated users
router.get("/items", inventoryController.getAllItems)
router.get("/items/:id", inventoryController.getItem)
router.get("/categories", inventoryController.getCategories)
router.get("/low-stock", inventoryController.getLowStockItems)
router.get("/stock-movements", inventoryController.getStockMovements)

// Route for students to get available items
router.get("/available", inventoryController.getAllItems)

// Routes for admin and staff only
router.post("/items", requireRole(["admin", "staff"]), inventoryController.createItem)
router.put("/items/:id", requireRole(["admin", "staff"]), inventoryController.updateItem)
router.delete("/items/:id", requireRole(["admin", "staff"]), inventoryController.deleteItem)
router.post("/categories", requireRole(["admin", "staff"]), inventoryController.createCategory)
router.put("/items/:id/stock", requireRole(["admin", "staff"]), inventoryController.updateStock)

module.exports = router
