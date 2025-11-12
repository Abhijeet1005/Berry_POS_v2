const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const { sanitizeInput } = require('./middleware/validationMiddleware');
const { apiLimiter, authLimiter, adminLimiter, paymentLimiter } = require('./middleware/rateLimitMiddleware');
const {
  preventMongoInjection,
  preventXSS,
  preventHPP,
  contentSecurityPolicy,
  preventClickjacking,
  preventMimeSniffing,
  enableXSSProtection,
  referrerPolicy,
  permissionsPolicy,
  detectSuspiciousPatterns,
  requestSizeLimiter
} = require('./middleware/securityMiddleware');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // We'll use custom CSP
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Security headers
app.use(contentSecurityPolicy);
app.use(preventClickjacking);
app.use(preventMimeSniffing);
app.use(enableXSSProtection);
app.use(referrerPolicy);
app.use(permissionsPolicy);

// Request size limiter
app.use(requestSizeLimiter);

// Input sanitization and validation
app.use(sanitizeInput);
app.use(preventMongoInjection);
app.use(preventXSS);
app.use(preventHPP);

// Detect suspicious patterns
app.use(detectSuspiciousPatterns);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/admin', adminLimiter);
app.use('/api/v1/payments', paymentLimiter);

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check endpoints
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../package.json').version
  };

  res.json(health);
});

// Detailed health check with dependencies
app.get('/health/detailed', async (req, res) => {
  const mongoose = require('mongoose');
  const redis = require('./config/redis');

  const health = {
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../package.json').version,
    services: {
      mongodb: 'unknown',
      redis: 'unknown'
    }
  };

  // Check MongoDB
  try {
    if (mongoose.connection.readyState === 1) {
      health.services.mongodb = 'connected';
    } else {
      health.services.mongodb = 'disconnected';
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.mongodb = 'error';
    health.status = 'degraded';
  }

  // Check Redis
  try {
    await redis.ping();
    health.services.redis = 'connected';
  } catch (error) {
    health.services.redis = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Readiness probe
app.get('/ready', async (req, res) => {
  const mongoose = require('mongoose');
  
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false });
  }
});

// Liveness probe
app.get('/live', (req, res) => {
  res.status(200).json({ alive: true });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Berry & Blocks POS API Documentation'
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes
const authRoutes = require('./modules/auth/authRoutes');
const tenantRoutes = require('./modules/tenant/tenantRoutes');
const menuRoutes = require('./modules/menu/menuRoutes');
const orderRoutes = require('./modules/order/orderRoutes');
const tableRoutes = require('./modules/table/tableRoutes');
const paymentRoutes = require('./modules/payment/paymentRoutes');
const staffRoutes = require('./modules/staff/staffRoutes');
const aiRoutes = require('./modules/ai/aiRoutes');
const loyaltyRoutes = require('./modules/loyalty/loyaltyRoutes');
const feedbackRoutes = require('./modules/feedback/feedbackRoutes');
const couponRoutes = require('./modules/coupon/couponRoutes');
const valetRoutes = require('./modules/valet/valetRoutes');
const reservationRoutes = require('./modules/reservation/reservationRoutes');
const analyticsRoutes = require('./modules/analytics/analyticsRoutes');
const notificationRoutes = require('./modules/notification/notificationRoutes');
const syncRoutes = require('./modules/sync/syncRoutes');
const adminRoutes = require('./modules/admin/adminRoutes');
const auditRoutes = require('./modules/audit/auditRoutes');
const customerRoutes = require('./modules/customer/customerRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customer', customerRoutes); // Register customer routes BEFORE wildcard routes
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1', menuRoutes);
app.use('/api/v1', orderRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/valet', valetRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/audit', auditRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
