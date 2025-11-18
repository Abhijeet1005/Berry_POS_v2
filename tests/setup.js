const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const redis = require('redis');

let mongoServer;
let redisClient;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  
  // Mock Redis client
  redisClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    connect: jest.fn(),
    quit: jest.fn()
  };
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Global test utilities
global.testUtils = {
  generateToken: (userId, role = 'admin') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },
  
  createTestUser: async (overrides = {}) => {
    const User = require('../src/models/User');
    const bcrypt = require('bcrypt');
    
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      phone: '1234567890',
      role: 'admin',
      isActive: true,
      ...overrides
    };
    
    return await User.create(userData);
  },
  
  createTestTenant: async (type = 'outlet', overrides = {}) => {
    const Tenant = require('../src/models/Tenant');
    
    const tenantData = {
      name: `Test ${type}`,
      type,
      isActive: true,
      contactInfo: {
        email: 'test@example.com',
        phone: '9876543210'
      },
      ...overrides
    };
    
    return await Tenant.create(tenantData);
  }
};
