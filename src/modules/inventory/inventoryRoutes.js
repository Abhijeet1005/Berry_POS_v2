const express = require('express');
const router = express.Router();
const inventoryController = require('./inventoryController');
const { authenticate } = require('../../middleware/authMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const { requirePermission } = require('../../middleware/rbacMiddleware');
const { validate, validateObjectId } = require('../../middleware/validationMiddleware');
const inventoryValidation = require('./inventoryValidation');

// Apply authentication and tenant context to all routes
router.use(authenticate);
router.use(injectTenantContext);

// Inventory Items Routes
router.post(
  '/items',
  requirePermission('inventory.create'),
  validate(inventoryValidation.createInventoryItem),
  inventoryController.createInventoryItem
);

router.get(
  '/items',
  requirePermission('inventory.read'),
  validate(inventoryValidation.getInventoryItems, 'query'),
  inventoryController.getInventoryItems
);

router.get(
  '/items/low-stock',
  requirePermission('inventory.read'),
  inventoryController.getLowStockItems
);

router.get(
  '/items/reorder',
  requirePermission('inventory.read'),
  inventoryController.getReorderItems
);

router.get(
  '/items/valuation',
  requirePermission('inventory.read'),
  inventoryController.getInventoryValuation
);

router.get(
  '/items/:id',
  requirePermission('inventory.read'),
  validateObjectId('id'),
  inventoryController.getInventoryItem
);

router.put(
  '/items/:id',
  requirePermission('inventory.update'),
  validateObjectId('id'),
  validate(inventoryValidation.updateInventoryItem),
  inventoryController.updateInventoryItem
);

router.delete(
  '/items/:id',
  requirePermission('inventory.delete'),
  validateObjectId('id'),
  inventoryController.deleteInventoryItem
);

router.patch(
  '/items/:id/stock',
  requirePermission('inventory.update'),
  validateObjectId('id'),
  validate(inventoryValidation.updateStock),
  inventoryController.updateStock
);

// Supplier Routes
router.post(
  '/suppliers',
  requirePermission('suppliers.create'),
  validate(inventoryValidation.createSupplier),
  inventoryController.createSupplier
);

router.get(
  '/suppliers',
  requirePermission('suppliers.read'),
  validate(inventoryValidation.getSuppliers, 'query'),
  inventoryController.getSuppliers
);

router.get(
  '/suppliers/:id',
  requirePermission('suppliers.read'),
  validateObjectId('id'),
  inventoryController.getSupplier
);

router.put(
  '/suppliers/:id',
  requirePermission('suppliers.update'),
  validateObjectId('id'),
  validate(inventoryValidation.updateSupplier),
  inventoryController.updateSupplier
);

router.delete(
  '/suppliers/:id',
  requirePermission('suppliers.delete'),
  validateObjectId('id'),
  inventoryController.deleteSupplier
);

router.patch(
  '/suppliers/:id/rating',
  requirePermission('suppliers.update'),
  validateObjectId('id'),
  validate(inventoryValidation.updateSupplierRating),
  inventoryController.updateSupplierRating
);

router.get(
  '/suppliers/:id/performance',
  requirePermission('suppliers.read'),
  validateObjectId('id'),
  inventoryController.getSupplierPerformance
);

// Recipe Routes
router.post(
  '/recipes',
  requirePermission('recipes.create'),
  validate(inventoryValidation.createRecipe),
  inventoryController.createRecipe
);

router.get(
  '/recipes',
  requirePermission('recipes.read'),
  validate(inventoryValidation.getRecipes, 'query'),
  inventoryController.getRecipes
);

router.get(
  '/recipes/dish/:dishId',
  requirePermission('recipes.read'),
  validateObjectId('dishId'),
  inventoryController.getRecipeByDish
);

router.get(
  '/recipes/:id',
  requirePermission('recipes.read'),
  validateObjectId('id'),
  inventoryController.getRecipe
);

router.put(
  '/recipes/:id',
  requirePermission('recipes.update'),
  validateObjectId('id'),
  validate(inventoryValidation.updateRecipe),
  inventoryController.updateRecipe
);

router.delete(
  '/recipes/:id',
  requirePermission('recipes.delete'),
  validateObjectId('id'),
  inventoryController.deleteRecipe
);

router.get(
  '/recipes/:id/availability',
  requirePermission('recipes.read'),
  validateObjectId('id'),
  validate(inventoryValidation.checkRecipeAvailability, 'query'),
  inventoryController.checkRecipeAvailability
);

router.get(
  '/recipes/:id/cost',
  requirePermission('recipes.read'),
  validateObjectId('id'),
  inventoryController.calculateRecipeCost
);

// Purchase Order Routes
router.post(
  '/purchase-orders',
  requirePermission('purchase-orders.create'),
  validate(inventoryValidation.createPurchaseOrder),
  inventoryController.createPurchaseOrder
);

router.get(
  '/purchase-orders',
  requirePermission('purchase-orders.read'),
  validate(inventoryValidation.getPurchaseOrders, 'query'),
  inventoryController.getPurchaseOrders
);

router.get(
  '/purchase-orders/:id',
  requirePermission('purchase-orders.read'),
  validateObjectId('id'),
  inventoryController.getPurchaseOrder
);

router.put(
  '/purchase-orders/:id',
  requirePermission('purchase-orders.update'),
  validateObjectId('id'),
  validate(inventoryValidation.updatePurchaseOrder),
  inventoryController.updatePurchaseOrder
);

router.delete(
  '/purchase-orders/:id',
  requirePermission('purchase-orders.delete'),
  validateObjectId('id'),
  inventoryController.deletePurchaseOrder
);

router.post(
  '/purchase-orders/:id/submit',
  requirePermission('purchase-orders.update'),
  validateObjectId('id'),
  inventoryController.submitPurchaseOrder
);

router.post(
  '/purchase-orders/:id/approve',
  requirePermission('purchase-orders.approve'),
  validateObjectId('id'),
  inventoryController.approvePurchaseOrder
);

router.post(
  '/purchase-orders/:id/order',
  requirePermission('purchase-orders.update'),
  validateObjectId('id'),
  inventoryController.markPurchaseOrderAsOrdered
);

router.post(
  '/purchase-orders/:id/receive',
  requirePermission('purchase-orders.update'),
  validateObjectId('id'),
  validate(inventoryValidation.receiveGoods),
  inventoryController.receiveGoods
);

router.post(
  '/purchase-orders/:id/cancel',
  requirePermission('purchase-orders.update'),
  validateObjectId('id'),
  inventoryController.cancelPurchaseOrder
);

// Stock Movement Routes
router.get(
  '/movements',
  requirePermission('inventory.read'),
  validate(inventoryValidation.getStockMovements, 'query'),
  inventoryController.getStockMovements
);

router.get(
  '/movements/item/:itemId',
  requirePermission('inventory.read'),
  validateObjectId('itemId'),
  validate(inventoryValidation.getMovementsByItem, 'query'),
  inventoryController.getMovementsByItem
);

router.get(
  '/movements/summary',
  requirePermission('inventory.read'),
  inventoryController.getMovementSummary
);

// Stock Adjustment Routes
router.post(
  '/adjustments',
  requirePermission('stock-adjustments.create'),
  validate(inventoryValidation.createStockAdjustment),
  inventoryController.createStockAdjustment
);

router.get(
  '/adjustments',
  requirePermission('stock-adjustments.read'),
  validate(inventoryValidation.getStockAdjustments, 'query'),
  inventoryController.getStockAdjustments
);

router.get(
  '/adjustments/:id',
  requirePermission('stock-adjustments.read'),
  validateObjectId('id'),
  inventoryController.getStockAdjustment
);

router.put(
  '/adjustments/:id',
  requirePermission('stock-adjustments.update'),
  validateObjectId('id'),
  validate(inventoryValidation.updateStockAdjustment),
  inventoryController.updateStockAdjustment
);

router.post(
  '/adjustments/:id/approve',
  requirePermission('stock-adjustments.approve'),
  validateObjectId('id'),
  inventoryController.approveStockAdjustment
);

router.post(
  '/adjustments/:id/reject',
  requirePermission('stock-adjustments.approve'),
  validateObjectId('id'),
  validate(inventoryValidation.rejectStockAdjustment),
  inventoryController.rejectStockAdjustment
);

router.get(
  '/adjustments/summary',
  requirePermission('stock-adjustments.read'),
  inventoryController.getAdjustmentSummary
);

module.exports = router;

