require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const redis = require('./config/redis');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Track server state
let isShuttingDown = false;
let server;

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    const mongoURI = NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    await mongoose.connect(mongoURI);

    logger.info('MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name
    });
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Connect to Redis
 */
const connectRedis = async () => {
  try {
    if (redis && typeof redis.ping === 'function') {
      await redis.ping();
      logger.info('Redis connected successfully');
    } else if (redis && redis.isOpen) {
      logger.info('Redis connected successfully');
    } else {
      throw new Error('Redis client not properly initialized');
    }
  } catch (error) {
    logger.error('Redis connection error:', error);
    // Don't exit - Redis is optional for some features
    logger.warn('Continuing without Redis - some features may be limited');
  }
};

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();

    // Start Express server
    server = app.listen(PORT, () => {
      logger.info(`Server started in ${NODE_ENV} mode`, {
        port: PORT,
        nodeVersion: process.version,
        pid: process.pid
      });
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress');
    return;
  }

  isShuttingDown = true;
  logger.info(`${signal} received, starting graceful shutdown`);

  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        // Close database connections
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');

        await redis.quit();
        logger.info('Redis connection closed');

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

/**
 * Handle termination signals
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer, gracefulShutdown };
