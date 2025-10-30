const Joi = require('joi');

const register = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  email: Joi.string().email()
});

const login = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10}$/).required()
});

const verifyOTP = Joi.object({
  phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
  otp: Joi.string().length(6).required()
});

const updateProfile = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  addresses: Joi.array().items(Joi.object({
    type: Joi.string().valid('home', 'work', 'other'),
    address: Joi.string().required(),
    landmark: Joi.string(),
    city: Joi.string(),
    pincode: Joi.string()
  }))
}).min(1);

const getMenu = Joi.object({
  outletId: Joi.string().required(),
  category: Joi.string(),
  dietaryTags: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  search: Joi.string()
});

const addToCart = Joi.object({
  dishId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  specialInstructions: Joi.string()
});

const updateCartItem = Joi.object({
  quantity: Joi.number().integer().min(0).required()
});

const placeOrder = Joi.object({
  outletId: Joi.string().required(),
  orderType: Joi.string().valid('dine-in', 'takeaway', 'delivery').required(),
  tableId: Joi.string(),
  deliveryAddress: Joi.object({
    address: Joi.string().required(),
    landmark: Joi.string(),
    city: Joi.string(),
    pincode: Joi.string()
  }),
  paymentMethod: Joi.string().valid('cash', 'card', 'upi', 'wallet').required()
});

const cancelOrder = Joi.object({
  reason: Joi.string().required()
});

module.exports = {
  register,
  login,
  verifyOTP,
  updateProfile,
  getMenu,
  addToCart,
  updateCartItem,
  placeOrder,
  cancelOrder
};
