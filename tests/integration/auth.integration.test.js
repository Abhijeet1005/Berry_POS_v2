/**
 * Authentication Integration Tests
 * Tests complete auth workflows via API
 */

const request = require('supertest');
const app = require('../../src/app');
const testData = require('../helpers/testData');
const ApiHelper = require('../helpers/apiHelper');

describe('Authentication API Integration', () => {
  let api;
  
  beforeEach(() => {
    api = new ApiHelper(app);
  });
  
  describe('POST /api/v1/auth/register', () => {
    it('should register new user successfully', async () => {
      const response = await api.post('/api/v1/auth/register', testData.validUser);
      
      api.expectSuccess(response, 201);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testData.validUser.email);
    });
    
    it('should return 400 for invalid email', async () => {
      const invalidData = { ...testData.validUser, email: 'invalid-email' };
      const response = await api.post('/api/v1/auth/register', invalidData);
      
      api.expectError(response, 400);
    });
    
    it('should return 400 for missing required fields', async () => {
      const response = await api.post('/api/v1/auth/register', { email: 'test@test.com' });
      
      api.expectError(response, 400);
    });
    
    it('should return 409 for duplicate email', async () => {
      await api.post('/api/v1/auth/register', testData.validUser);
      const response = await api.post('/api/v1/auth/register', testData.validUser);
      
      expect(response.status).toBe(409);
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await api.post('/api/v1/auth/register', testData.validUser);
    });
    
    it('should login with correct credentials', async () => {
      const response = await api.post('/api/v1/auth/login', {
        email: testData.validUser.email,
        password: testData.validUser.password
      });
      
      api.expectSuccess(response, 200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('refreshToken');
    });
    
    it('should return 401 for incorrect password', async () => {
      const response = await api.post('/api/v1/auth/login', {
        email: testData.validUser.email,
        password: 'wrongpassword'
      });
      
      api.expectError(response, 401);
    });
    
    it('should return 401 for non-existent user', async () => {
      const response = await api.post('/api/v1/auth/login', {
        email: 'nonexistent@example.com',
        password: 'password'
      });
      
      api.expectError(response, 401);
    });
  });
  
  describe('GET /api/v1/auth/me', () => {
    let token, userId;
    
    beforeEach(async () => {
      const registerResponse = await api.post('/api/v1/auth/register', testData.validUser);
      token = registerResponse.body.data.token;
      userId = registerResponse.body.data.user._id;
      api.setAuth(token, userId);
    });
    
    it('should get current user with valid token', async () => {
      const response = await api.get('/api/v1/auth/me');
      
      api.expectSuccess(response, 200);
      expect(response.body.data.email).toBe(testData.validUser.email);
    });
    
    it('should return 401 without token', async () => {
      api.setAuth(null, null);
      const response = await api.get('/api/v1/auth/me');
      
      api.expectError(response, 401);
    });
    
    it('should return 401 with invalid token', async () => {
      api.setAuth('invalid-token', userId);
      const response = await api.get('/api/v1/auth/me');
      
      api.expectError(response, 401);
    });
  });
  
  describe('POST /api/v1/auth/refresh-token', () => {
    let refreshToken;
    
    beforeEach(async () => {
      const registerResponse = await api.post('/api/v1/auth/register', testData.validUser);
      refreshToken = registerResponse.body.data.refreshToken;
    });
    
    it('should refresh token with valid refresh token', async () => {
      const response = await api.post('/api/v1/auth/refresh-token', { refreshToken });
      
      api.expectSuccess(response, 200);
      expect(response.body.data).toHaveProperty('token');
    });
    
    it('should return 401 with invalid refresh token', async () => {
      const response = await api.post('/api/v1/auth/refresh-token', {
        refreshToken: 'invalid-token'
      });
      
      api.expectError(response, 401);
    });
  });
  
  describe('POST /api/v1/auth/logout', () => {
    let token, userId;
    
    beforeEach(async () => {
      const registerResponse = await api.post('/api/v1/auth/register', testData.validUser);
      token = registerResponse.body.data.token;
      userId = registerResponse.body.data.user._id;
      api.setAuth(token, userId);
    });
    
    it('should logout successfully', async () => {
      const response = await api.post('/api/v1/auth/logout');
      
      api.expectSuccess(response, 200);
    });
  });
});
