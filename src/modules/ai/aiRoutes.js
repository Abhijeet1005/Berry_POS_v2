const express = require('express');
const router = express.Router();
const aiController = require('./aiController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { tenantMiddleware } = require('../../middleware/tenantMiddleware');
const { rbacMiddleware } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const aiValidation = require('./aiValidation');

// Apply auth and tenant middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Generate dish profile (admin, manager)
router.post(
  '/generate-dish-profile',
  rbacMiddleware(['admin', 'manager']),
  validate(aiValidation.generateDishProfile),
  aiController.generateDishProfile
);

// Analyze nutrition (admin, manager)
router.post(
  '/analyze-nutrition',
  rbacMiddleware(['admin', 'manager']),
  validate(aiValidation.analyzeNutrition),
  aiController.analyzeNutrition
);

// Get recommendations (all authenticated users)
router.get(
  '/recommendations/:customerId',
  validate(aiValidation.getRecommendations),
  aiController.getRecommendations
);

// Update taste profile (all authenticated users)
router.post(
  '/update-taste-profile',
  validate(aiValidation.updateTasteProfile),
  aiController.updateTasteProfile
);

module.exports = router;
