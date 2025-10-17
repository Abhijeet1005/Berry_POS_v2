const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { validate } = require('../../middleware/validationMiddleware');
const { authenticate } = require('../../middleware/authMiddleware');
const { authLimiter } = require('../../middleware/rateLimitMiddleware');
const {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verify2FASchema,
  disable2FASchema
} = require('./authValidation');

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

/**
 * @route   POST /api/v1/auth/enable-2fa
 * @desc    Enable 2FA for user
 * @access  Private
 */
router.post('/enable-2fa', authenticate, authController.enable2FA);

/**
 * @route   POST /api/v1/auth/verify-2fa
 * @desc    Verify 2FA token and enable
 * @access  Private
 */
router.post('/verify-2fa', authenticate, validate(verify2FASchema), authController.verify2FA);

/**
 * @route   POST /api/v1/auth/verify-2fa-login
 * @desc    Verify 2FA during login
 * @access  Public
 */
router.post('/verify-2fa-login', validate(verify2FASchema), authController.verify2FALogin);

/**
 * @route   POST /api/v1/auth/disable-2fa
 * @desc    Disable 2FA
 * @access  Private
 */
router.post('/disable-2fa', authenticate, validate(disable2FASchema), authController.disable2FA);

module.exports = router;
