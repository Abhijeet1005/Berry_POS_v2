const Joi = require('joi');

const getSalesAnalytics = Joi.object({
  outletId: Joi.string(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  groupBy: Joi.string().valid('day', 'hour', 'month')
});

const getDishAnalytics = Joi.object({
  outletId: Joi.string(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  limit: Joi.number().integer().min(1).max(100)
});

const getCustomerAnalytics = Joi.object({
  outletId: Joi.string(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

const getStaffAnalytics = Joi.object({
  outletId: Joi.string(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

const getCampaignAnalytics = Joi.object({
  campaignId: Joi.string(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

const exportReport = Joi.object({
  reportType: Joi.string().valid('sales', 'dishes', 'customers', 'staff', 'campaigns').required(),
  format: Joi.string().valid('json', 'csv', 'excel', 'pdf').required(),
  outletId: Joi.string(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  groupBy: Joi.string().valid('day', 'hour', 'month'),
  limit: Joi.number().integer().min(1).max(100)
});

module.exports = {
  getSalesAnalytics,
  getDishAnalytics,
  getCustomerAnalytics,
  getStaffAnalytics,
  getCampaignAnalytics,
  exportReport
};
