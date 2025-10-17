const tenantService = require('./tenantService');
const { successResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');
const AuditLog = require('../../models/AuditLog');

/**
 * Create tenant
 * POST /api/v1/tenants
 */
const createTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.createTenant(req.body);
  
  // Log tenant creation
  await AuditLog.create({
    tenantId: tenant._id,
    userId: req.userId,
    action: 'TENANT_CREATED',
    resource: 'Tenant',
    resourceId: tenant._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.status(201).json(successResponse(tenant, 'Tenant created successfully'));
});

/**
 * Get tenant by ID
 * GET /api/v1/tenants/:id
 */
const getTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.getTenantById(req.params.id);
  
  res.json(successResponse(tenant, 'Tenant retrieved successfully'));
});

/**
 * Update tenant
 * PUT /api/v1/tenants/:id
 */
const updateTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.updateTenant(req.params.id, req.body);
  
  // Log tenant update
  await AuditLog.create({
    tenantId: tenant._id,
    userId: req.userId,
    action: 'TENANT_UPDATED',
    resource: 'Tenant',
    resourceId: tenant._id,
    changes: req.body,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.json(successResponse(tenant, 'Tenant updated successfully'));
});

/**
 * Delete tenant
 * DELETE /api/v1/tenants/:id
 */
const deleteTenant = asyncHandler(async (req, res) => {
  const result = await tenantService.deleteTenant(req.params.id);
  
  // Log tenant deletion
  await AuditLog.create({
    tenantId: req.params.id,
    userId: req.userId,
    action: 'TENANT_DELETED',
    resource: 'Tenant',
    resourceId: req.params.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.json(successResponse(result, 'Tenant deleted successfully'));
});

/**
 * Get tenant hierarchy
 * GET /api/v1/tenants/:id/hierarchy
 */
const getTenantHierarchy = asyncHandler(async (req, res) => {
  const hierarchy = await tenantService.getTenantHierarchy(req.params.id);
  
  res.json(successResponse(hierarchy, 'Hierarchy retrieved successfully'));
});

/**
 * Create outlet
 * POST /api/v1/tenants/:id/outlets
 */
const createOutlet = asyncHandler(async (req, res) => {
  const outlet = await tenantService.createOutlet(req.params.id, req.body);
  
  // Log outlet creation
  await AuditLog.create({
    tenantId: outlet._id,
    userId: req.userId,
    action: 'OUTLET_CREATED',
    resource: 'Tenant',
    resourceId: outlet._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.status(201).json(successResponse(outlet, 'Outlet created successfully'));
});

/**
 * Get subscription
 * GET /api/v1/tenants/:id/subscription
 */
const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await tenantService.getSubscription(req.params.id);
  
  res.json(successResponse(subscription, 'Subscription retrieved successfully'));
});

/**
 * Update subscription
 * PUT /api/v1/tenants/:id/subscription
 */
const updateSubscription = asyncHandler(async (req, res) => {
  const tenant = await tenantService.updateSubscription(req.params.id, req.body);
  
  // Log subscription update
  await AuditLog.create({
    tenantId: tenant._id,
    userId: req.userId,
    action: 'SUBSCRIPTION_UPDATED',
    resource: 'Tenant',
    resourceId: tenant._id,
    changes: req.body,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.json(successResponse(tenant.subscription, 'Subscription updated successfully'));
});

module.exports = {
  createTenant,
  getTenant,
  updateTenant,
  deleteTenant,
  getTenantHierarchy,
  createOutlet,
  getSubscription,
  updateSubscription
};
