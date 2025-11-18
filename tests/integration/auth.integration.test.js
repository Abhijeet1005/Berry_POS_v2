/**
 * Authentication Integration Tests
 * Tests complete auth workflows
 */

const authService = require('../../src/modules/auth/authService');
const User = require('../../src/models/User');

describe('Authentication Integration', () => {
  let tenant;
  
  beforeEach(async () => {
    tenant = await global.testUtils.createTestTenant('outlet');
  });
  
  describe('Complete Registration Flow', () => {
    it('should register and return tokens', async () => {
      const userData = {
        email: 'integration@example.com',
        password: 'Password123!',
        firstName: 'Integration',
        lastName: 'Test',
        phone: '9876543210',
        role: 'manager',
        tenantId: tenant._id
      };
      
      const result = await authService.register(userData);
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(userData.email);
    });
  });
  
  describe('Complete Login Flow', () => {
    let testUser;
    
    beforeEach(async () => {
      testUser = {
        email: 'loginflow@example.com',
        password: 'Password123!',
        firstName: 'Login',
        lastName: 'Flow',
        phone: '9876543210',
        role: 'manager',
        tenantId: tenant._id
      };
      await authService.register(testUser);
    });
    
    it('should login and return valid tokens', async () => {
      const result = await authService.login(testUser.email, testUser.password);
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(testUser.email);
    });
    
    it('should update last login time', async () => {
      await authService.login(testUser.email, testUser.password);
      
      const user = await User.findOne({ email: testUser.email });
      expect(user.lastLogin).toBeDefined();
    });
  });
  
  describe('Token Refresh Flow', () => {
    let refreshToken;
    
    beforeEach(async () => {
      const userData = {
        email: 'refresh@example.com',
        password: 'Password123!',
        firstName: 'Refresh',
        lastName: 'Test',
        phone: '9876543210',
        role: 'manager',
        tenantId: tenant._id
      };
      
      const result = await authService.register(userData);
      refreshToken = result.tokens.refreshToken;
    });
    
    it('should refresh access token', async () => {
      const newTokens = await authService.refreshToken(refreshToken);
      
      expect(newTokens).toHaveProperty('accessToken');
      expect(newTokens).toHaveProperty('refreshToken');
    });
  });
  
  describe('Password Reset Flow', () => {
    let testUser;
    
    beforeEach(async () => {
      testUser = {
        email: 'resetflow@example.com',
        password: 'Password123!',
        firstName: 'Reset',
        lastName: 'Flow',
        phone: '9876543210',
        role: 'manager',
        tenantId: tenant._id
      };
      await authService.register(testUser);
    });
    
    it('should complete password reset flow', async () => {
      // Request reset
      const resetResult = await authService.forgotPassword(testUser.email);
      expect(resetResult).toHaveProperty('message');
      
      // In production, resetToken would come from email
      if (resetResult.resetToken) {
        // Reset password
        const result = await authService.resetPassword(
          resetResult.resetToken,
          'NewPassword123!'
        );
        expect(result).toHaveProperty('message');
        
        // Login with new password
        const loginResult = await authService.login(testUser.email, 'NewPassword123!');
        expect(loginResult).toHaveProperty('user');
      }
    });
  });
});
