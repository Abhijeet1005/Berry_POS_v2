const securityConfig = require('../config/security');

/**
 * Validate password strength
 */
const validatePassword = (password) => {
  const errors = [];
  const config = securityConfig.password;

  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }

  // Check minimum length
  if (password.length < config.minLength) {
    errors.push(`Password must be at least ${config.minLength} characters long`);
  }

  // Check maximum length
  if (password.length > config.maxLength) {
    errors.push(`Password must not exceed ${config.maxLength} characters`);
  }

  // Check for uppercase
  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase
  if (config.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for numbers
  if (config.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special characters
  if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check for common passwords
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Calculate password strength
 */
const calculatePasswordStrength = (password) => {
  let strength = 0;

  if (!password) return 0;

  // Length
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  if (password.length >= 16) strength += 1;

  // Character variety
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

  // Patterns
  if (!/(.)\1{2,}/.test(password)) strength += 1; // No repeated characters
  if (!/^[0-9]+$/.test(password)) strength += 1; // Not all numbers
  if (!/^[a-zA-Z]+$/.test(password)) strength += 1; // Not all letters

  return Math.min(strength, 10);
};

/**
 * Get password strength label
 */
const getPasswordStrengthLabel = (strength) => {
  if (strength <= 3) return 'Weak';
  if (strength <= 6) return 'Medium';
  if (strength <= 8) return 'Strong';
  return 'Very Strong';
};

module.exports = {
  validatePassword,
  calculatePasswordStrength,
  getPasswordStrengthLabel
};
