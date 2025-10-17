/**
 * Format success response
 */
const successResponse = (data, message = 'Success', meta = null) => {
  const response = {
    success: true,
    message,
    data
  };
  
  if (meta) {
    response.meta = meta;
  }
  
  return response;
};

/**
 * Format error response
 */
const errorResponse = (code, message, details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date()
    }
  };
  
  if (details) {
    response.error.details = details;
  }
  
  return response;
};

/**
 * Format paginated response
 */
const paginatedResponse = (data, page, limit, total) => {
  return {
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
