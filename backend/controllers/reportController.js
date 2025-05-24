const { formatCurrency } = require('../utils/helpers');

const reportController = {
  // Inventory summary report
  async getInventorySummary(req, res) {
    try {
      const { startDate, endDate, categoryId } = req.query;

      let whereClause = 'WHERE i.is_active = TRUE';
      let params = [];

      if (categoryId) {
        whereClause += ' AND i.category_id = ?';
        params.push(categoryId);
      }

      // Get inventory summary
      const [summary] = await req.db.execute(
        `SELECT 
          COUNT(i.id) as total_items,
          SUM(i.quantity_in_stock) as total_stock,
          SUM(i.quantity_in_stock * i.unit_price) as total_value,
          COUNT(CASE WHEN i.quantity_in_stock <= i.minimum_stock_level THEN 1 END) as low_stock_items,
          COUNT(CASE WHEN i.quantity_in_stock = 0 THEN 1 END) as out_of_stock_items
        FROM items i
        ${whereClause}`,
        params
      );

      // Get category breakdown
      const [categoryBreakdown] = await req.db.execute(
        `SELECT 
          c.name as category_name,
          COUNT(i.id) as item_count,
          SUM(i.quantity_in_stock) as total_stock,
          SUM(i.quantity_in_stock * i.unit_price) as total_value
        FROM categories c
        LEFT JOIN items i ON c.id = i.category_id AND i.is_active = TRUE
        WHERE c.is_active = TRUE
        GROUP BY c.id, c.name
        ORDER BY total_value DESC`
      );

      // Get top items by value
      const [topItems] = await req.db.execute(
        `SELECT 
          i.name,
          i.quantity_in_stock,
          i.unit_price,
          (i.quantity_in_stock * i.unit_price) as total_value,
          c.name as category_name
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE i.is_active = TRUE
        ORDER BY total_value DESC
        LIMIT 10`
      );

      res.json({
        success: true,
        data: {
          summary: summary[0],
          categoryBreakdown,
          topItems
        }
      });

    } catch (error) {
      console.error('Get inventory summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Stock movement report
  async getStockMovementReport(req, res) {
    try {
      const { startDate, endDate, itemId, movementType } = req.query;

      let whereClause = 'WHERE 1=1';
      let params = [];

      if (startDate) {
        whereClause += ' AND DATE(sm.created_at) >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND DATE(sm.created_at) <= ?';
        params.push(endDate);
      }

      if (itemId) {
        whereClause += ' AND sm.item_id = ?';
        params.push(itemId);
      }

      if (movementType) {
        whereClause += ' AND sm.movement_type = ?';
        params.push(movementType);
      }

      // Get movements summary
      const [summary] = await req.db.execute(
        `SELECT 
          sm.movement_type,
          COUNT(*) as movement_count,
          SUM(sm.quantity) as total_quantity,
          SUM(sm.total_value) as total_value
        FROM stock_movements sm
        ${whereClause}
        GROUP BY sm.movement_type`,
        params
      );

      // Get detailed movements
      const [movements] = await req.db.execute(
        `SELECT 
          sm.*,
          i.name as item_name,
          i.sku,
          u.first_name,
          u.last_name,
          u.username
        FROM stock_movements sm
        LEFT JOIN items i ON sm.item_id = i.id
        LEFT JOIN users u ON sm.created_by = u.id
        ${whereClause}
        ORDER BY sm.created_at DESC
        LIMIT 100`,
        params
      );

      res.json({
        success: true,
        data: {
          summary,
          movements
        }
      });

    } catch (error) {
      console.error('Get stock movement report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Request analysis report
  async getRequestAnalysis(req, res) {
    try {
      const { startDate, endDate, status, requestedBy } = req.query;

      let whereClause = 'WHERE 1=1';
      let params = [];

      if (startDate) {
        whereClause += ' AND DATE(r.created_at) >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND DATE(r.created_at) <= ?';
        params.push(endDate);
      }

      if (status) {
        whereClause += ' AND r.status = ?';
        params.push(status);
      }

      if (requestedBy) {
        whereClause += ' AND r.requested_by = ?';
        params.push(requestedBy);
      }

      // Get request summary
      const [summary] = await req.db.execute(
        `SELECT 
          COUNT(*) as total_requests,
          COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_requests,
          COUNT(CASE WHEN r.status = 'approved' THEN 1 END) as approved_requests,
          COUNT(CASE WHEN r.status = 'rejected' THEN 1 END) as rejected_requests,
          COUNT(CASE WHEN r.status = 'fulfilled' THEN 1 END) as fulfilled_requests,
          COUNT(CASE WHEN r.status = 'cancelled' THEN 1 END) as cancelled_requests,
          AVG(DATEDIFF(r.approval_date, r.created_at)) as avg_approval_time_days,
          AVG(DATEDIFF(r.fulfillment_date, r.approval_date)) as avg_fulfillment_time_days
        FROM requests r
        ${whereClause}`,
        params
      );

      // Get requests by user role
      const [roleBreakdown] = await req.db.execute(
        `SELECT 
          u.role,
          COUNT(r.id) as request_count,
          COUNT(CASE WHEN r.status = 'fulfilled' THEN 1 END) as fulfilled_count
        FROM requests r
        LEFT JOIN users u ON r.requested_by = u.id
        ${whereClause}
        GROUP BY u.role`,
        params
      );

      // Get most requested items
      const [topRequestedItems] = await req.db.execute(
        `SELECT 
          i.name as item_name,
          SUM(ri.quantity_requested) as total_requested,
          SUM(ri.quantity_fulfilled) as total_fulfilled,
          COUNT(DISTINCT r.id) as request_count
        FROM requests r
        LEFT JOIN request_items ri ON r.id = ri.request_id
        LEFT JOIN items i ON ri.item_id = i.id
        ${whereClause}
        GROUP BY i.id, i.name
        ORDER BY total_requested DESC
        LIMIT 10`,
        params
      );

      res.json({
        success: true,
        data: {
          summary: summary[0],
          roleBreakdown,
          topRequestedItems
        }
      });

    } catch (error) {
      console.error('Get request analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Distribution report
  async getDistributionReport(req, res) {
    try {
      const { startDate, endDate, distributedTo, distributedBy } = req.query;

      let whereClause = 'WHERE 1=1';
      let params = [];

      if (startDate) {
        whereClause += ' AND DATE(d.created_at) >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND DATE(d.created_at) <= ?';
        params.push(endDate);
      }

      if (distributedTo) {
        whereClause += ' AND d.distributed_to = ?';
        params.push(distributedTo);
      }

      if (distributedBy) {
        whereClause += ' AND d.distributed_by = ?';
        params.push(distributedBy);
      }

      // Get distribution summary
      const [summary] = await req.db.execute(
        `SELECT 
          COUNT(*) as total_distributions,
          SUM(d.total_value) as total_value,
          AVG(d.total_value) as avg_distribution_value,
          COUNT(DISTINCT d.distributed_to) as unique_recipients
        FROM distributions d
        ${whereClause}`,
        params
      );

      // Get distributions by recipient role
      const [roleBreakdown] = await req.db.execute(
        `SELECT 
          u.role,
          COUNT(d.id) as distribution_count,
          SUM(d.total_value) as total_value
        FROM distributions d
        LEFT JOIN users u ON d.distributed_to = u.id
        ${whereClause}
        GROUP BY u.role`,
        params
      );

      // Get top distributed items
      const [topDistributedItems] = await req.db.execute(
        `SELECT 
          i.name as item_name,
          SUM(di.quantity) as total_distributed,
          SUM(di.total_price) as total_value,
          COUNT(DISTINCT d.id) as distribution_count
        FROM distributions d
        LEFT JOIN distribution_items di ON d.id = di.distribution_id
        LEFT JOIN items i ON di.item_id = i.id
        ${whereClause}
        GROUP BY i.id, i.name
        ORDER BY total_distributed DESC
        LIMIT 10`,
        params
      );

      res.json({
        success: true,
        data: {
          summary: summary[0],
          roleBreakdown,
          topDistributedItems
        }
      });

    } catch (error) {
      console.error('Get distribution report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Low stock alert report
  async getLowStockReport(req, res) {
    try {
      const { categoryId } = req.query;

      let whereClause = 'WHERE i.is_active = TRUE AND i.quantity_in_stock <= i.minimum_stock_level';
      let params = [];

      if (categoryId) {
        whereClause += ' AND i.category_id = ?';
        params.push(categoryId);
      }

      const [lowStockItems] = await req.db.execute(
        `SELECT 
          i.*,
          c.name as category_name,
          (i.minimum_stock_level - i.quantity_in_stock) as shortage_quantity,
          ((i.minimum_stock_level - i.quantity_in_stock) * i.unit_price) as shortage_value,
          CASE 
            WHEN i.quantity_in_stock = 0 THEN 'Out of Stock'
            WHEN i.quantity_in_stock <= (i.minimum_stock_level * 0.5) THEN 'Critical'
            ELSE 'Low'
          END as alert_level
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.id
        ${whereClause}
        ORDER BY 
          CASE 
            WHEN i.quantity_in_stock = 0 THEN 1
            WHEN i.quantity_in_stock <= (i.minimum_stock_level * 0.5) THEN 2
            ELSE 3
          END,
          (i.quantity_in_stock / NULLIF(i.minimum_stock_level, 0)) ASC`,
        params
      );

      // Get summary by alert level
      const [alertSummary] = await req.db.execute(
        `SELECT 
          CASE 
            WHEN i.quantity_in_stock = 0 THEN 'Out of Stock'
            WHEN i.quantity_in_stock <= (i.minimum_stock_level * 0.5) THEN 'Critical'
            ELSE 'Low'
          END as alert_level,
          COUNT(*) as item_count,
          SUM((i.minimum_stock_level - i.quantity_in_stock) * i.unit_price) as total_shortage_value
        FROM items i
        ${whereClause}
        GROUP BY 
          CASE 
            WHEN i.quantity_in_stock = 0 THEN 'Out of Stock'
            WHEN i.quantity_in_stock <= (i.minimum_stock_level * 0.5) THEN 'Critical'
            ELSE 'Low'
          END`,
        params
      );

      res.json({
        success: true,
        data: {
          lowStockItems,
          alertSummary
        }
      });

    } catch (error) {
      console.error('Get low stock report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // User activity report
  async getUserActivityReport(req, res) {
    try {
      const { startDate, endDate, userId, action } = req.query;

      let whereClause = 'WHERE 1=1';
      let params = [];

      if (startDate) {
        whereClause += ' AND DATE(al.created_at) >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND DATE(al.created_at) <= ?';
        params.push(endDate);
      }

      if (userId) {
        whereClause += ' AND al.user_id = ?';
        params.push(userId);
      }

      if (action) {
        whereClause += ' AND al.action = ?';
        params.push(action);
      }

      // Get activity summary
      const [summary] = await req.db.execute(
        `SELECT 
          COUNT(*) as total_activities,
          COUNT(DISTINCT al.user_id) as active_users,
          COUNT(DISTINCT DATE(al.created_at)) as active_days
        FROM audit_logs al
        ${whereClause}`,
        params
      );

      // Get activity by action type
      const [actionBreakdown] = await req.db.execute(
        `SELECT 
          al.action,
          COUNT(*) as activity_count
        FROM audit_logs al
        ${whereClause}
        GROUP BY al.action
        ORDER BY activity_count DESC`,
        params
      );

      // Get most active users
      const [activeUsers] = await req.db.execute(
        `SELECT 
          u.first_name,
          u.last_name,
          u.username,
          u.role,
          COUNT(al.id) as activity_count
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ${whereClause}
        GROUP BY al.user_id
        ORDER BY activity_count DESC
        LIMIT 10`,
        params
      );

      res.json({
        success: true,
        data: {
          summary: summary[0],
          actionBreakdown,
          activeUsers
        }
      });

    } catch (error) {
      console.error('Get user activity report error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = reportController;