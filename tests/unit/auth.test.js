/**
 * Authentication Unit Tests
 */

const authService = require('../../src/modules/auth/authService');
const User = require('../../src/models/User');
const testData = require('../helpers/testData');

describe('Authentication Service', () => {
  describe('User Registration', () => {
    let tenant;
    
    beforeEach(async () => {
      tenant = await global.testUtils.createTestTenant('outlet');
    });
    
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '9876543210',
        role: 'manager',
        tenantId: tenant._id
      };
      
      const result = await authService.register(userData);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(userData.email);
    });
    
    it('should not register user with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '9876543210',
        role: 'manager',
        tenantId: tenant._id
      };
      
      await authService.register(userData);
      
      await expect(authService.register(userData))
        .rejects.toThrow('Email already registered');
    });
  });
  
  describe('User Login', () => {
    let tenant;
    let testUser;
    
    beforeEach(async () => {
      tenant = await global.testUtils.createTestTenant('outlet');
      testUser = {
        email: 'logintest@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '9876543210',
        role: 'manager',
        tenantId: tenant._id
      };
      await authService.register(testUser);
    });
    
    it('should login with correct credentials', async () => {
      const result = await authService.login(
        testUser.email,
        testUser.password
      );
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(testUser.email);
    });
    
    it('should not login with incorrect password', async () => {
      await expect(
        authService.login(testUser.email, 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
    
    it('should not login with non-existent email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toThrow('Invalid credentials');
    });
  });
  
  describe('Password Reset', () => {
    let tenant;
    let testUser;
    
    beforeEach(async () => {
      tenant = await global.testUtils.createTestTenant('outlet');
      testUser = {
        email: 'resettest@example.com',
        password: 'Password123!',
        firstName: 'Reset',
        lastName: 'Test',
        phone: '9876543210',
        role: 'manager',
        tenantId: tenant._id
      };
      await authService.register(testUser);
    });
    
    it('should generate password reset token', async () => {
      const result = await authService.forgotPassword(testUser.email);
      
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('reset');
    });
    
    it('should handle non-existent email gracefully', async () => {
      const result = await authService.forgotPassword('nonexistent@example.com');
      
      expect(result).toHaveProperty('message');
    });
  });
});
