const express = require('express');
const router = express.Router();
const auditController = require('./auditController');
const { authenticate } = require('../../middleware/authMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(injectTenantContext);

// All audit routes require admin or manager role
router.use(requirePermission('admin.access'));

// Get audit logs
router.get('/logs', auditController.getAuditLogs);

// Get audit statistics
router.get('/statistics', auditController.getAuditStatistics);

// Export audit logs
router.get('/export', auditController.exportAuditLogs);

module.exports = router;
