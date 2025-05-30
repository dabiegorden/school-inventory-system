const db = require("../config/database")

const inventoryController = {
  // Get all inventory items
  getAllItems: async (req, res) => {
    try {
      const { category, status, search } = req.query
      let query = `
        SELECT i.*, c.name as category_name, s.full_name as created_by_name
        FROM inventory_items i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN staff s ON i.created_by = s.id
        WHERE 1=1
      `
      const params = []

      if (category) {
        query += " AND i.category_id = ?"
        params.push(category)
      }

      if (status) {
        query += " AND i.status = ?"
        params.push(status)
      } else {
        // Default to active items only if status not specified
        query += ' AND i.status = "active"'
      }

      if (search) {
        query += " AND (i.name LIKE ? OR i.description LIKE ? OR i.item_code LIKE ?)"
        params.push(`%${search}%`, `%${search}%`, `%${search}%`)
      }

      query += " ORDER BY i.created_at DESC"

      const [rows] = await db.execute(query, params)

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Get all items error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch inventory items",
      })
    }
  },

  // Get single inventory item
  getItem: async (req, res) => {
    try {
      const { id } = req.params

      const [rows] = await db.execute(
        `
        SELECT i.*, c.name as category_name, s.full_name as created_by_name
        FROM inventory_items i
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN staff s ON i.created_by = s.id
        WHERE i.id = ?
      `,
        [id],
      )

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        })
      }

      res.json({
        success: true,
        data: rows[0],
      })
    } catch (error) {
      console.error("Get item error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch item",
      })
    }
  },

  // Create new inventory item
  createItem: async (req, res) => {
    try {
      const { itemCode, name, description, categoryId, quantity, minimumQuantity, unitPrice, location, supplier } =
        req.body

      const createdBy = req.session.user.id

      // Validation
      if (!itemCode || !name || !categoryId || quantity === undefined || minimumQuantity === undefined) {
        return res.status(400).json({
          success: false,
          message: "Item code, name, category, quantity, and minimum quantity are required",
        })
      }

      // Check if item code already exists
      const [existing] = await db.execute("SELECT id FROM inventory_items WHERE item_code = ?", [itemCode])
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Item code already exists",
        })
      }

      // Insert new item
      const [result] = await db.execute(
        `
        INSERT INTO inventory_items (
          item_code, name, description, category_id, quantity, minimum_quantity, 
          unit_price, location, supplier, created_by, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
      `,
        [itemCode, name, description, categoryId, quantity, minimumQuantity, unitPrice, location, supplier, createdBy],
      )

      res.status(201).json({
        success: true,
        message: "Item created successfully",
        data: { id: result.insertId },
      })
    } catch (error) {
      console.error("Create item error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to create item",
      })
    }
  },

  // Update inventory item
  updateItem: async (req, res) => {
    try {
      const { id } = req.params
      const { name, description, categoryId, quantity, minimumQuantity, unitPrice, location, supplier, status } =
        req.body

      // Check if item exists
      const [existing] = await db.execute("SELECT id FROM inventory_items WHERE id = ?", [id])
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        })
      }

      // Update item
      await db.execute(
        `
        UPDATE inventory_items 
        SET name = ?, description = ?, category_id = ?, quantity = ?, minimum_quantity = ?, 
            unit_price = ?, location = ?, supplier = ?, status = ?, updated_at = NOW()
        WHERE id = ?
      `,
        [name, description, categoryId, quantity, minimumQuantity, unitPrice, location, supplier, status, id],
      )

      res.json({
        success: true,
        message: "Item updated successfully",
      })
    } catch (error) {
      console.error("Update item error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update item",
      })
    }
  },

  // Delete inventory item
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params

      // Check if item exists
      const [existing] = await db.execute("SELECT id FROM inventory_items WHERE id = ?", [id])
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        })
      }

      // Soft delete (update status to inactive)
      await db.execute('UPDATE inventory_items SET status = "inactive", updated_at = NOW() WHERE id = ?', [id])

      res.json({
        success: true,
        message: "Item deleted successfully",
      })
    } catch (error) {
      console.error("Delete item error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to delete item",
      })
    }
  },

  // Get categories
  getCategories: async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM categories WHERE status = "active" ORDER BY name')

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Get categories error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch categories",
      })
    }
  },

  // Create category
  createCategory: async (req, res) => {
    try {
      const { name, description } = req.body

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        })
      }

      // Check if category already exists
      const [existing] = await db.execute("SELECT id FROM categories WHERE name = ?", [name])
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Category already exists",
        })
      }

      // Insert new category
      const [result] = await db.execute(
        `
        INSERT INTO categories (name, description, status, created_at)
        VALUES (?, ?, 'active', NOW())
      `,
        [name, description],
      )

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: { id: result.insertId },
      })
    } catch (error) {
      console.error("Create category error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to create category",
      })
    }
  },

  // Update stock quantity
  updateStock: async (req, res) => {
    try {
      const { id } = req.params
      const { quantity, operation, reason } = req.body // operation: 'add' or 'subtract'

      if (!quantity || !operation || !reason) {
        return res.status(400).json({
          success: false,
          message: "Quantity, operation, and reason are required",
        })
      }

      // Get current item
      const [items] = await db.execute("SELECT * FROM inventory_items WHERE id = ?", [id])
      if (items.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        })
      }

      const item = items[0]
      let newQuantity

      if (operation === "add") {
        newQuantity = item.quantity + Number.parseInt(quantity)
      } else if (operation === "subtract") {
        newQuantity = item.quantity - Number.parseInt(quantity)
        if (newQuantity < 0) {
          return res.status(400).json({
            success: false,
            message: "Insufficient stock quantity",
          })
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid operation. Use "add" or "subtract"',
        })
      }

      // Update stock
      await db.execute("UPDATE inventory_items SET quantity = ?, updated_at = NOW() WHERE id = ?", [newQuantity, id])

      // Log stock movement
      await db.execute(
        `
        INSERT INTO stock_movements (item_id, movement_type, quantity, previous_quantity, new_quantity, reason, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
        [id, operation, quantity, item.quantity, newQuantity, reason, req.session.user.id],
      )

      res.json({
        success: true,
        message: "Stock updated successfully",
        data: {
          previousQuantity: item.quantity,
          newQuantity: newQuantity,
        },
      })
    } catch (error) {
      console.error("Update stock error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update stock",
      })
    }
  },

  // Get stock movements
  getStockMovements: async (req, res) => {
    try {
      const { itemId } = req.query
      let query = `
        SELECT sm.*, i.name as item_name, i.item_code, s.full_name as created_by_name
        FROM stock_movements sm
        JOIN inventory_items i ON sm.item_id = i.id
        LEFT JOIN staff s ON sm.created_by = s.id
        WHERE 1=1
      `
      const params = []

      if (itemId) {
        query += " AND sm.item_id = ?"
        params.push(itemId)
      }

      query += " ORDER BY sm.created_at DESC LIMIT 100"

      const [rows] = await db.execute(query, params)

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Get stock movements error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch stock movements",
      })
    }
  },

  // Get low stock items
  getLowStockItems: async (req, res) => {
    try {
      const [rows] = await db.execute(`
        SELECT i.*, c.name as category_name
        FROM inventory_items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.quantity <= i.minimum_quantity AND i.status = 'active'
        ORDER BY (i.quantity - i.minimum_quantity) ASC
      `)

      res.json({
        success: true,
        data: rows,
      })
    } catch (error) {
      console.error("Get low stock items error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch low stock items",
      })
    }
  },
}

module.exports = inventoryController
