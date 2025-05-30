const db = require("../config/database")
const ExcelJS = require("exceljs")
const PDFDocument = require("pdfkit")
const path = require("path")
const fs = require("fs")

const reportController = {
  // Get all reports with enhanced data
  getAllReports: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT r.*, s.full_name as created_by_name
        FROM reports r
        LEFT JOIN staff s ON r.created_by = s.id
        ORDER BY r.created_at DESC
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

  // Get single report
  getReport: async (req, res) => {
    try {
      const { id } = req.params

      const [rows] = await db.execute(
        `
        SELECT r.*, s.full_name as created_by_name
        FROM reports r
        LEFT JOIN staff s ON r.created_by = s.id
        WHERE r.id = ?
      `,
        [id],
      )

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        })
      }

      res.json({
        success: true,
        data: rows[0],
      })
    } catch (error) {
      console.error("Get report error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch report",
      })
    }
  },

  // Create new report
  createReport: async (req, res) => {
    try {
      const { name, type, description, dateFrom, dateTo, format } = req.body
      const createdBy = req.session.user.id

      if (!name || !type || !dateFrom || !dateTo) {
        return res.status(400).json({
          success: false,
          message: "Name, type, and date range are required",
        })
      }

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

  // Update report
  updateReport: async (req, res) => {
    try {
      const { id } = req.params
      const { name, type, description, dateFrom, dateTo, format } = req.body

      const [existing] = await db.execute("SELECT id FROM reports WHERE id = ?", [id])
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        })
      }

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

  // Delete report
  deleteReport: async (req, res) => {
    try {
      const { id } = req.params

      const [existing] = await db.execute("SELECT id FROM reports WHERE id = ?", [id])
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        })
      }

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

  // Generate comprehensive report
  generateReport: async (req, res) => {
    try {
      const { id } = req.params

      const [reports] = await db.execute("SELECT * FROM reports WHERE id = ?", [id])
      if (reports.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        })
      }

      const report = reports[0]
      await db.execute('UPDATE reports SET status = "pending", updated_at = NOW() WHERE id = ?', [id])

      let reportData = {}
      let summary = {}

      try {
        switch (report.type) {
          case "inventory":
            const [inventoryData] = await db.execute(
              `
              SELECT i.*, c.name as category_name,
                     CASE 
                       WHEN i.quantity <= i.minimum_quantity AND i.quantity > 0 THEN 'Low Stock'
                       WHEN i.quantity = 0 THEN 'Out of Stock'
                       ELSE 'In Stock'
                     END as stock_status,
                     (i.quantity * COALESCE(i.unit_price, 0)) as total_value
              FROM inventory_items i
              LEFT JOIN categories c ON i.category_id = c.id
              WHERE i.status = 'active' AND DATE(i.created_at) BETWEEN ? AND ?
              ORDER BY i.name
            `,
              [report.date_from, report.date_to],
            )

            summary = {
              totalItems: inventoryData.length,
              totalValue: inventoryData.reduce((sum, item) => sum + (item.total_value || 0), 0),
              lowStockItems: inventoryData.filter((item) => item.stock_status === "Low Stock").length,
              outOfStockItems: inventoryData.filter((item) => item.stock_status === "Out of Stock").length,
            }
            reportData = { items: inventoryData, summary }
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

            summary = {
              totalRequests: requestsData.length,
              pendingRequests: requestsData.filter((r) => r.status === "pending").length,
              approvedRequests: requestsData.filter((r) => r.status === "approved").length,
              rejectedRequests: requestsData.filter((r) => r.status === "rejected").length,
              distributedRequests: requestsData.filter((r) => r.status === "distributed").length,
            }
            reportData = { requests: requestsData, summary }
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

            summary = {
              totalDistributions: distributionsData.length,
              totalItemsDistributed: distributionsData.reduce((sum, d) => sum + d.quantity, 0),
              uniqueStudents: new Set(distributionsData.map((d) => d.student_id)).size,
            }
            reportData = { distributions: distributionsData, summary }
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

            summary = {
              totalMovements: stockData.length,
              stockIn: stockData.filter((s) => s.movement_type === "add").reduce((sum, s) => sum + s.quantity, 0),
              stockOut: stockData.filter((s) => s.movement_type === "subtract").reduce((sum, s) => sum + s.quantity, 0),
            }
            reportData = { movements: stockData, summary }
            break

          case "users":
            const [usersData] = await db.execute(
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

            summary = {
              totalUsers: usersData.length,
              students: usersData.filter((u) => u.user_type === "student").length,
              staff: usersData.filter((u) => u.user_type === "staff").length,
              activeUsers: usersData.filter((u) => u.status === "active").length,
            }
            reportData = { users: usersData, summary }
            break

          case "summary":
            const [summaryStats] = await db.execute(
              `
              SELECT 
                (SELECT COUNT(*) FROM students WHERE status = 'active') as total_students,
                (SELECT COUNT(*) FROM staff WHERE status = 'active') as total_staff,
                (SELECT COUNT(*) FROM inventory_items WHERE status = 'active') as total_items,
                (SELECT COUNT(*) FROM inventory_items WHERE quantity <= minimum_quantity AND status = 'active') as low_stock_items,
                (SELECT COUNT(*) FROM requests WHERE DATE(created_at) BETWEEN ? AND ?) as total_requests,
                (SELECT COUNT(*) FROM requests WHERE status = 'pending' AND DATE(created_at) BETWEEN ? AND ?) as pending_requests,
                (SELECT COUNT(*) FROM distributions WHERE DATE(created_at) BETWEEN ? AND ?) as total_distributions,
                (SELECT SUM(quantity) FROM distributions WHERE DATE(created_at) BETWEEN ? AND ?) as total_distributed_items
            `,
              [
                report.date_from,
                report.date_to,
                report.date_from,
                report.date_to,
                report.date_from,
                report.date_to,
                report.date_from,
                report.date_to,
              ],
            )

            reportData = { summary: summaryStats[0] }
            break

          default:
            throw new Error("Unsupported report type")
        }

        const reportContent = JSON.stringify(reportData)
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
      } catch (dataError) {
        await db.execute('UPDATE reports SET status = "failed", updated_at = NOW() WHERE id = ?', [id])
        throw dataError
      }
    } catch (error) {
      console.error("Generate report error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to generate report",
      })
    }
  },

  // Enhanced download with multiple formats
  downloadReport: async (req, res) => {
    try {
      const { id } = req.params
      const { format } = req.query

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
      const downloadFormat = format || report.format || "pdf"

      if (downloadFormat === "excel") {
        await generateExcelReport(res, report, reportData)
      } else if (downloadFormat === "csv") {
        await generateCSVReport(res, report, reportData)
      } else {
        await generatePDFReport(res, report, reportData)
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

// Enhanced PDF generation with professional design
const generatePDFReport = async (res, report, reportData) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" })

  res.setHeader("Content-Type", "application/pdf")
  res.setHeader("Content-Disposition", `attachment; filename="report-${report.id}.pdf"`)

  doc.pipe(res)

  // Colors
  const primaryColor = "#1f2937"
  const secondaryColor = "#6b7280"
  const accentColor = "#f59e0b"
  const successColor = "#10b981"
  const dangerColor = "#ef4444"

  // Header with logo area and title
  doc.rect(0, 0, doc.page.width, 120).fill("#f8fafc")

  // School/Company Logo Area (placeholder)
  doc.rect(50, 30, 60, 60).stroke("#e5e7eb")
  doc.fontSize(8).fillColor(secondaryColor).text("LOGO", 70, 55)

  // Main Title
  doc.fontSize(24).fillColor(primaryColor).text("School Inventory Management System", 130, 40)
  doc.fontSize(18).fillColor(accentColor).text(report.name, 130, 70)

  // Report metadata
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  doc.fontSize(10).fillColor(secondaryColor)
  doc.text(`Generated: ${currentDate}`, 130, 95)
  doc.text(
    `Period: ${new Date(report.date_from).toLocaleDateString()} - ${new Date(report.date_to).toLocaleDateString()}`,
    350,
    95,
  )

  // Move to content area
  doc.y = 150

  // Report description
  if (report.description) {
    doc.fontSize(12).fillColor(primaryColor).text("Description:", 50, doc.y)
    doc
      .fontSize(10)
      .fillColor(secondaryColor)
      .text(report.description, 50, doc.y + 15, { width: 500 })
    doc.y += 40
  }

  // Summary section with cards
  if (reportData.summary) {
    doc.fontSize(16).fillColor(primaryColor).text("Executive Summary", 50, doc.y)
    doc.y += 25

    const summaryEntries = Object.entries(reportData.summary)
    const cardsPerRow = 2
    const cardWidth = 240
    const cardHeight = 80
    const cardSpacing = 20

    summaryEntries.forEach((entry, index) => {
      const [key, value] = entry
      const row = Math.floor(index / cardsPerRow)
      const col = index % cardsPerRow
      const x = 50 + col * (cardWidth + cardSpacing)
      const y = doc.y + row * (cardHeight + cardSpacing)

      // Card background
      doc.rect(x, y, cardWidth, cardHeight).fill("#ffffff").stroke("#e5e7eb")

      // Card content
      const formattedKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
      doc
        .fontSize(10)
        .fillColor(secondaryColor)
        .text(formattedKey, x + 15, y + 15)

      // Format value based on type
      let formattedValue = value
      if (typeof value === "number") {
        if (key.includes("Value") || key.includes("Cost")) {
          formattedValue = `$${value.toLocaleString()}`
        } else {
          formattedValue = value.toLocaleString()
        }
      }

      doc
        .fontSize(20)
        .fillColor(primaryColor)
        .text(formattedValue, x + 15, y + 35)
    })

    doc.y += Math.ceil(summaryEntries.length / cardsPerRow) * (cardHeight + cardSpacing) + 30
  }

  // Data tables
  if (reportData.items && reportData.items.length > 0) {
    addTableSection(
      doc,
      "Inventory Items",
      reportData.items.slice(0, 15),
      [
        { key: "item_code", title: "Code", width: 80 },
        { key: "name", title: "Item Name", width: 150 },
        { key: "category_name", title: "Category", width: 100 },
        { key: "quantity", title: "Qty", width: 50 },
        { key: "stock_status", title: "Status", width: 80 },
        { key: "total_value", title: "Value", width: 80, format: "currency" },
      ],
      primaryColor,
      secondaryColor,
    )
  }

  if (reportData.requests && reportData.requests.length > 0) {
    addTableSection(
      doc,
      "Recent Requests",
      reportData.requests.slice(0, 15),
      [
        { key: "student_name", title: "Student", width: 120 },
        { key: "item_name", title: "Item", width: 120 },
        { key: "quantity", title: "Qty", width: 50 },
        { key: "status", title: "Status", width: 80 },
        { key: "created_at", title: "Date", width: 100, format: "date" },
      ],
      primaryColor,
      secondaryColor,
    )
  }

  if (reportData.distributions && reportData.distributions.length > 0) {
    addTableSection(
      doc,
      "Recent Distributions",
      reportData.distributions.slice(0, 15),
      [
        { key: "student_name", title: "Student", width: 120 },
        { key: "item_name", title: "Item", width: 120 },
        { key: "quantity", title: "Qty", width: 50 },
        { key: "distributed_by_name", title: "Distributed By", width: 120 },
        { key: "created_at", title: "Date", width: 100, format: "date" },
      ],
      primaryColor,
      secondaryColor,
    )
  }

  // Footer
  const pageCount = doc.bufferedPageRange().count
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i)

    // Footer line
    doc.rect(50, doc.page.height - 80, doc.page.width - 100, 1).fill("#e5e7eb")

    // Footer text
    doc.fontSize(8).fillColor(secondaryColor)
    doc.text("School Inventory Management System", 50, doc.page.height - 65)
    doc.text(`Page ${i + 1} of ${pageCount}`, doc.page.width - 100, doc.page.height - 65)
    doc.text(`Report ID: ${report.id}`, 50, doc.page.height - 50)
    doc.text(`Generated on ${currentDate}`, doc.page.width - 200, doc.page.height - 50)
  }

  doc.end()
}

