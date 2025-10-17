const tableService = require('./tableService');
const { successResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Create table
 * POST /api/v1/tables
 */
const createTable = asyncHandler(async (req, res) => {
  const table = await tableService.createTable(req.body, req.tenantId);
  
  res.status(201).json(successResponse(table, 'Table created successfully'));
});

/**
 * Get all tables
 * GET /api/v1/tables
 */
const getTables = asyncHandler(async (req, res) => {
  const tables = await tableService.getTables(req.query, req.tenantId);
  
  res.json(successResponse(tables, 'Tables retrieved successfully'));
});

/**
 * Get table by ID
 * GET /api/v1/tables/:id
 */
const getTable = asyncHandler(async (req, res) => {
  const table = await tableService.getTableById(req.params.id, req.tenantId);
  
  res.json(successResponse(table, 'Table retrieved successfully'));
});

/**
 * Update table
 * PUT /api/v1/tables/:id
 */
const updateTable = asyncHandler(async (req, res) => {
  const table = await tableService.updateTable(req.params.id, req.body, req.tenantId);
  
  res.json(successResponse(table, 'Table updated successfully'));
});

/**
 * Delete table
 * DELETE /api/v1/tables/:id
 */
const deleteTable = asyncHandler(async (req, res) => {
  const result = await tableService.deleteTable(req.params.id, req.tenantId);
  
  res.json(successResponse(result, 'Table deleted successfully'));
});

/**
 * Update table status
 * PATCH /api/v1/tables/:id/status
 */
const updateTableStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const table = await tableService.updateTableStatus(req.params.id, status, req.tenantId);
  
  res.json(successResponse(table, 'Table status updated successfully'));
});

/**
 * Transfer order between tables
 * POST /api/v1/tables/transfer
 */
const transferOrder = asyncHandler(async (req, res) => {
  const { fromTableId, toTableId } = req.body;
  const result = await tableService.transferOrder(fromTableId, toTableId, req.tenantId);
  
  res.json(successResponse(result, 'Order transferred successfully'));
});

/**
 * Merge tables
 * POST /api/v1/tables/merge
 */
const mergeTables = asyncHandler(async (req, res) => {
  const { tableIds } = req.body;
  const result = await tableService.mergeTables(tableIds, req.tenantId);
  
  res.json(successResponse(result, 'Tables merged successfully'));
});

/**
 * Get table QR code
 * GET /api/v1/tables/:id/qr
 */
const getTableQRCode = asyncHandler(async (req, res) => {
  const table = await tableService.getTableById(req.params.id, req.tenantId);
  
  res.json(successResponse({ qrCode: table.qrCode }, 'QR code retrieved successfully'));
});

/**
 * Regenerate table QR code
 * POST /api/v1/tables/:id/qr
 */
const regenerateQRCode = asyncHandler(async (req, res) => {
  const table = await tableService.regenerateQRCode(req.params.id, req.tenantId);
  
  res.json(successResponse({ qrCode: table.qrCode }, 'QR code regenerated successfully'));
});

module.exports = {
  createTable,
  getTables,
  getTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  transferOrder,
  mergeTables,
  getTableQRCode,
  regenerateQRCode
};
