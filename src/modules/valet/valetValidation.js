const Joi = require('joi');

const createValetRequest = Joi.object({
  customerId: Joi.string().required(),
  outletId: Joi.string().required(),
  vehicleNumber: Joi.string().required(),
  vehicleType: Joi.string().valid('car', 'bike', 'suv', 'other').required(),
  parkingSpot: Joi.string(),
  requestType: Joi.string().valid('park', 'retrieve').required()
});

const updateValetStatus = Joi.object({
  status: Joi.string().valid('pending', 'assigned', 'parked', 'retrieved', 'completed', 'cancelled').required(),
  assignedTo: Joi.string(),
  parkingSpot: Joi.string(),
  notes: Joi.string()
});

const getCustomerRequests = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string().valid('pending', 'assigned', 'parked', 'retrieved', 'completed', 'cancelled')
});

const getValetPerformance = Joi.object({
  outletId: Joi.string(),
  valetId: Joi.string(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

const getActiveRequests = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  outletId: Joi.string(),
  assignedTo: Joi.string()
});

module.exports = {
  createValetRequest,
  updateValetStatus,
  getCustomerRequests,
  getValetPerformance,
  getActiveRequests
};
