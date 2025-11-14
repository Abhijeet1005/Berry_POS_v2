const inventoryItemService = require('./inventoryItemService');
const supplierService = require('./supplierService');
const recipeService = require('./recipeService');
const purchaseOrderService = require('./purchaseOrderService');
const stockMovementService = require('./stockMovementService');
const stockAdjustmentService = require('./stockAdjustmentService');
const { successResponse, paginatedResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

// Inventory Item Controllers

const createInventoryItem = asyncHandler(async (req, res) => {
  const item = await inventoryItemService.createInventoryItem(req.body, req.tenantId);
  res.status(201).json(successResponse(item, 'Inventory item created successfully'));
});

const getInventoryItems = asyncHandler(async (req, res) => {
  const result = await inventoryItemService.getInventoryItems(req.query, req.tenantId);
  res.json(paginatedResponse(result.items, result.pagination.page, result.pagination.limit, result.pagination.total));
});

const getInventoryItem = asyncHandler(async (req, res) => {
  const item = await inventoryItemService.getInventoryItemById(req.params.id, req.tenantId);
  res.json(successResponse(item, 'Inventory item retrieved successfully'));
});

const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await inventoryItemService.updateInventoryItem(req.params.id, req.body, req.tenantId);
  res.json(successResponse(item, 'Inventory item updated successfully'));
});

const deleteInventoryItem = asyncHandler(async (req, res) => {
  const result = await inventoryItemService.deleteInventoryItem(req.params.id, req.tenantId);
  res.json(successResponse(result, 'Inventory item deleted successfully'));
});

const updateStock = asyncHandler(async (req, res) => {
  const { quantity, operation } = req.body;
  const item = await inventoryItemService.updateStock(req.params.id, quantity, operation, req.tenantId);
  res.json(successResponse(item, 'Stock updated successfully'));
});

const getLowStockItems = asyncHandler(async (req, res) => {
  const items = await inventoryItemService.getLowStockItems(req.query.outletId, req.tenantId);
  res.json(successResponse(items, 'Low stock items retrieved successfully'));
});

const getReorderItems = asyncHandler(async (req, res) => {
  const items = await inventoryItemService.getReorderItems(req.query.outletId, req.tenantId);
  res.json(successResponse(items, 'Reorder items retrieved successfully'));
});

const getInventoryValuation = asyncHandler(async (req, res) => {
  const valuation = await inventoryItemService.getInventoryValuation(req.query.outletId, req.tenantId);
  res.json(successResponse(valuation, 'Inventory valuation retrieved successfully'));
});

// Supplier Controllers

const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.createSupplier(req.body, req.tenantId);
  res.status(201).json(successResponse(supplier, 'Supplier created successfully'));
});

const getSuppliers = asyncHandler(async (req, res) => {
  const result = await supplierService.getSuppliers(req.query, req.tenantId);
  res.json(paginatedResponse(result.suppliers, result.pagination.page, result.pagination.limit, result.pagination.total));
});

const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.getSupplierById(req.params.id, req.tenantId);
  res.json(successResponse(supplier, 'Supplier retrieved successfully'));
});

const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.updateSupplier(req.params.id, req.body, req.tenantId);
  res.json(successResponse(supplier, 'Supplier updated successfully'));
});

const deleteSupplier = asyncHandler(async (req, res) => {
  const result = await supplierService.deleteSupplier(req.params.id, req.tenantId);
  res.json(successResponse(result, 'Supplier deleted successfully'));
});

const updateSupplierRating = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  const supplier = await supplierService.updateSupplierRating(req.params.id, rating, req.tenantId);
  res.json(successResponse(supplier, 'Supplier rating updated successfully'));
});

const getSupplierPerformance = asyncHandler(async (req, res) => {
  const performance = await supplierService.getSupplierPerformance(req.params.id, req.tenantId);
  res.json(successResponse(performance, 'Supplier performance retrieved successfully'));
});

// Recipe Controllers

const createRecipe = asyncHandler(async (req, res) => {
  const recipe = await recipeService.createRecipe(req.body, req.tenantId);
  res.status(201).json(successResponse(recipe, 'Recipe created successfully'));
});

const getRecipes = asyncHandler(async (req, res) => {
  const recipes = await recipeService.getRecipes(req.query, req.tenantId);
  res.json(successResponse(recipes, 'Recipes retrieved successfully'));
});

const getRecipe = asyncHandler(async (req, res) => {
  const recipe = await recipeService.getRecipeById(req.params.id, req.tenantId);
  res.json(successResponse(recipe, 'Recipe retrieved successfully'));
});

const getRecipeByDish = asyncHandler(async (req, res) => {
  const recipe = await recipeService.getRecipeByDishId(req.params.dishId, req.query.outletId, req.tenantId);
  res.json(successResponse(recipe, 'Recipe retrieved successfully'));
});

const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await recipeService.updateRecipe(req.params.id, req.body, req.tenantId);
  res.json(successResponse(recipe, 'Recipe updated successfully'));
});

const deleteRecipe = asyncHandler(async (req, res) => {
  const result = await recipeService.deleteRecipe(req.params.id, req.tenantId);
  res.json(successResponse(result, 'Recipe deleted successfully'));
});

const checkRecipeAvailability = asyncHandler(async (req, res) => {
  const { quantity } = req.query;
  const availability = await recipeService.checkRecipeAvailability(req.params.id, parseInt(quantity) || 1, req.tenantId);
  res.json(successResponse(availability, 'Recipe availability checked successfully'));
});

const calculateRecipeCost = asyncHandler(async (req, res) => {
  const cost = await recipeService.calculateRecipeCost(req.params.id, req.tenantId);
  res.json(successResponse(cost, 'Recipe cost calculated successfully'));
});

