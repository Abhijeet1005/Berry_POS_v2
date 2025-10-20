const validator = require('validator');
const securityConfig = require('../config/security');

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Trim whitespace
  str = str.trim();
  
  // Escape HTML
  str = validator.escape(str);
  
  return str;
};

/**
 * Sanitize email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  
  email = email.trim().toLowerCase();
  
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }
  
  return validator.normalizeEmail(email);
};

/**
 * Sanitize phone number
 */
const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;
  
  // Remove all non-numeric characters
  phone = phone.replace(/\D/g, '');
  
  if (phone.length < 10 || phone.length > 15) {
    throw new Error('Invalid phone number');
  }
  
  return phone;
};

/**
 * Sanitize URL
 */
const sanitizeURL = (url) => {
  if (typeof url !== 'string') return url;
  
  url = url.trim();
  
  if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
    throw new Error('Invalid URL format');
  }
  
  return url;
};

/**
 * Mask sensitive data
 */
const maskSensitiveData = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const masked = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const key in masked) {
    if (securityConfig.sensitiveFields.includes(key.toLowerCase())) {
      masked[key] = '***REDACTED***';
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  
  return masked;
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (filename) => {
  if (typeof filename !== 'string') return filename;
  
  // Remove path traversal attempts
  filename = filename.replace(/\.\./g, '');
  
  // Remove special characters except dots, dashes, and underscores
  filename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  if (filename.length > 255) {
    const ext = filename.split('.').pop();
    filename = filename.substring(0, 250) + '.' + ext;
  }
  
  return filename;
};

/**
 * Validate and sanitize object ID
 */
const sanitizeObjectId = (id) => {
  if (typeof id !== 'string') return id;
  
  // MongoDB ObjectId is 24 hex characters
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new Error('Invalid ID format');
  }
  
  return id;
};

/**
 * Remove null bytes
 */
const removeNullBytes = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/\0/g, '');
};

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    const value = obj[key];
    
    if (typeof value === 'string') {
      sanitized[key] = removeNullBytes(value);
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeURL,
  maskSensitiveData,
  sanitizeFilename,
  sanitizeObjectId,
  removeNullBytes,
  sanitizeObject
};
