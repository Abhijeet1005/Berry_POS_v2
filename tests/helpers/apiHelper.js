/**
 * API Test Helper
 * Provides utilities for API testing
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');

class ApiHelper {
  constructor(app) {
    this.app = app;
    this.token = null;
    this.userId = null;
  }
  
  /**
   * Generate JWT token for testing
   */
  generateToken(userId, role = 'admin', tenantId = null) {
    return jwt.sign(
      { userId, role, tenantId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
  
  /**
   * Set authentication token
   */
  setAuth(token, userId) {
    this.token = token;
    this.userId = userId;
    return this;
  }
  
  /**
   * GET request with auth
   */
  get(url) {
    const req = request(this.app).get(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }
  
  /**
   * POST request with auth
   */
  post(url, data = {}) {
    const req = request(this.app)
      .post(url)
      .send(data);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }
  
  /**
   * PUT request with auth
   */
  put(url, data = {}) {
    const req = request(this.app)
      .put(url)
      .send(data);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }
  
  /**
   * DELETE request with auth
   */
  delete(url) {
    const req = request(this.app).delete(url);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }
  
  /**
   * PATCH request with auth
   */
  patch(url, data = {}) {
    const req = request(this.app)
      .patch(url)
      .send(data);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }
  
  /**
   * Expect success response
   */
  expectSuccess(response, statusCode = 200) {
    expect(response.status).toBe(statusCode);
    expect(response.body).toHaveProperty('success', true);
    return response.body;
  }
  
  /**
   * Expect error response
   */
  expectError(response, statusCode = 400) {
    expect(response.status).toBe(statusCode);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    return response.body;
  }
}

module.exports = ApiHelper;
