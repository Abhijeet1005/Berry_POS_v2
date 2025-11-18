const axios = require('axios');
const logger = require('../../../utils/logger');

class DynoApiClient {
  constructor() {
    this.baseURL = process.env.DYNOAPI_BASE_URL || 'https://api.dynoapi.com';
    this.apiKey = process.env.DYNOAPI_API_KEY;
    this.enabled = process.env.DYNOAPI_ENABLED === 'true';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`DynoAPI Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('DynoAPI Request Error:', error);
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`DynoAPI Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        logger.error('DynoAPI Response Error:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Check if DynoAPI is enabled
   */
  isEnabled() {
    return this.enabled && this.apiKey;
  }
  
  /**
   * Make a GET request
   */
  async get(endpoint, params = {}) {
    if (!this.isEnabled()) {
      throw new Error('DynoAPI is not enabled or API key is missing');
    }
    
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  /**
   * Make a POST request
   */
  async post(endpoint, data = {}, params = {}) {
    if (!this.isEnabled()) {
      throw new Error('DynoAPI is not enabled or API key is missing');
    }
    
    try {
      const response = await this.client.post(endpoint, data, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || error.response.data?.detail || 'DynoAPI request failed';
      throw new Error(`DynoAPI Error (${error.response.status}): ${message}`);
    } else if (error.request) {
      // Request made but no response
      throw new Error('DynoAPI: No response received from server');
    } else {
      // Error in request setup
      throw new Error(`DynoAPI: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new DynoApiClient();
