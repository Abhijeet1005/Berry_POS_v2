const express = require('express');
const router = express.Router();
const syncController = require('./syncController');
const { authenticate } = require('../../middleware/authMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const syncValidation = require('./syncValidation');

// Apply auth and tenant middleware to all routes
router.use(authenticate);
router.use(injectTenantContext);

// Push sync (all authenticated users)
router.post(
  '/push',
  validate(syncValidation.pushSync),
  syncController.pushSync
);

// Pull sync (all authenticated users)
router.post(
  '/pull',
  validate(syncValidation.pullSync),
  syncController.pullSync
);

// Get sync status (all authenticated users)
router.get(
  '/status',
  validate(syncValidation.getSyncStatus),
  syncController.getSyncStatus
);

// Resolve conflict (all authenticated users)
router.post(
  '/resolve-conflict',
  validate(syncValidation.resolveConflict),
  syncController.resolveConflict
);

// Retry failed sync (all authenticated users)
router.post(
  '/retry/:syncId',
  validate(syncValidation.retrySync),
  syncController.retrySync
);

module.exports = router;
