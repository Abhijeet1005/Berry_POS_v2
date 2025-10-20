const { ValidationError } = require('../../utils/errorHandler');

// In-memory feature toggle storage (in production, use database or Redis)
const featureToggles = new Map();

/**
 * Initialize default feature toggles
 */
const initializeFeatures = () => {
  const defaultFeatures = [
    { key: 'ai_recommendations', name: 'AI Recommendations', enabled: true, global: true },
    { key: 'loyalty_program', name: 'Loyalty Program', enabled: true, global: true },
    { key: 'valet_service', name: 'Valet Service', enabled: true, global: true },
    { key: 'reservations', name: 'Table Reservations', enabled: true, global: true },
    { key: 'qr_ordering', name: 'QR Code Ordering', enabled: true, global: true },
    { key: 'online_payments', name: 'Online Payments', enabled: true, global: true },
    { key: 'delivery_integration', name: 'Delivery Platform Integration', enabled: false, global: true },
    { key: 'whatsapp_notifications', name: 'WhatsApp Notifications', enabled: false, global: true },
    { key: 'advanced_analytics', name: 'Advanced Analytics', enabled: true, global: true }
  ];
  
  defaultFeatures.forEach(feature => {
    featureToggles.set(feature.key, feature);
  });
};

// Initialize on module load
initializeFeatures();

/**
 * Get all feature toggles
 */
const getAllFeatures = async () => {
  return Array.from(featureToggles.values());
};

/**
 * Get feature toggle by key
 */
const getFeature = async (key) => {
  const feature = featureToggles.get(key);
  
  if (!feature) {
    throw new ValidationError('Feature not found');
  }
  
  return feature;
};

/**
 * Update feature toggle
 */
const updateFeature = async (key, updateData) => {
  const feature = featureToggles.get(key);
  
  if (!feature) {
    throw new ValidationError('Feature not found');
  }
  
  const updated = {
    ...feature,
    ...updateData,
    updatedAt: new Date()
  };
  
  featureToggles.set(key, updated);
  
  return updated;
};

/**
 * Enable feature for tenant
 */
const enableFeatureForTenant = async (key, tenantId) => {
  const feature = featureToggles.get(key);
  
  if (!feature) {
    throw new ValidationError('Feature not found');
  }
  
  if (!feature.tenantOverrides) {
    feature.tenantOverrides = {};
  }
  
  feature.tenantOverrides[tenantId] = true;
  featureToggles.set(key, feature);
  
  return feature;
};

/**
 * Disable feature for tenant
 */
const disableFeatureForTenant = async (key, tenantId) => {
  const feature = featureToggles.get(key);
  
  if (!feature) {
    throw new ValidationError('Feature not found');
  }
  
  if (!feature.tenantOverrides) {
    feature.tenantOverrides = {};
  }
  
  feature.tenantOverrides[tenantId] = false;
  featureToggles.set(key, feature);
  
  return feature;
};

/**
 * Check if feature is enabled for tenant
 */
const isFeatureEnabled = async (key, tenantId) => {
  const feature = featureToggles.get(key);
  
  if (!feature) {
    return false;
  }
  
  // Check tenant-specific override first
  if (feature.tenantOverrides && tenantId in feature.tenantOverrides) {
    return feature.tenantOverrides[tenantId];
  }
  
  // Fall back to global setting
  return feature.enabled;
};

/**
 * Get features for tenant
 */
const getTenantFeatures = async (tenantId) => {
  const allFeatures = Array.from(featureToggles.values());
  
  return allFeatures.map(feature => ({
    key: feature.key,
    name: feature.name,
    enabled: feature.tenantOverrides?.[tenantId] ?? feature.enabled
  }));
};

module.exports = {
  getAllFeatures,
  getFeature,
  updateFeature,
  enableFeatureForTenant,
  disableFeatureForTenant,
  isFeatureEnabled,
  getTenantFeatures
};
