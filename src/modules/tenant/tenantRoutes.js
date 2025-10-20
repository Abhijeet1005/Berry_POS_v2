const express = require('express');
const router = express.Router();
const tenantController = require('./tenantController');
const { validate, validateObjectId } = require('../../middleware/validationMiddleware');
const { authenticate } = require('../../middleware/authMiddleware');
const { requireAdmin } = require('../../middleware/rbacMiddleware');
const { cacheMiddleware, invalidateCacheMiddleware } = require('../../middleware/cacheMiddleware');
const {
  createTenantSchema,
  updateTenantSchema,
  createOutletSchema,
  updateSubscriptionSchema
} = require('./tenantValidation');

// All tenant routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   POST /api/v1/tenants
 * @desc    Create a new tenant
 * @access  Private (Admin only)
 */
router.post('/', validate(createTenantSchema), tenantController.createTenant);

/**
 * @route   GET /api/v1/tenants/:id
 * @desc    Get tenant by ID
 * @access  Private (Admin only)
 */
router.get('/:id', validateObjectId('id'), cacheMiddleware({ ttl: 600 }), tenantController.getTenant);

/**
 * @route   PUT /api/v1/tenants/:id
 * @desc    Update tenant
 * @access  Private (Admin only)
 */
router.put('/:id', validateObjectId('id'), validate(updateTenantSchema), invalidateCacheMiddleware({ patterns: [(req) => `*:tenant:${req.params.id}:*`] }), tenantController.updateTenant);

/**
 * @route   DELETE /api/v1/tenants/:id
 * @desc    Delete tenant (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', validateObjectId('id'), tenantController.deleteTenant);

/**
 * @route   GET /api/v1/tenants/:id/hierarchy
 * @desc    Get tenant hierarchy
 * @access  Private (Admin only)
 */
router.get('/:id/hierarchy', validateObjectId('id'), cacheMiddleware({ ttl: 600 }), tenantController.getTenantHierarchy);

/**
 * @route   POST /api/v1/tenants/:id/outlets
 * @desc    Create outlet under a brand
 * @access  Private (Admin only)
 */
router.post('/:id/outlets', validateObjectId('id'), validate(createOutletSchema), tenantController.createOutlet);

/**
 * @route   GET /api/v1/tenants/:id/subscription
 * @desc    Get subscription details
 * @access  Private (Admin only)
 */
router.get('/:id/subscription', validateObjectId('id'), tenantController.getSubscription);

/**
 * @route   PUT /api/v1/tenants/:id/subscription
 * @desc    Update subscription
 * @access  Private (Admin only)
 */
router.put('/:id/subscription', validateObjectId('id'), validate(updateSubscriptionSchema), tenantController.updateSubscription);

module.exports = router;
