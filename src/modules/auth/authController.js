const authService = require('./authService');
const { successResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');
const AuditLog = require('../../models/AuditLog');

/**
 * Register new user
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  
  // Log registration
  await AuditLog.create({
    tenantId: result.user.tenantId,
    userId: result.user._id,
    action: 'USER_REGISTERED',
    resource: 'User',
    resourceId: result.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.status(201).json(successResponse(result, 'User registered successfully'));
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  
  // Log login
  await AuditLog.create({
    tenantId: result.user.tenantId,
    userId: result.user._id,
    action: 'USER_LOGIN',
    resource: 'User',
    resourceId: result.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.json(successResponse(result, 'Login successful'));
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // Log logout
  await AuditLog.create({
    tenantId: req.tenantId,
    userId: req.userId,
    action: 'USER_LOGOUT',
    resource: 'User',
    resourceId: req.userId,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.json(successResponse(null, 'Logout successful'));
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);
  
  res.json(successResponse(tokens, 'Token refreshed successfully'));
});

/**
 * Request password reset
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  
  res.json(successResponse(result, 'Password reset instructions sent'));
});

/**
 * Reset password
 * POST /api/v1/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  const result = await authService.resetPassword(resetToken, newPassword);
  
  res.json(successResponse(result, 'Password reset successful'));
});

/**
 * Enable 2FA
 * POST /api/v1/auth/enable-2fa
 */
const enable2FA = asyncHandler(async (req, res) => {
  const result = await authService.enable2FA(req.userId);
  
  res.json(successResponse(result, '2FA setup initiated'));
});

/**
 * Verify 2FA token
 * POST /api/v1/auth/verify-2fa
 */
const verify2FA = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const result = await authService.verify2FA(req.userId, token);
  
  // Log 2FA enabled
  await AuditLog.create({
    tenantId: req.tenantId,
    userId: req.userId,
    action: '2FA_ENABLED',
    resource: 'User',
    resourceId: req.userId,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.json(successResponse(result, '2FA enabled successfully'));
});

/**
 * Verify 2FA during login
 * POST /api/v1/auth/verify-2fa-login
 */
const verify2FALogin = asyncHandler(async (req, res) => {
  const { userId, token } = req.body;
  const result = await authService.verify2FALogin(userId, token);
  
  res.json(successResponse(result, '2FA verification successful'));
});

/**
 * Disable 2FA
 * POST /api/v1/auth/disable-2fa
 */
const disable2FA = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const result = await authService.disable2FA(req.userId, password);
  
  // Log 2FA disabled
  await AuditLog.create({
    tenantId: req.tenantId,
    userId: req.userId,
    action: '2FA_DISABLED',
    resource: 'User',
    resourceId: req.userId,
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.json(successResponse(result, '2FA disabled successfully'));
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  enable2FA,
  verify2FA,
  verify2FALogin,
  disable2FA
};
