const express = require("express")
const session = require("express-session")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/authRoutes")
const adminRoutes = require("./routes/adminRoutes")
const staffRoutes = require("./routes/staffRoutes")
const studentRoutes = require("./routes/studentRoutes")
const inventoryRoutes = require("./routes/inventoryRoutes")
const requestRoutes = require("./routes/requestRoutes")
const reportRoutes = require("./routes/reportRoutes")
const stockRequestRoutes = require("./routes/stockRequestRoutes")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/staff", staffRoutes)
app.use("/api/student", studentRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/requests", requestRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/stock-requests", stockRequestRoutes)

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = app
