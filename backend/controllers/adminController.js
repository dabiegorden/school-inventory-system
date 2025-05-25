const bcrypt = require("bcryptjs")
const db = require("../config/database")

const adminController = {
  // Dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      // Get total counts
      const [staffCount] = await db.execute('SELECT COUNT(*) as count FROM staff WHERE status = "active"')
      const [studentCount] = await db.execute('SELECT COUNT(*) as count FROM students WHERE status = "active"')
      const [itemCount] = await db.execute('SELECT COUNT(*) as count FROM inventory_items WHERE status = "active"')
      const [pendingRequests] = await db.execute('SELECT COUNT(*) as count FROM requests WHERE status = "pending"')

      // Get low stock items
      const [lowStockItems] = await db.execute(
        'SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= minimum_quantity AND status = "active"',
      )

      // Get recent activities
      const [recentActivities] = await db.execute(`
        SELECT 'request' as type, r.id, r.created_at, s.full_name as user_name, 'Item request submitted' as activity
        FROM requests r 
        JOIN students s ON r.student_id = s.id 
        WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        UNION ALL
        SELECT 'distribution' as type, d.id, d.created_at, st.full_name as user_name, 'Item distributed' as activity
        FROM distributions d 
        JOIN staff st ON d.distributed_by = st.id 
        WHERE d.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY created_at DESC 
        LIMIT 10
      `)

      res.json({
        success: true,
        data: {
          stats: {
            totalStaff: staffCount[0].count,
            totalStudents: studentCount[0].count,
            totalItems: itemCount[0].count,
            pendingRequests: pendingRequests[0].count,
            lowStockItems: lowStockItems[0].count,
          },
          recentActivities,
        },
      })
    } catch (error) {
      console.error("Dashboard stats error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics",
      })
    }
  },

  // Staff Management
  getAllStaff: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT id, staff_id, full_name, email, phone, department, position, status, created_at, last_login
        FROM staff 
        ORDER BY created_at DESC
      `)

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Get all staff error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch staff members",
      })
    }
  },

  createStaff: async (req, res) => {
    try {
      const { staffId, fullName, email, phone, department, position, username, password } = req.body

      // Validation
      if (!staffId || !fullName || !email || !username || !password) {
        return res.status(400).json({
          success: false,
          message: "Staff ID, full name, email, username, and password are required",
        })
      }

      // Check if staff ID or username already exists
      const [existing] = await db.execute("SELECT id FROM staff WHERE staff_id = ? OR username = ? OR email = ?", [
        staffId,
        username,
        email,
      ])

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Staff ID, username, or email already exists",
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Insert new staff
      const [result] = await db.execute(
        `
        INSERT INTO staff (staff_id, full_name, email, phone, department, position, username, password, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `,
        [staffId, fullName, email, phone, department, position, username, hashedPassword],
      )

      res.status(201).json({
        success: true,
        message: "Staff member created successfully",
        data: { id: result.insertId },
      })
    } catch (error) {
      console.error("Create staff error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to create staff member",
      })
    }
  },

  updateStaff: async (req, res) => {
    try {
      const { id } = req.params
      const { fullName, email, phone, department, position, status } = req.body

      // Check if staff exists
      const [existing] = await db.execute("SELECT id FROM staff WHERE id = ?", [id])
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Staff member not found",
        })
      }

      // Update staff
      await db.execute(
        `
        UPDATE staff 
        SET full_name = ?, email = ?, phone = ?, department = ?, position = ?, status = ?, updated_at = NOW()
        WHERE id = ?
      `,
        [fullName, email, phone, department, position, status, id],
      )

      res.json({
        success: true,
        message: "Staff member updated successfully",
      })
    } catch (error) {
      console.error("Update staff error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update staff member",
      })
    }
  },

  deleteStaff: async (req, res) => {
    try {
      const { id } = req.params

      // Check if staff exists
      const [existing] = await db.execute("SELECT id FROM staff WHERE id = ?", [id])
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Staff member not found",
        })
      }

      // Soft delete (update status to inactive)
      await db.execute('UPDATE staff SET status = "inactive", updated_at = NOW() WHERE id = ?', [id])

      res.json({
        success: true,
        message: "Staff member deleted successfully",
      })
    } catch (error) {
      console.error("Delete staff error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to delete staff member",
      })
    }
  },

  // Student Management
  getAllStudents: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT id, student_id, full_name, email, phone, class, year_group, status, created_at, last_login
        FROM students 
        ORDER BY created_at DESC
      `)

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Get all students error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch students",
      })
    }
  },

  createStudent: async (req, res) => {
    try {
      const { studentId, fullName, email, phone, className, yearGroup, username, password } = req.body

      // Validation
      if (!studentId || !fullName || !username || !password) {
        return res.status(400).json({
          success: false,
          message: "Student ID, full name, username, and password are required",
        })
      }

      // Check if student ID or username already exists
      const [existing] = await db.execute("SELECT id FROM students WHERE student_id = ? OR username = ? OR email = ?", [
        studentId,
        username,
        email,
      ])

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Student ID, username, or email already exists",
        })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Insert new student
      const [result] = await db.execute(
        `
        INSERT INTO students (student_id, full_name, email, phone, class, year_group, username, password, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `,
        [studentId, fullName, email, phone, className, yearGroup, username, hashedPassword],
      )

      res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: { id: result.insertId },
      })
    } catch (error) {
      console.error("Create student error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to create student",
      })
    }
  },

  updateStudent: async (req, res) => {
    try {
      const { id } = req.params
      const { fullName, email, phone, className, yearGroup, status } = req.body

      // Check if student exists
      const [existing] = await db.execute("SELECT id FROM students WHERE id = ?", [id])
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        })
      }

      // Update student
      await db.execute(
        `
        UPDATE students 
        SET full_name = ?, email = ?, phone = ?, class = ?, year_group = ?, status = ?, updated_at = NOW()
        WHERE id = ?
      `,
        [fullName, email, phone, className, yearGroup, status, id],
      )

      res.json({
        success: true,
        message: "Student updated successfully",
      })
    } catch (error) {
      console.error("Update student error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update student",
      })
    }
  },

  deleteStudent: async (req, res) => {
    try {
      const { id } = req.params

      // Check if student exists
      const [existing] = await db.execute("SELECT id FROM students WHERE id = ?", [id])
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        })
      }

      // Soft delete (update status to inactive)
      await db.execute('UPDATE students SET status = "inactive", updated_at = NOW() WHERE id = ?', [id])

      res.json({
        success: true,
        message: "Student deleted successfully",
      })
    } catch (error) {
      console.error("Delete student error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to delete student",
      })
    }
  },

  // Reports Management
  getAllReports: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT id, name, type, description, date_from, date_to, format, status, created_at, generated_by
        FROM reports 
        ORDER BY created_at DESC
      `)

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Get all reports error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch reports",
      })
    }
  },

  createReport: async (req, res) => {
    try {
      const { name, type, description, dateFrom, dateTo, format } = req.body
      const createdBy = req.session.user.id

      // Validation
      if (!name || !type || !dateFrom || !dateTo) {
        return res.status(400).json({
          success: false,
          message: "Name, type, and date range are required",
        })
      }

      // Insert new report
      const [result] = await db.execute(
        `
        INSERT INTO reports (name, type, description, date_from, date_to, format, status, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, NOW())
      `,
        [name, type, description, dateFrom, dateTo, format || "pdf", createdBy],
      )

      res.status(201).json({
        success: true,
        message: "Report created successfully",
        data: { id: result.insertId },
      })
    } catch (error) {
      console.error("Create report error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to create report",
      })
    }
  },

  updateReport: async (req, res) => {
    try {
      const { id } = req.params
      const { name, type, description, dateFrom, dateTo, format } = req.body

      // Check if report exists
      const [existing] = await db.execute("SELECT id FROM reports WHERE id = ?", [id])
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        })
      }

      // Update report
      await db.execute(
        `
        UPDATE reports 
        SET name = ?, type = ?, description = ?, date_from = ?, date_to = ?, format = ?, updated_at = NOW()
        WHERE id = ?
      `,
        [name, type, description, dateFrom, dateTo, format, id],
      )

      res.json({
        success: true,
        message: "Report updated successfully",
      })
    } catch (error) {
      console.error("Update report error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update report",
      })
    }
  },

  deleteReport: async (req, res) => {
    try {
      const { id } = req.params

      // Check if report exists
      const [existing] = await db.execute("SELECT id FROM reports WHERE id = ?", [id])
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        })
      }

      // Delete report
      await db.execute("DELETE FROM reports WHERE id = ?", [id])

      res.json({
        success: true,
        message: "Report deleted successfully",
      })
    } catch (error) {
      console.error("Delete report error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to delete report",
      })
    }
  },

  generateReport: async (req, res) => {
    try {
      const { id } = req.params

      // Get report details
      const [reports] = await db.execute("SELECT * FROM reports WHERE id = ?", [id])
      if (reports.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        })
      }

      const report = reports[0]

      // Update status to pending
      await db.execute('UPDATE reports SET status = "pending", updated_at = NOW() WHERE id = ?', [id])

      // Generate report based on type
      let reportData = {}

      switch (report.type) {
        case "inventory":
          const [inventoryData] = await db.execute(
            `
            SELECT i.*, c.name as category_name,
                   CASE 
                     WHEN i.quantity <= i.minimum_quantity THEN 'Low Stock'
                     WHEN i.quantity = 0 THEN 'Out of Stock'
                     ELSE 'In Stock'
                   END as stock_status
            FROM inventory_items i
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE i.status = 'active' AND DATE(i.created_at) BETWEEN ? AND ?
            ORDER BY i.name
          `,
            [report.date_from, report.date_to],
          )
          reportData = inventoryData
          break

        case "users":
          const [studentsData] = await db.execute(
            `
            SELECT 'student' as user_type, student_id as user_id, full_name, email, class, year_group, status, created_at
            FROM students WHERE DATE(created_at) BETWEEN ? AND ?
            UNION ALL
            SELECT 'staff' as user_type, staff_id as user_id, full_name, email, department, position, status, created_at
            FROM staff WHERE DATE(created_at) BETWEEN ? AND ?
            ORDER BY created_at DESC
          `,
            [report.date_from, report.date_to, report.date_from, report.date_to],
          )
          reportData = studentsData
          break

        case "requests":
          const [requestsData] = await db.execute(
            `
            SELECT r.*, s.full_name as student_name, s.student_id, s.class,
                   i.name as item_name, i.item_code,
                   st.full_name as processed_by_name
            FROM requests r
            JOIN students s ON r.student_id = s.id
            JOIN inventory_items i ON r.item_id = i.id
            LEFT JOIN staff st ON r.processed_by = st.id
            WHERE DATE(r.created_at) BETWEEN ? AND ?
            ORDER BY r.created_at DESC
          `,
            [report.date_from, report.date_to],
          )
          reportData = requestsData
          break

        case "distributions":
          const [distributionsData] = await db.execute(
            `
            SELECT d.*, s.full_name as student_name, s.student_id, s.class,
                   i.name as item_name, i.item_code,
                   st.full_name as distributed_by_name,
                   r.purpose, r.urgency
            FROM distributions d
            JOIN students s ON d.student_id = s.id
            JOIN inventory_items i ON d.item_id = i.id
            JOIN staff st ON d.distributed_by = st.id
            LEFT JOIN requests r ON d.request_id = r.id
            WHERE DATE(d.created_at) BETWEEN ? AND ?
            ORDER BY d.created_at DESC
          `,
            [report.date_from, report.date_to],
          )
          reportData = distributionsData
          break

        case "stock-movements":
          const [stockData] = await db.execute(
            `
            SELECT sm.*, i.name as item_name, i.item_code,
                   s.full_name as created_by_name
            FROM stock_movements sm
            JOIN inventory_items i ON sm.item_id = i.id
            LEFT JOIN staff s ON sm.created_by = s.id
            WHERE DATE(sm.created_at) BETWEEN ? AND ?
            ORDER BY sm.created_at DESC
          `,
            [report.date_from, report.date_to],
          )
          reportData = stockData
          break

        case "summary":
          // Get summary statistics
          const [summaryStats] = await db.execute(
            `
            SELECT 
              (SELECT COUNT(*) FROM students WHERE status = 'active') as total_students,
              (SELECT COUNT(*) FROM staff WHERE status = 'active') as total_staff,
              (SELECT COUNT(*) FROM inventory_items WHERE status = 'active') as total_items,
              (SELECT COUNT(*) FROM inventory_items WHERE quantity <= minimum_quantity AND status = 'active') as low_stock_items,
              (SELECT COUNT(*) FROM requests WHERE DATE(created_at) BETWEEN ? AND ?) as total_requests,
              (SELECT COUNT(*) FROM requests WHERE status = 'pending' AND DATE(created_at) BETWEEN ? AND ?) as pending_requests
          `,
            [report.date_from, report.date_to, report.date_from, report.date_to],
          )
          reportData = summaryStats[0]
          break

        default:
          reportData = { message: "Report type not supported" }
      }

      // Store report data (you might want to save this to a file or database)
      const reportContent = JSON.stringify(reportData)

      // Update status to completed
      await db.execute(
        `
        UPDATE reports 
        SET status = "completed", report_data = ?, generated_at = NOW(), updated_at = NOW()
        WHERE id = ?
      `,
        [reportContent, id],
      )

      res.json({
        success: true,
        message: "Report generated successfully",
        data: { reportData },
      })
    } catch (error) {
      console.error("Generate report error:", error)

      // Update status to failed
      await db.execute('UPDATE reports SET status = "failed", updated_at = NOW() WHERE id = ?', [req.params.id])

      res.status(500).json({
        success: false,
        message: "Failed to generate report",
      })
    }
  },

  downloadReport: async (req, res) => {
    try {
      const { id } = req.params
      const { format } = req.query

      // Get report details
      const [reports] = await db.execute("SELECT * FROM reports WHERE id = ?", [id])
      if (reports.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        })
      }

      const report = reports[0]

      if (report.status !== "completed") {
        return res.status(400).json({
          success: false,
          message: "Report is not ready for download",
        })
      }

      const reportData = JSON.parse(report.report_data || "{}")

      if (format === "pdf" || report.format === "pdf") {
        // Generate PDF
        const PDFDocument = require("pdfkit")
        const doc = new PDFDocument()

        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", `attachment; filename="report-${id}.pdf"`)

        doc.pipe(res)

        // Add content to PDF
        doc.fontSize(20).text(report.name, 50, 50)
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80)
        doc.fontSize(12).text(`Date Range: ${report.date_from} to ${report.date_to}`, 50, 100)
        doc.fontSize(12).text(`Type: ${report.type}`, 50, 120)

        if (report.description) {
          doc.fontSize(12).text(`Description: ${report.description}`, 50, 140)
        }

        doc.moveDown(2)

        // Add report data
        if (Array.isArray(reportData)) {
          doc.fontSize(14).text("Report Data:", 50, doc.y)
          doc.moveDown()

          reportData.forEach((item, index) => {
            if (doc.y > 700) {
              doc.addPage()
            }
            doc.fontSize(10).text(`${index + 1}. ${JSON.stringify(item)}`, 50, doc.y)
            doc.moveDown(0.5)
          })
        } else {
          doc.fontSize(14).text("Summary:", 50, doc.y)
          doc.moveDown()
          doc.fontSize(10).text(JSON.stringify(reportData, null, 2), 50, doc.y)
        }

        doc.end()
      } else if (format === "csv" || report.format === "csv") {
        // Generate CSV
        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", `attachment; filename="report-${id}.csv"`)

        if (Array.isArray(reportData) && reportData.length > 0) {
          const headers = Object.keys(reportData[0]).join(",")
          const rows = reportData.map((item) => Object.values(item).join(",")).join("\n")
          res.send(`${headers}\n${rows}`)
        } else {
          res.send("No data available")
        }
      } else {
        // Default to JSON
        res.setHeader("Content-Type", "application/json")
        res.setHeader("Content-Disposition", `attachment; filename="report-${id}.json"`)
        res.json(reportData)
      }
    } catch (error) {
      console.error("Download report error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to download report",
      })
    }
  },
}

module.exports = adminController
