const express = require("express")
const staffController = require("../controllers/staffController")
const { requireAuth, requireRole } = require("../middleware/auth")

const router = express.Router()

// Apply authentication and staff/admin role requirement to all routes
router.use(requireAuth)
router.use(requireRole(["admin", "staff"]))

// Staff profile routes
router.get("/profile", staffController.getProfile)
router.put("/profile", staffController.updateProfile)

// Staff dashboard stats
router.get("/dashboard", staffController.getDashboardStats)

// Staff requests routes
router.get("/requests", staffController.getStaffRequests)
router.get("/requests/all", staffController.getAllStaffRequests)
router.post("/requests", staffController.createStaffRequest)
router.put("/requests/:id/status", staffController.updateStaffRequestStatus)
router.put("/requests/:id/cancel", staffController.cancelStaffRequest)

module.exports = router
