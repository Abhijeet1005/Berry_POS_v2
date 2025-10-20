const express = require('express');
const router = express.Router();
const auditController = require('./auditController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { tenantMiddleware } = require('../../middleware/tenantMiddleware');
const { rbacMiddleware } = require('../../middleware/rbacMiddleware');

// Apply auth and tenant middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// All audit routes require admin or manager role
router.use(rbacMiddleware(['admin', 'manager']));

// Get audit logs
router.get('/logs', auditController.getAuditLogs);

// Get audit statistics
router.get('/statistics', auditController.getAuditStatistics);

// Export audit logs
router.get('/export', auditController.exportAuditLogs);

module.exports = router;
