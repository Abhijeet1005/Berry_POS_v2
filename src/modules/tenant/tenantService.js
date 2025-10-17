const Tenant = require('../../models/Tenant');
const { NotFoundError, ValidationError, ConflictError } = require('../../utils/errorHandler');
const { TENANT_TYPES } = require('../../config/constants');

/**
 * Create a new tenant
 */
const createTenant = async (tenantData) => {
  const { type, name, parentId, contactInfo, subscription } = tenantData;
  
  // Validate hierarchy
  if (parentId) {
    const parent = await Tenant.findById(parentId);
    if (!parent) {
      throw new NotFoundError('Parent tenant');
    }
    
    // Validate hierarchy rules
    if (type === TENANT_TYPES.COMPANY) {
      throw new ValidationError('Company cannot have a parent');
    }
    if (type === TENANT_TYPES.BRAND && parent.type !== TENANT_TYPES.COMPANY) {
      throw new ValidationError('Brand must have a company as parent');
    }
    if (type === TENANT_TYPES.OUTLET && parent.type !== TENANT_TYPES.BRAND) {
      throw new ValidationError('Outlet must have a brand as parent');
    }
  } else if (type !== TENANT_TYPES.COMPANY && type !== TENANT_TYPES.OUTLET) {
    throw new ValidationError('Brand must have a parent company');
  }
  
  // Check for duplicate email
  const existingTenant = await Tenant.findOne({ 'contactInfo.email': contactInfo.email });
  if (existingTenant) {
    throw new ConflictError('Email already registered');
  }
  
  const tenant = new Tenant({
    type,
    name,
    parentId,
    contactInfo,
    subscription
  });
  
  await tenant.save();
  return tenant;
};

/**
 * Get tenant by ID
 */
const getTenantById = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId).active();
  
  if (!tenant) {
    throw new NotFoundError('Tenant');
  }
  
  return tenant;
};

/**
 * Update tenant
 */
const updateTenant = async (tenantId, updateData) => {
  const tenant = await Tenant.findById(tenantId).active();
  
  if (!tenant) {
    throw new NotFoundError('Tenant');
  }
  
  // Prevent changing type or parentId
  if (updateData.type || updateData.parentId) {
    throw new ValidationError('Cannot change tenant type or parent');
  }
  
  Object.assign(tenant, updateData);
  await tenant.save();
  
  return tenant;
};

/**
 * Soft delete tenant
 */
const deleteTenant = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId).active();
  
  if (!tenant) {
    throw new NotFoundError('Tenant');
  }
  
  // Check if tenant has children
  const children = await Tenant.countDocuments({ parentId: tenantId, isDeleted: false });
  if (children > 0) {
    throw new ValidationError('Cannot delete tenant with active children');
  }
  
  await tenant.softDelete();
  
  return { message: 'Tenant deleted successfully' };
};

/**
 * Get tenant hierarchy
 */
const getTenantHierarchy = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId).active();
  
  if (!tenant) {
    throw new NotFoundError('Tenant');
  }
  
  const hierarchy = {
    tenant,
    children: []
  };
  
  // Get children
  if (tenant.type === TENANT_TYPES.COMPANY || tenant.type === TENANT_TYPES.BRAND) {
    const children = await Tenant.find({ parentId: tenantId }).active();
    hierarchy.children = children;
    
    // Get grandchildren for brands
    if (tenant.type === TENANT_TYPES.COMPANY) {
      for (const child of hierarchy.children) {
        const grandchildren = await Tenant.find({ parentId: child._id }).active();
        child.outlets = grandchildren;
      }
    }
  }
  
  return hierarchy;
};

/**
 * Create outlet under a brand
 */
const createOutlet = async (brandId, outletData) => {
  const brand = await Tenant.findById(brandId).active();
  
  if (!brand) {
    throw new NotFoundError('Brand');
  }
  
  if (brand.type !== TENANT_TYPES.BRAND) {
    throw new ValidationError('Parent must be a brand');
  }
  
  const outlet = await createTenant({
    ...outletData,
    type: TENANT_TYPES.OUTLET,
    parentId: brandId
  });
  
  return outlet;
};

/**
 * Get all outlets for a tenant (brand or company)
 */
const getOutlets = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId).active();
  
  if (!tenant) {
    throw new NotFoundError('Tenant');
  }
  
  let outlets = [];
  
  if (tenant.type === TENANT_TYPES.BRAND) {
    // Get direct outlets
    outlets = await Tenant.find({ parentId: tenantId, type: TENANT_TYPES.OUTLET }).active();
  } else if (tenant.type === TENANT_TYPES.COMPANY) {
    // Get all brands first
    const brands = await Tenant.find({ parentId: tenantId, type: TENANT_TYPES.BRAND }).active();
    
    // Get outlets for each brand
    for (const brand of brands) {
      const brandOutlets = await Tenant.find({ parentId: brand._id, type: TENANT_TYPES.OUTLET }).active();
      outlets = outlets.concat(brandOutlets);
    }
  } else {
    throw new ValidationError('Tenant must be a brand or company');
  }
  
  return outlets;
};

/**
 * Update subscription
 */
const updateSubscription = async (tenantId, subscriptionData) => {
  const tenant = await Tenant.findById(tenantId).active();
  
  if (!tenant) {
    throw new NotFoundError('Tenant');
  }
  
  tenant.subscription = {
    ...tenant.subscription,
    ...subscriptionData
  };
  
  await tenant.save();
  
  return tenant;
};

/**
 * Get subscription details
 */
const getSubscription = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId).active();
  
  if (!tenant) {
    throw new NotFoundError('Tenant');
  }
  
  return tenant.subscription;
};

module.exports = {
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant,
  getTenantHierarchy,
  createOutlet,
  getOutlets,
  updateSubscription,
  getSubscription
};
