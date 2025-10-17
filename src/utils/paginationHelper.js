/**
 * Parse pagination parameters from request
 */
const parsePaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Build pagination metadata
 */
const buildPaginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
    hasPrevious: page > 1
  };
};

/**
 * Apply pagination to Mongoose query
 */
const applyPagination = (query, page, limit) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

module.exports = {
  parsePaginationParams,
  buildPaginationMeta,
  applyPagination
};
