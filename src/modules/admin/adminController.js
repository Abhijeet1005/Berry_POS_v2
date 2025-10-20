const subscriptionService = require('./subscriptionService');
const ticketService = require('./ticketService');
const featureToggleService = require('./featureToggleService');
const Tenant = require('../../models/Tenant');
const { successResponse, paginatedResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

// Subscription endpoints
const createSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.createSubscription(req.body);
  res.status(201).json(successResponse(subscription, 'Subscription created successfully'));
});

const getSubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await subscriptionService.getSubscriptions(req.query);
  res.json(successResponse(subscriptions, 'Subscriptions retrieved successfully'));
});

const getSubscriptionById = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getSubscriptionById(req.params.id);
  res.json(successResponse(subscription, 'Subscription retrieved successfully'));
});

const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.updateSubscription(req.params.id, req.body);
  res.json(successResponse(subscription, 'Subscription updated successfully'));
});

const pauseSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.pauseSubscription(req.params.id);
  res.json(successResponse(subscription, 'Subscription paused successfully'));
});

const resumeSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.resumeSubscription(req.params.id);
  res.json(successResponse(subscription, 'Subscription resumed successfully'));
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.cancelSubscription(req.params.id, req.body.reason);
  res.json(successResponse(subscription, 'Subscription cancelled successfully'));
});

const getSubscriptionAnalytics = asyncHandler(async (req, res) => {
  const analytics = await subscriptionService.getSubscriptionAnalytics();
  res.json(successResponse(analytics, 'Analytics retrieved successfully'));
});

// Ticket endpoints
const createTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.createTicket(req.body, req.tenantId, req.user._id);
  res.status(201).json(successResponse(ticket, 'Ticket created successfully'));
});

const getTickets = asyncHandler(async (req, res) => {
  const result = await ticketService.getTickets(req.query);
  res.json(paginatedResponse(result.tickets, result.pagination.page, result.pagination.limit, result.pagination.total));
});

const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await ticketService.getTicketById(req.params.id);
  res.json(successResponse(ticket, 'Ticket retrieved successfully'));
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await ticketService.updateTicketStatus(req.params.id, req.body.status, req.user._id);
  res.json(successResponse(ticket, 'Ticket status updated successfully'));
});

const assignTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketService.assignTicket(req.params.id, req.body.assignedTo);
  res.json(successResponse(ticket, 'Ticket assigned successfully'));
});

const addTicketResponse = asyncHandler(async (req, res) => {
  const ticket = await ticketService.addResponse(req.params.id, req.body, req.user._id);
  res.json(successResponse(ticket, 'Response added successfully'));
});

const getTicketStatistics = asyncHandler(async (req, res) => {
  const stats = await ticketService.getTicketStatistics(req.query);
  res.json(successResponse(stats, 'Statistics retrieved successfully'));
});

// Tenant management
const getAllTenants = asyncHandler(async (req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });
  res.json(successResponse(tenants, 'Tenants retrieved successfully'));
});

// Feature toggle endpoints
const getAllFeatures = asyncHandler(async (req, res) => {
  const features = await featureToggleService.getAllFeatures();
  res.json(successResponse(features, 'Features retrieved successfully'));
});

const updateFeature = asyncHandler(async (req, res) => {
  const feature = await featureToggleService.updateFeature(req.params.key, req.body);
  res.json(successResponse(feature, 'Feature updated successfully'));
});

const enableFeatureForTenant = asyncHandler(async (req, res) => {
  const feature = await featureToggleService.enableFeatureForTenant(req.params.key, req.body.tenantId);
  res.json(successResponse(feature, 'Feature enabled for tenant'));
});

const disableFeatureForTenant = asyncHandler(async (req, res) => {
  const feature = await featureToggleService.disableFeatureForTenant(req.params.key, req.body.tenantId);
  res.json(successResponse(feature, 'Feature disabled for tenant'));
});

const getTenantFeatures = asyncHandler(async (req, res) => {
  const features = await featureToggleService.getTenantFeatures(req.params.tenantId);
  res.json(successResponse(features, 'Tenant features retrieved successfully'));
});

// Analytics endpoint
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const tenantCount = await Tenant.countDocuments();
  const subscriptionAnalytics = await subscriptionService.getSubscriptionAnalytics();
  const ticketStats = await ticketService.getTicketStatistics({});
  
  const analytics = {
    tenants: {
      total: tenantCount
    },
    subscriptions: subscriptionAnalytics,
    support: ticketStats
  };
  
  res.json(successResponse(analytics, 'Admin analytics retrieved successfully'));
});

module.exports = {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  getSubscriptionAnalytics,
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  addTicketResponse,
  getTicketStatistics,
  getAllTenants,
  getAllFeatures,
  updateFeature,
  enableFeatureForTenant,
  disableFeatureForTenant,
  getTenantFeatures,
  getAdminAnalytics
};
