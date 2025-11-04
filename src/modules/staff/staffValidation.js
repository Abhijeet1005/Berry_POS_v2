const Joi = require('joi');

const createStaff = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  role: Joi.string().valid('admin', 'manager', 'captain', 'kitchen', 'cashier').required(),
  outletId: Joi.string().required()
});

const getStaff = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  outletId: Joi.string(),
  role: Joi.string().valid('admin', 'manager', 'captain', 'kitchen', 'cashier'),
  isActive: Joi.string().valid('true', 'false')
});

const updateStaff = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  phone: Joi.string().pattern(/^[0-9]{10}$/),
  role: Joi.string().valid('admin', 'manager', 'captain', 'kitchen', 'cashier'),
  outletId: Joi.string(),
  isActive: Joi.boolean()
}).min(1);

const getStaffPerformance = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

module.exports = {
  createStaff,
  getStaff,
  updateStaff,
  getStaffPerformance
};
