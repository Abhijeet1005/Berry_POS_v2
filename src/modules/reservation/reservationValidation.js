const Joi = require('joi');

const createReservation = {
  body: Joi.object({
    customerId: Joi.string().required(),
    outletId: Joi.string().required(),
    reservationDate: Joi.date().iso().required(),
    reservationTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
    numberOfGuests: Joi.number().integer().min(1).max(50).required(),
    tablePreference: Joi.string(),
    specialRequests: Joi.string(),
    preOrder: Joi.array().items(Joi.object({
      dishId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      specialInstructions: Joi.string()
    }))
  })
};

const getAvailability = {
  query: Joi.object({
    outletId: Joi.string().required(),
    date: Joi.date().iso().required(),
    numberOfGuests: Joi.number().integer().min(1).required()
  })
};

const getReservations = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    outletId: Joi.string(),
    customerId: Joi.string(),
    status: Joi.string().valid('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'),
    date: Joi.date().iso()
  })
};

const getReservationById = {
  params: Joi.object({
    id: Joi.string().required()
  })
};

const updateReservation = {
  params: Joi.object({
    id: Joi.string().required()
  }),
  body: Joi.object({
    reservationDate: Joi.date().iso(),
    numberOfGuests: Joi.number().integer().min(1).max(50),
    tablePreference: Joi.string(),
    specialRequests: Joi.string(),
    status: Joi.string().valid('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'),
    tableId: Joi.string()
  }).min(1)
};

const cancelReservation = {
  params: Joi.object({
    id: Joi.string().required()
  })
};

const addPreOrder = {
  params: Joi.object({
    id: Joi.string().required()
  }),
  body: Joi.object({
    items: Joi.array().items(Joi.object({
      dishId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      specialInstructions: Joi.string()
    })).min(1).required()
  })
};

module.exports = {
  createReservation,
  getAvailability,
  getReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  addPreOrder
};
