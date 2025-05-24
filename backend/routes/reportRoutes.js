const express = require('express');
const db = require('../config/database');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin/staff role requirement to all routes
router.use(requireAuth);
router.use(requireRole(['admin', 'staff']));

// Inventory report
router.get('/inventory', async (req, res) => {
  try {
    const { startDate, endDate, categoryId } = req.query;

    let query = `
      SELECT i.*, c.name as category_name,
             CASE 
               WHEN i.quantity <= i.minimum_quantity THEN 'Low Stock'
               WHEN i.quantity = 0 THEN 'Out of Stock'
               ELSE 'In Stock'
             END as stock_status
      FROM inventory_items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.status = 'active'
    `;
    const params = [];

    if (categoryId) {
      query += ' AND i.category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY i.name';

    const [rows] = await db.execute(query, params);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Inventory report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report'
    });
  }
});

// Requests report
router.get('/requests', async (req, res) => {
  try {
    const { startDate, endDate, status, studentId } = req.query;

    let query = `
      SELECT r.*, s.full_name as student_name, s.student_id, s.class,
             i.name as item_name, i.item_code,
             st.full_name as processed_by_name
      FROM requests r
      JOIN students s ON r.student_id = s.id
      JOIN inventory_items i ON r.item_id = i.id
      LEFT JOIN staff st ON r.processed_by = st.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND DATE(r.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(r.created_at) <= ?';
      params.push(endDate);
    }

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (studentId) {
      query += ' AND r.student_id = ?';
      params.push(studentId);
    }

    query += ' ORDER BY r.created_at DESC';

    const [rows] = await db.execute(query, params);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Requests report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate requests report'
    });
  }
});

// Distributions report
router.get('/distributions', async (req, res) => {
  try {
    const { startDate, endDate, studentId, itemId } = req.query;

    let query = `
      SELECT d.*, s.full_name as student_name, s.student_id, s.class,
             i.name as item_name, i.item_code,
             st.full_name as distributed_by_name,
             r.purpose, r.urgency
      FROM distributions d
      JOIN students s ON d.student_id = s.id
      JOIN inventory_items i ON d.item_id = i.id
      JOIN staff st ON d.distributed_by = st.id
      LEFT JOIN requests r ON d.request_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND DATE(d.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(d.created_at) <= ?';
      params.push(endDate);
    }

    if (studentId) {
      query += ' AND d.student_id = ?';
      params.push(studentId);
    }

    if (itemId) {
      query += ' AND d.item_id = ?';
      params.push(itemId);
    }

    query += ' ORDER BY d.created_at DESC';

    const [rows] = await db.execute(query, params);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Distributions report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate distributions report'
    });
  }
});

// Stock movements report
router.get('/stock-movements', async (req, res) => {
  try {
    const { startDate, endDate, itemId, movementType } = req.query;

    let query = `
      SELECT sm.*, i.name as item_name, i.item_code,
             s.full_name as created_by_name
      FROM stock_movements sm
      JOIN inventory_items i ON sm.item_id = i.id
      LEFT JOIN staff s ON sm.created_by = s.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ' AND DATE(sm.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND DATE(sm.created_at) <= ?';
      params.push(endDate);
    }

    if (itemId) {
      query += ' AND sm.item_id = ?';
      params.push(itemId);
    }

    if (movementType) {
      query += ' AND sm.movement_type = ?';
      params.push(movementType);
    }

    query += ' ORDER BY sm.created_at DESC';

    const [rows] = await db.execute(query, params);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Stock movements report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate stock movements report'
    });
  }
});

// Summary statistics
router.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Base date filter
    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE DATE(created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'WHERE DATE(created_at) >= ?';
      params.push(startDate);
    } else if (endDate) {
      dateFilter = 'WHERE DATE(created_at) <= ?';
      params.push(endDate);
    }

    // Get various statistics
    const [totalItems] = await db.execute('SELECT COUNT(*) as count FROM inventory_items WHERE status = "active"');
    const [lowStockItems] = await db.execute('SELECT COUNT(*) as count FROM inventory_items WHERE quantity <= minimum_quantity AND status = "active"');
    const [totalStudents] = await db.execute('SELECT COUNT(*) as count FROM students WHERE status = "active"');
    const [totalStaff] = await db.execute('SELECT COUNT(*) as count FROM staff WHERE status = "active"');

    // Requests statistics
    const requestQuery = `SELECT status, COUNT(*) as count FROM requests ${dateFilter} GROUP BY status`;
    const [requestStats] = await db.execute(requestQuery, params);

    // Distributions statistics
    const distributionQuery = `SELECT COUNT(*) as total_distributions, SUM(quantity) as total_quantity FROM distributions ${dateFilter}`;
    const [distributionStats] = await db.execute(distributionQuery, params);

    // Most requested items
    const mostRequestedQuery = `
      SELECT i.name, i.item_code, COUNT(r.id) as request_count, SUM(r.quantity) as total_quantity
      FROM requests r
      JOIN inventory_items i ON r.item_id = i.id
      ${dateFilter}
      GROUP BY r.item_id
      ORDER BY request_count DESC
      LIMIT 10
    `;
    const [mostRequested] = await db.execute(mostRequestedQuery, params);

    res.json({
      success: true,
      data: {
        inventory: {
          totalItems: totalItems[0].count,
          lowStockItems: lowStockItems[0].count
        },
        users: {
          totalStudents: totalStudents[0].count,
          totalStaff: totalStaff[0].count
        },
        requests: requestStats.reduce((acc, curr) => {
          acc[curr.status] = curr.count;
          return acc;
        }, {}),
        distributions: {
          totalDistributions: distributionStats[0].total_distributions || 0,
          totalQuantity: distributionStats[0].total_quantity || 0
        },
        mostRequestedItems: mostRequested
      }
    });

  } catch (error) {
    console.error('Summary report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate summary report'
    });
  }
});

module.exports = router;