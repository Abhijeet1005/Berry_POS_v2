/**
 * Authentication Unit Tests
 */

const authService = require('../../src/modules/auth/authService');
const User = require('../../src/models/User');
const testData = require('../helpers/testData');

describe('Authentication Service', () => {
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = { ...testData.validUser };
      const user = await authService.register(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });
    
    it('should not register user with duplicate email', async () => {
      const userData = { ...testData.validUser };
      await authService.register(userData);
      
      await expect(authService.register(userData))
        .rejects.toThrow();
    });
    
    it('should validate email format', async () => {
      const userData = { ...testData.validUser, email: 'invalid-email' };
      
      await expect(authService.register(userData))
        .rejects.toThrow();
    });
  });
  
  describe('User Login', () => {
    beforeEach(async () => {
      await authService.register(testData.validUser);
    });
    
    it('should login with correct credentials', async () => {
      const result = await authService.login(
        testData.validUser.email,
        testData.validUser.password
      );
      
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
    });
    
    it('should not login with incorrect password', async () => {
      await expect(
        authService.login(testData.validUser.email, 'wrongpassword')
      ).rejects.toThrow();
    });
    
    it('should not login with non-existent email', async () => {
      await expect(
        authService.login('nonexistent@example.com', 'password')
      ).rejects.toThrow();
    });
  });
  
  describe('Token Management', () => {
    let user;
    
    beforeEach(async () => {
      user = await authService.register(testData.validUser);
    });
    
    it('should generate valid JWT token', () => {
      const token = authService.generateToken(user._id, user.role);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
    
    it('should verify valid token', () => {
      const token = authService.generateToken(user._id, user.role);
      const decoded = authService.verifyToken(token);
      
      expect(decoded).toHaveProperty('userId');
      expect(decoded.userId).toBe(user._id.toString());
    });
    
    it('should reject invalid token', () => {
      expect(() => authService.verifyToken('invalid-token'))
        .toThrow();
    });
  });
});