// Helper function to add table sections
const addTableSection = (doc, title, data, columns, primaryColor, secondaryColor) => {
  if (doc.y > 650) doc.addPage()

  // Section title
  doc.fontSize(14).fillColor(primaryColor).text(title, 50, doc.y)
  doc.y += 25

  // Table header
  const tableTop = doc.y
  const rowHeight = 25
  let currentX = 50

  // Header background
  doc.rect(50, tableTop, 500, rowHeight).fill("#f8fafc").stroke("#e5e7eb")

  // Header text
  doc.fontSize(10).fillColor(primaryColor)
  columns.forEach((col) => {
    doc.text(col.title, currentX + 5, tableTop + 8, { width: col.width - 10 })
    currentX += col.width
  })

  doc.y = tableTop + rowHeight

  // Table rows
  data.forEach((row, index) => {
    if (doc.y > 700) {
      doc.addPage()
      doc.y = 50
    }

    const rowY = doc.y
    currentX = 50

    // Alternating row colors
    if (index % 2 === 0) {
      doc.rect(50, rowY, 500, rowHeight).fill("#ffffff").stroke("#f3f4f6")
    } else {
      doc.rect(50, rowY, 500, rowHeight).fill("#f9fafb").stroke("#f3f4f6")
    }

    // Row data
    doc.fontSize(9).fillColor(secondaryColor)
    columns.forEach((col) => {
      let value = row[col.key] || "N/A"

      if (col.format === "currency" && typeof value === "number") {
        value = `$${value.toFixed(2)}`
      } else if (col.format === "date" && value !== "N/A") {
        value = new Date(value).toLocaleDateString()
      }

      doc.text(String(value), currentX + 5, rowY + 8, {
        width: col.width - 10,
        ellipsis: true,
      })
      currentX += col.width
    })

    doc.y = rowY + rowHeight
  })

  doc.y += 20
}

