/**
 * System Health Check Tests
 * Quick validation of critical system components
 */

const mongoose = require('mongoose');
const app = require('../../src/app');
const request = require('supertest');

describe('System Health Checks', () => {
  describe('Database Connection', () => {
    it('should connect to database', () => {
      expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    });
    
    it('should have all required models loaded', () => {
      const requiredModels = [
        'User',
        'Tenant',
        'Order',
        'Dish',
        'Category',
        'Customer',
        'InventoryItem',
        'Recipe',
        'PlatformIntegration'
      ];
      
      const loadedModels = Object.keys(mongoose.models);
      
      requiredModels.forEach(model => {
        expect(loadedModels).toContain(model);
      });
    });
  });
  
  describe('API Server', () => {
    it('should respond to health check endpoint', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
    
    it('should have CORS enabled', async () => {
      const response = await request(app)
        .options('/api/v1/auth/login')
        .set('Origin', 'http://localhost:3000');
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
  
  describe('Critical Routes', () => {
    const criticalRoutes = [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/orders',
      '/api/v1/dishes',
      '/api/v1/inventory/items'
    ];
    
    criticalRoutes.forEach(route => {
      it(`should have ${route} route registered`, async () => {
        const response = await request(app).post(route);
        
        // Should not be 404 (route exists)
        expect(response.status).not.toBe(404);
      });
    });
  });
  
  describe('Middleware', () => {
    it('should have error handler middleware', async () => {
      const response = await request(app).get('/non-existent-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
    });
    
    it('should sanitize inputs', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password',
          name: '<script>alert("xss")</script>'
        });
      
      // Should not contain script tags in response
      if (response.body.data) {
        expect(response.body.data.name).not.toContain('<script>');
      }
    });
  });
  
  describe('Environment Configuration', () => {
    it('should have required environment variables', () => {
      const requiredEnvVars = [
        'NODE_ENV',
        'JWT_SECRET'
      ];
      
      requiredEnvVars.forEach(envVar => {
        expect(process.env[envVar]).toBeDefined();
      });
    });
    
    it('should be in test environment', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });
  });
  
  describe('Models Validation', () => {
    it('should validate User model schema', async () => {
      const User = mongoose.model('User');
      const invalidUser = new User({});
      
      const error = invalidUser.validateSync();
      expect(error).toBeDefined();
      expect(error.errors).toHaveProperty('email');
    });
    
    it('should validate Order model schema', async () => {
      const Order = mongoose.model('Order');
      const invalidOrder = new Order({});
      
      const error = invalidOrder.validateSync();
      expect(error).toBeDefined();
    });
  });
  
  describe('Service Availability', () => {
    it('should have auth service available', () => {
      const authService = require('../../src/modules/auth/authService');
      expect(authService).toBeDefined();
      expect(typeof authService.register).toBe('function');
      expect(typeof authService.login).toBe('function');
    });
    
    it('should have order service available', () => {
      const orderService = require('../../src/modules/order/orderService');
      expect(orderService).toBeDefined();
      expect(typeof orderService.createOrder).toBe('function');
    });
    
    it('should have inventory service available', () => {
      const inventoryService = require('../../src/modules/inventory/inventoryItemService');
      expect(inventoryService).toBeDefined();
      expect(typeof inventoryService.createInventoryItem).toBe('function');
    });
    
    it('should have DynoAPI service available', () => {
      const dynoApiService = require('../../src/modules/integrations/dynoapi/dynoApiService');
      expect(dynoApiService).toBeDefined();
      expect(typeof dynoApiService.getOrders).toBe('function');
    });
  });
});
