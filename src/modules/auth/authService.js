const User = require('../../models/User');
const { generateTokens, verifyRefreshToken } = require('../../utils/jwtService');
const { generateRandomString } = require('../../utils/encryptionHelper');
const { AuthenticationError, ValidationError, NotFoundError } = require('../../utils/errorHandler');
const speakeasy = require('speakeasy');
const crypto = require('crypto');

/**
 * Register a new user
 */
const register = async (userData) => {
  const { email, password, firstName, lastName, phone, role, tenantId, outletId } = userData;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ValidationError('Email already registered');
  }
  
  // Create new user
  const user = new User({
    email,
    password,
    firstName,
    lastName,
    phone,
    role,
    tenantId,
    outletId
  });
  
  await user.save();
  
  // Generate tokens
  const tokens = generateTokens(user._id, user.tenantId, user.role, user.outletId);
  
  return {
    user: user.toJSON(),
    tokens
  };
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Find user with password field
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  // Check if user is active
  if (!user.isActive) {
    throw new AuthenticationError('Account is inactive');
  }
  
  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  // Generate tokens
  const tokens = generateTokens(user._id, user.tenantId, user.role, user.outletId);
  
  return {
    user: user.toJSON(),
    tokens,
    requires2FA: user.twoFactorEnabled
  };
};

/**
 * Refresh access token
 */
const refreshToken = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid refresh token');
    }
    
    // Generate new tokens
    const tokens = generateTokens(user._id, user.tenantId, user.role, user.outletId);
    
    return tokens;
  } catch (error) {
    throw new AuthenticationError('Invalid refresh token');
  }
};

/**
 * Request password reset
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    // Don't reveal if email exists
    return { message: 'If email exists, reset link will be sent' };
  }
  
  // Generate reset token
  const resetToken = generateRandomString(32);
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
  await user.save();
  
  // TODO: Send email with reset link
  // For now, return token (in production, this should be sent via email)
  
  return {
    message: 'Password reset link sent to email',
    resetToken // Remove this in production
  };
};

/**
 * Reset password
 */
const resetPassword = async (resetToken, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  }).select('+passwordResetToken +passwordResetExpires');
  
  if (!user) {
    throw new AuthenticationError('Invalid or expired reset token');
  }
  
  // Update password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  
  return { message: 'Password reset successful' };
};

/**
 * Enable 2FA
 */
const enable2FA = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  // Generate 2FA secret
  const secret = speakeasy.generateSecret({
    name: `Berry&Blocks (${user.email})`
  });
  
  user.twoFactorSecret = secret.base32;
  user.twoFactorEnabled = false; // Will be enabled after verification
  await user.save();
  
  return {
    secret: secret.base32,
    qrCode: secret.otpauth_url
  };
};

/**
 * Verify 2FA token and enable
 */
const verify2FA = async (userId, token) => {
  const user = await User.findById(userId).select('+twoFactorSecret');
  
  if (!user || !user.twoFactorSecret) {
    throw new AuthenticationError('2FA not set up');
  }
  
  // Verify token
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2
  });
  
  if (!verified) {
    throw new AuthenticationError('Invalid 2FA token');
  }
  
  // Enable 2FA
  user.twoFactorEnabled = true;
  await user.save();
  
  return { message: '2FA enabled successfully' };
};

/**
 * Verify 2FA during login
 */
const verify2FALogin = async (userId, token) => {
  const user = await User.findById(userId).select('+twoFactorSecret');
  
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new AuthenticationError('2FA not enabled');
  }
  
  // Verify token
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 2
  });
  
  if (!verified) {
    throw new AuthenticationError('Invalid 2FA token');
  }
  
  return { verified: true };
};

/**
 * Disable 2FA
 */
const disable2FA = async (userId, password) => {
  const user = await User.findById(userId).select('+password +twoFactorSecret');
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid password');
  }
  
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();
  
  return { message: '2FA disabled successfully' };
};

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  enable2FA,
  verify2FA,
  verify2FALogin,
  disable2FA
};