// Helper function to generate Excel reports
const generateExcelReport = async (res, report, reportData) => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(report.name)

  // Add header
  worksheet.addRow([report.name])
  worksheet.addRow([`Generated: ${new Date().toLocaleDateString()}`])
  worksheet.addRow([`Period: ${report.date_from} to ${report.date_to}`])
  worksheet.addRow([])

  // Add summary if available
  if (reportData.summary) {
    worksheet.addRow(["SUMMARY"])
    Object.entries(reportData.summary).forEach(([key, value]) => {
      worksheet.addRow([key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()), value])
    })
    worksheet.addRow([])
  }

  // Add data based on report type
  if (reportData.items) {
    worksheet.addRow(["INVENTORY ITEMS"])
    worksheet.addRow([
      "Item Code",
      "Name",
      "Category",
      "Quantity",
      "Min Quantity",
      "Unit Price",
      "Total Value",
      "Status",
    ])
    reportData.items.forEach((item) => {
      worksheet.addRow([
        item.item_code,
        item.name,
        item.category_name,
        item.quantity,
        item.minimum_quantity,
        item.unit_price,
        item.total_value,
        item.stock_status,
      ])
    })
  }

  if (reportData.requests) {
    worksheet.addRow(["REQUESTS"])
    worksheet.addRow(["Student", "Student ID", "Item", "Quantity", "Status", "Date", "Purpose"])
    reportData.requests.forEach((req) => {
      worksheet.addRow([
        req.student_name,
        req.student_id,
        req.item_name,
        req.quantity,
        req.status,
        new Date(req.created_at).toLocaleDateString(),
        req.purpose,
      ])
    })
  }

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  res.setHeader("Content-Disposition", `attachment; filename="report-${report.id}.xlsx"`)

  await workbook.xlsx.write(res)
  res.end()
}

// Helper function to generate CSV reports
const generateCSVReport = async (res, report, reportData) => {
  let csvContent = `${report.name}\n`
  csvContent += `Generated: ${new Date().toLocaleDateString()}\n`
  csvContent += `Period: ${report.date_from} to ${report.date_to}\n\n`

  if (reportData.items) {
    csvContent += "Item Code,Name,Category,Quantity,Min Quantity,Unit Price,Total Value,Status\n"
    reportData.items.forEach((item) => {
      csvContent += `"${item.item_code}","${item.name}","${item.category_name}",${item.quantity},${item.minimum_quantity},${item.unit_price || 0},${item.total_value || 0},"${item.stock_status}"\n`
    })
  }

  res.setHeader("Content-Type", "text/csv")
  res.setHeader("Content-Disposition", `attachment; filename="report-${report.id}.csv"`)
  res.send(csvContent)
}

module.exports = reportController