// Purchase Order Controllers

const createPurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.createPurchaseOrder(req.body, req.tenantId, req.userId);
  res.status(201).json(successResponse(po, 'Purchase order created successfully'));
});

const getPurchaseOrders = asyncHandler(async (req, res) => {
  const result = await purchaseOrderService.getPurchaseOrders(req.query, req.tenantId);
  res.json(paginatedResponse(result.purchaseOrders, result.pagination.page, result.pagination.limit, result.pagination.total));
});

const getPurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.getPurchaseOrderById(req.params.id, req.tenantId);
  res.json(successResponse(po, 'Purchase order retrieved successfully'));
});

const updatePurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.updatePurchaseOrder(req.params.id, req.body, req.tenantId);
  res.json(successResponse(po, 'Purchase order updated successfully'));
});

const deletePurchaseOrder = asyncHandler(async (req, res) => {
  const result = await purchaseOrderService.deletePurchaseOrder(req.params.id, req.tenantId);
  res.json(successResponse(result, 'Purchase order deleted successfully'));
});

const approvePurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.approvePurchaseOrder(req.params.id, req.tenantId, req.userId);
  res.json(successResponse(po, 'Purchase order approved successfully'));
});

const submitPurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.submitPurchaseOrder(req.params.id, req.tenantId);
  res.json(successResponse(po, 'Purchase order submitted successfully'));
});

const markPurchaseOrderAsOrdered = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.markAsOrdered(req.params.id, req.tenantId);
  res.json(successResponse(po, 'Purchase order marked as ordered successfully'));
});

const receiveGoods = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const po = await purchaseOrderService.receiveGoods(req.params.id, items, req.tenantId);
  res.json(successResponse(po, 'Goods received successfully'));
});

const cancelPurchaseOrder = asyncHandler(async (req, res) => {
  const po = await purchaseOrderService.cancelPurchaseOrder(req.params.id, req.tenantId);
  res.json(successResponse(po, 'Purchase order cancelled successfully'));
});

// Stock Movement Controllers

const getStockMovements = asyncHandler(async (req, res) => {
  const result = await stockMovementService.getStockMovements(req.query, req.tenantId);
  res.json(paginatedResponse(result.movements, result.pagination.page, result.pagination.limit, result.pagination.total));
});

const getMovementsByItem = asyncHandler(async (req, res) => {
  const result = await stockMovementService.getMovementsByItem(req.params.itemId, req.query, req.tenantId);
  res.json(paginatedResponse(result.movements, result.pagination.page, result.pagination.limit, result.pagination.total));
});

const getMovementSummary = asyncHandler(async (req, res) => {
  const summary = await stockMovementService.getMovementSummary(req.query, req.tenantId);
  res.json(successResponse(summary, 'Stock movement summary retrieved successfully'));
});

// Stock Adjustment Controllers

const createStockAdjustment = asyncHandler(async (req, res) => {
  const adjustment = await stockAdjustmentService.createStockAdjustment(req.body, req.tenantId, req.userId);
  res.status(201).json(successResponse(adjustment, 'Stock adjustment created successfully'));
});

const getStockAdjustments = asyncHandler(async (req, res) => {
  const result = await stockAdjustmentService.getStockAdjustments(req.query, req.tenantId);
  res.json(paginatedResponse(result.adjustments, result.pagination.page, result.pagination.limit, result.pagination.total));
});

const getStockAdjustment = asyncHandler(async (req, res) => {
  const adjustment = await stockAdjustmentService.getStockAdjustmentById(req.params.id, req.tenantId);
  res.json(successResponse(adjustment, 'Stock adjustment retrieved successfully'));
});

const updateStockAdjustment = asyncHandler(async (req, res) => {
  const adjustment = await stockAdjustmentService.updateStockAdjustment(req.params.id, req.body, req.tenantId);
  res.json(successResponse(adjustment, 'Stock adjustment updated successfully'));
});

const approveStockAdjustment = asyncHandler(async (req, res) => {
  const adjustment = await stockAdjustmentService.approveStockAdjustment(req.params.id, req.tenantId, req.userId);
  res.json(successResponse(adjustment, 'Stock adjustment approved successfully'));
});

const rejectStockAdjustment = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const adjustment = await stockAdjustmentService.rejectStockAdjustment(req.params.id, reason, req.tenantId, req.userId);
  res.json(successResponse(adjustment, 'Stock adjustment rejected successfully'));
});

const getAdjustmentSummary = asyncHandler(async (req, res) => {
  const summary = await stockAdjustmentService.getAdjustmentSummary(req.query, req.tenantId);
  res.json(successResponse(summary, 'Adjustment summary retrieved successfully'));
});

module.exports = {
  // Inventory items
  createInventoryItem,
  getInventoryItems,
  getInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateStock,
  getLowStockItems,
  getReorderItems,
  getInventoryValuation,
  
  // Suppliers
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
  updateSupplierRating,
  getSupplierPerformance,
  
  // Recipes
  createRecipe,
  getRecipes,
  getRecipe,
  getRecipeByDish,
  updateRecipe,
  deleteRecipe,
  checkRecipeAvailability,
  calculateRecipeCost,
  
  // Purchase orders
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  approvePurchaseOrder,
  submitPurchaseOrder,
  markPurchaseOrderAsOrdered,
  receiveGoods,
  cancelPurchaseOrder,
  
  // Stock movements
  getStockMovements,
  getMovementsByItem,
  getMovementSummary,
  
  // Stock adjustments
  createStockAdjustment,
  getStockAdjustments,
  getStockAdjustment,
  updateStockAdjustment,
  approveStockAdjustment,
  rejectStockAdjustment,
  getAdjustmentSummary
};
