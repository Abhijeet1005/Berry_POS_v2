const express = require('express');
const router = express.Router();
const tableController = require('./tableController');
const { validate, validateObjectId } = require('../../middleware/validationMiddleware');
const { authenticate } = require('../../middleware/authMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const {
  createTableSchema,
  updateTableSchema,
  updateTableStatusSchema,
  transferOrderSchema,
  mergeTablesSchema
} = require('./tableValidation');

// All routes require authentication and tenant context
router.use(authenticate);
router.use(injectTenantContext);

/**
 * @route   POST /api/v1/tables
 * @desc    Create a new table
 * @access  Private (Manager+)
 */
router.post(
  '/',
  requirePermission('tables.create'),
  validate(createTableSchema),
  tableController.createTable
);

/**
 * @route   GET /api/v1/tables
 * @desc    Get all tables with filters
 * @access  Private
 */
router.get(
  '/',
  requirePermission('tables.read'),
  tableController.getTables
);

/**
 * @route   POST /api/v1/tables/transfer
 * @desc    Transfer order between tables
 * @access  Private (Captain+)
 */
router.post(
  '/transfer',
  requirePermission('tables.update'),
  validate(transferOrderSchema),
  tableController.transferOrder
);

/**
 * @route   POST /api/v1/tables/merge
 * @desc    Merge multiple tables
 * @access  Private (Captain+)
 */
router.post(
  '/merge',
  requirePermission('tables.update'),
  validate(mergeTablesSchema),
  tableController.mergeTables
);

/**
 * @route   GET /api/v1/tables/:id
 * @desc    Get table by ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  requirePermission('tables.read'),
  tableController.getTable
);

/**
 * @route   PUT /api/v1/tables/:id
 * @desc    Update table
 * @access  Private (Manager+)
 */
router.put(
  '/:id',
  validateObjectId('id'),
  requirePermission('tables.update'),
  validate(updateTableSchema),
  tableController.updateTable
);

/**
 * @route   DELETE /api/v1/tables/:id
 * @desc    Delete table
 * @access  Private (Manager+)
 */
router.delete(
  '/:id',
  validateObjectId('id'),
  requirePermission('tables.delete'),
  tableController.deleteTable
);

/**
 * @route   PATCH /api/v1/tables/:id/status
 * @desc    Update table status
 * @access  Private (Captain+)
 */
router.patch(
  '/:id/status',
  validateObjectId('id'),
  requirePermission('tables.update'),
  validate(updateTableStatusSchema),
  tableController.updateTableStatus
);

/**
 * @route   GET /api/v1/tables/:id/qr
 * @desc    Get table QR code
 * @access  Private
 */
router.get(
  '/:id/qr',
  validateObjectId('id'),
  requirePermission('tables.read'),
  tableController.getTableQRCode
);

/**
 * @route   POST /api/v1/tables/:id/qr
 * @desc    Regenerate table QR code
 * @access  Private (Manager+)
 */
router.post(
  '/:id/qr',
  validateObjectId('id'),
  requirePermission('tables.update'),
  tableController.regenerateQRCode
);

module.exports = router;
