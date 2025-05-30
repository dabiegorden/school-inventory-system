const path = require("path")
const fs = require("fs").promises

// Utility functions for report generation
const reportHelpers = {
  // Ensure reports directory structure exists
  ensureReportsDirectory: async () => {
    const reportsDir = path.join(__dirname, "../reports")
    const currentYear = new Date().getFullYear()
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0")

    const yearDir = path.join(reportsDir, currentYear.toString())
    const monthDir = path.join(yearDir, currentMonth)

    await fs.mkdir(monthDir, { recursive: true })
    return monthDir
  },

  // Clean up old report files (older than 30 days)
  cleanupOldReports: async () => {
    try {
      const reportsDir = path.join(__dirname, "../reports")
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const cleanupDirectory = async (dirPath) => {
        try {
          const files = await fs.readdir(dirPath)

          for (const file of files) {
            const filePath = path.join(dirPath, file)
            const stats = await fs.stat(filePath)

            if (stats.isDirectory()) {
              await cleanupDirectory(filePath)
            } else if (stats.mtime < thirtyDaysAgo) {
              await fs.unlink(filePath)
              console.log(`Cleaned up old report file: ${filePath}`)
            }
          }
        } catch (error) {
          console.error("Error cleaning up directory:", dirPath, error)
        }
      }

      await cleanupDirectory(reportsDir)
    } catch (error) {
      console.error("Error during report cleanup:", error)
    }
  },

  // Format data for different report types
  formatReportData: (type, data) => {
    switch (type) {
      case "inventory":
        return data.map((item) => ({
          "Item Code": item.item_code,
          "Item Name": item.name,
          Category: item.category_name || "N/A",
          "Current Stock": item.quantity,
          "Minimum Stock": item.minimum_quantity,
          "Unit Price": `$${item.unit_price || 0}`,
          "Total Value": `$${item.total_value || 0}`,
          Status: item.stock_status,
          Location: item.location || "N/A",
        }))

      case "requests":
        return data.map((item) => ({
          "Request ID": item.id,
          "Student Name": item.student_name,
          "Student ID": item.student_id,
          Class: item.class,
          Item: item.item_name,
          Quantity: item.quantity,
          Purpose: item.purpose || "N/A",
          Urgency: item.urgency,
          Status: item.status,
          "Request Date": new Date(item.created_at).toLocaleDateString(),
          "Processed By": item.processed_by_name || "N/A",
        }))

      case "distributions":
        return data.map((item) => ({
          "Distribution ID": item.id,
          "Student Name": item.student_name,
          "Student ID": item.student_id,
          Item: item.item_name,
          Quantity: item.quantity,
          "Distributed By": item.distributed_by_name,
          "Distribution Date": new Date(item.created_at).toLocaleDateString(),
          Purpose: item.purpose || "N/A",
          Urgency: item.urgency || "N/A",
        }))

      default:
        return data
    }
  },

  // Generate report summary statistics
  generateSummaryStats: (type, data) => {
    if (!Array.isArray(data)) return {}

    switch (type) {
      case "inventory":
        return {
          "Total Items": data.length,
          "Low Stock Items": data.filter((item) => item.stock_status === "Low Stock").length,
          "Out of Stock Items": data.filter((item) => item.stock_status === "Out of Stock").length,
          "Total Inventory Value": `$${data.reduce((sum, item) => sum + (item.total_value || 0), 0).toFixed(2)}`,
        }

      case "requests":
        return {
          "Total Requests": data.length,
          "Pending Requests": data.filter((item) => item.status === "pending").length,
          "Approved Requests": data.filter((item) => item.status === "approved").length,
          "Rejected Requests": data.filter((item) => item.status === "rejected").length,
          "Distributed Requests": data.filter((item) => item.status === "distributed").length,
        }

      case "distributions":
        return {
          "Total Distributions": data.length,
          "Total Items Distributed": data.reduce((sum, item) => sum + item.quantity, 0),
          "Unique Students Served": new Set(data.map((item) => item.student_id)).size,
        }

      default:
        return { "Total Records": data.length }
    }
  },
}

module.exports = reportHelpers
