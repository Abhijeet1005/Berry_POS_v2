const express = require('express');
const router = express.Router();
const aiController = require('./aiController');
const { authenticate } = require('../../middleware/authMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate, validateObjectId } = require('../../middleware/validationMiddleware');
const aiValidation = require('./aiValidation');

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(injectTenantContext);

// Generate dish profile (admin, manager)
router.post(
  '/generate-dish-profile',
  requirePermission('ai.use'),
  validate(aiValidation.generateDishProfile),
  aiController.generateDishProfile
);

// Analyze nutrition (admin, manager)
router.post(
  '/analyze-nutrition',
  requirePermission('ai.use'),
  validate(aiValidation.analyzeNutrition),
  aiController.analyzeNutrition
);

// Get recommendations (all authenticated users)
router.get(
  '/recommendations/:customerId',
  validateObjectId('customerId'),
  validate(aiValidation.getRecommendations, 'query'),
  aiController.getRecommendations
);

// Update taste profile (all authenticated users)
router.post(
  '/update-taste-profile',
  validate(aiValidation.updateTasteProfile),
  aiController.updateTasteProfile
);

module.exports = router;
