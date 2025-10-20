const Customer = require('../../models/Customer');
const jwt = require('jsonwebtoken');
const { ValidationError, NotFoundError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

// In-memory OTP storage (in production, use Redis)
const otpStore = new Map();

/**
 * Generate OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP (mock implementation)
 */
const sendOTP = async (phone, otp) => {
  // TODO: Integrate with SMS provider
  logger.info('OTP sent', { phone, otp: otp.substring(0, 2) + '****' });
  console.log(`OTP for ${phone}: ${otp}`); // For development
  return true;
};

/**
 * Register customer
 */
const registerCustomer = async (customerData, tenantId) => {
  const { name, phone, email } = customerData;

  // Check if customer already exists
  let customer = await Customer.findOne({ phone, tenantId });

  if (customer) {
    throw new ValidationError('Customer with this phone number already exists');
  }

  // Create customer
  customer = new Customer({
    name,
    phone,
    email,
    tenantId,
    isVerified: false
  });

  await customer.save();

  // Generate and send OTP
  const otp = generateOTP();
  otpStore.set(phone, {
    otp,
    customerId: customer._id,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  await sendOTP(phone, otp);

  return {
    customerId: customer._id,
    message: 'OTP sent to your phone number'
  };
};

/**
 * Login customer
 */
const loginCustomer = async (phone, tenantId) => {
  // Find customer
  const customer = await Customer.findOne({ phone, tenantId });

  if (!customer) {
    throw new NotFoundError('Customer not found. Please register first.');
  }

  // Generate and send OTP
  const otp = generateOTP();
  otpStore.set(phone, {
    otp,
    customerId: customer._id,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  await sendOTP(phone, otp);

  return {
    customerId: customer._id,
    message: 'OTP sent to your phone number'
  };
};

/**
 * Verify OTP and generate token
 */
const verifyOTP = async (phone, otp, tenantId) => {
  const otpData = otpStore.get(phone);

  if (!otpData) {
    throw new ValidationError('OTP not found or expired');
  }

  if (Date.now() > otpData.expiresAt) {
    otpStore.delete(phone);
    throw new ValidationError('OTP has expired');
  }

  if (otpData.otp !== otp) {
    throw new ValidationError('Invalid OTP');
  }

  // Get customer
  const customer = await Customer.findById(otpData.customerId);

  if (!customer) {
    throw new NotFoundError('Customer');
  }

  // Mark as verified
  if (!customer.isVerified) {
    customer.isVerified = true;
    await customer.save();
  }

  // Clear OTP
  otpStore.delete(phone);

  // Generate JWT token
  const token = jwt.sign(
    {
      customerId: customer._id,
      tenantId: customer.tenantId,
      type: 'customer'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      loyaltyPoints: customer.loyaltyPoints || 0
    }
  };
};

/**
 * Get customer profile
 */
const getProfile = async (customerId, tenantId) => {
  const customer = await Customer.findOne({ _id: customerId, tenantId });

  if (!customer) {
    throw new NotFoundError('Customer');
  }

  return {
    id: customer._id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    loyaltyPoints: customer.loyaltyPoints || 0,
    tasteProfile: customer.tasteProfile,
    addresses: customer.addresses || [],
    createdAt: customer.createdAt
  };
};

/**
 * Update customer profile
 */
const updateProfile = async (customerId, updateData, tenantId) => {
  const customer = await Customer.findOne({ _id: customerId, tenantId });

  if (!customer) {
    throw new NotFoundError('Customer');
  }

  // Prevent updating sensitive fields
  delete updateData.phone;
  delete updateData.tenantId;
  delete updateData.loyaltyPoints;
  delete updateData.isVerified;

  Object.assign(customer, updateData);
  await customer.save();

  return {
    id: customer._id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    addresses: customer.addresses
  };
};

module.exports = {
  registerCustomer,
  loginCustomer,
  verifyOTP,
  getProfile,
  updateProfile
};
