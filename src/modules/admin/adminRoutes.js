const express = require('express');
const router = express.Router();
const adminController = require('./adminController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { rbacMiddleware } = require('../../middleware/rbacMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// All admin routes require admin role
router.use(rbacMiddleware(['admin']));

// Tenant management
router.get('/tenants', adminController.getAllTenants);

// Subscription management
router.post('/subscriptions', adminController.createSubscription);
router.get('/subscriptions', adminController.getSubscriptions);
router.get('/subscriptions/analytics', adminController.getSubscriptionAnalytics);
router.get('/subscriptions/:id', adminController.getSubscriptionById);
router.put('/subscriptions/:id', adminController.updateSubscription);
router.post('/subscriptions/:id/pause', adminController.pauseSubscription);
router.post('/subscriptions/:id/resume', adminController.resumeSubscription);
router.post('/subscriptions/:id/cancel', adminController.cancelSubscription);

// Support ticket management
router.post('/tickets', adminController.createTicket);
router.get('/tickets', adminController.getTickets);
router.get('/tickets/statistics', adminController.getTicketStatistics);
router.get('/tickets/:id', adminController.getTicketById);
router.patch('/tickets/:id/status', adminController.updateTicketStatus);
router.post('/tickets/:id/assign', adminController.assignTicket);
router.post('/tickets/:id/responses', adminController.addTicketResponse);

// Feature toggles
router.get('/features', adminController.getAllFeatures);
router.put('/features/:key', adminController.updateFeature);
router.post('/features/:key/enable', adminController.enableFeatureForTenant);
router.post('/features/:key/disable', adminController.disableFeatureForTenant);
router.get('/features/tenant/:tenantId', adminController.getTenantFeatures);

// Admin analytics
router.get('/analytics', adminController.getAdminAnalytics);

module.exports = router;
