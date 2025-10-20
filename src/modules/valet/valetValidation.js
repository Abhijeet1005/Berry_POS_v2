const Joi = require('joi');

const createValetRequest = {
  body: Joi.object({
    customerId: Joi.string().required(),
    outletId: Joi.string().required(),
    vehicleNumber: Joi.string().required(),
    vehicleType: Joi.string().valid('car', 'bike', 'suv', 'other').required(),
    parkingSpot: Joi.string(),
    requestType: Joi.string().valid('park', 'retrieve').required()
  })
};

const getValetRequestById = {
  params: Joi.object({
    id: Joi.string().required()
  })
};

const updateValetStatus = {
  params: Joi.object({
    id: Joi.string().required()
  }),
  body: Joi.object({
    status: Joi.string().valid('pending', 'assigned', 'parked', 'retrieved', 'completed', 'cancelled').required(),
    assignedTo: Joi.string(),
    parkingSpot: Joi.string(),
    notes: Joi.string()
  })
};

const getCustomerRequests = {
  params: Joi.object({
    customerId: Joi.string().required()
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('pending', 'assigned', 'parked', 'retrieved', 'completed', 'cancelled')
  })
};

const getValetPerformance = {
  query: Joi.object({
    outletId: Joi.string(),
    valetId: Joi.string(),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  })
};

const getActiveRequests = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    outletId: Joi.string(),
    assignedTo: Joi.string()
  })
};

module.exports = {
  createValetRequest,
  getValetRequestById,
  updateValetStatus,
  getCustomerRequests,
  getValetPerformance,
  getActiveRequests
};
