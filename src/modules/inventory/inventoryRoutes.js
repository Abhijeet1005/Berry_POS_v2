const express = require('express');
const router = express.Router();
const inventoryController = require('./inventoryController');
const { authenticate } = require('../../middleware/authMiddleware');
const { injectTenantContext } = require('../../middleware/tenantMiddleware');
const { authorize } = require('../../middleware/rbacMiddleware');
const { validate, validateObjectId } = require('../../middleware/validationMiddleware');
const inventoryValidation = require('./inventoryValidation');

// Apply authentication and tenant context to all routes
router.use(authenticate);
router.use(injectTenantContext);

// Inventory Items Routes
router.post(
  '/items',
  authorize(['inventory.create']),
  validate(inventoryValidation.createInventoryItem),
  inventoryController.createInventoryItem
);

router.get(
  '/items',
  authorize(['inventory.read']),
  validate(inventoryValidation.getInventoryItems, 'query'),
  inventoryController.getInventoryItems
);

router.get(
  '/items/low-stock',
  authorize(['inventory.read']),
  inventoryController.getLowStockItems
);

router.get(
  '/items/reorder',
  authorize(['inventory.read']),
  inventoryController.getReorderItems
);

router.get(
  '/items/valuation',
  authorize(['inventory.read']),
  inventoryController.getInventoryValuation
);

router.get(
  '/items/:id',
  authorize(['inventory.read']),
  validateObjectId('id'),
  inventoryController.getInventoryItem
);

router.put(
  '/items/:id',
  authorize(['inventory.update']),
  validateObjectId('id'),
  validate(inventoryValidation.updateInventoryItem),
  inventoryController.updateInventoryItem
);

router.delete(
  '/items/:id',
  authorize(['inventory.delete']),
  validateObjectId('id'),
  inventoryController.deleteInventoryItem
);

router.patch(
  '/items/:id/stock',
  authorize(['inventory.update']),
  validateObjectId('id'),
  validate(inventoryValidation.updateStock),
  inventoryController.updateStock
);

// Supplier Routes
router.post(
  '/suppliers',
  authorize(['suppliers.create']),
  validate(inventoryValidation.createSupplier),
  inventoryController.createSupplier
);

router.get(
  '/suppliers',
  authorize(['suppliers.read']),
  validate(inventoryValidation.getSuppliers, 'query'),
  inventoryController.getSuppliers
);

router.get(
  '/suppliers/:id',
  authorize(['suppliers.read']),
  validateObjectId('id'),
  inventoryController.getSupplier
);

router.put(
  '/suppliers/:id',
  authorize(['suppliers.update']),
  validateObjectId('id'),
  validate(inventoryValidation.updateSupplier),
  inventoryController.updateSupplier
);

router.delete(
  '/suppliers/:id',
  authorize(['suppliers.delete']),
  validateObjectId('id'),
  inventoryController.deleteSupplier
);

router.patch(
  '/suppliers/:id/rating',
  authorize(['suppliers.update']),
  validateObjectId('id'),
  validate(inventoryValidation.updateSupplierRating),
  inventoryController.updateSupplierRating
);

router.get(
  '/suppliers/:id/performance',
  authorize(['suppliers.read']),
  validateObjectId('id'),
  inventoryController.getSupplierPerformance
);

// Recipe Routes
router.post(
  '/recipes',
  authorize(['recipes.create']),
  validate(inventoryValidation.createRecipe),
  inventoryController.createRecipe
);

router.get(
  '/recipes',
  authorize(['recipes.read']),
  validate(inventoryValidation.getRecipes, 'query'),
  inventoryController.getRecipes
);

router.get(
  '/recipes/dish/:dishId',
  authorize(['recipes.read']),
  validateObjectId('dishId'),
  inventoryController.getRecipeByDish
);

router.get(
  '/recipes/:id',
  authorize(['recipes.read']),
  validateObjectId('id'),
  inventoryController.getRecipe
);

router.put(
  '/recipes/:id',
  authorize(['recipes.update']),
  validateObjectId('id'),
  validate(inventoryValidation.updateRecipe),
  inventoryController.updateRecipe
);

router.delete(
  '/recipes/:id',
  authorize(['recipes.delete']),
  validateObjectId('id'),
  inventoryController.deleteRecipe
);

router.get(
  '/recipes/:id/availability',
  authorize(['recipes.read']),
  validateObjectId('id'),
  validate(inventoryValidation.checkRecipeAvailability, 'query'),
  inventoryController.checkRecipeAvailability
);

router.get(
  '/recipes/:id/cost',
  authorize(['recipes.read']),
  validateObjectId('id'),
  inventoryController.calculateRecipeCost
);

// Purchase Order Routes
router.post(
  '/purchase-orders',
  authorize(['purchase-orders.create']),
  validate(inventoryValidation.createPurchaseOrder),
  inventoryController.createPurchaseOrder
);

router.get(
  '/purchase-orders',
  authorize(['purchase-orders.read']),
  validate(inventoryValidation.getPurchaseOrders, 'query'),
  inventoryController.getPurchaseOrders
);

router.get(
  '/purchase-orders/:id',
  authorize(['purchase-orders.read']),
  validateObjectId('id'),
  inventoryController.getPurchaseOrder
);

router.put(
  '/purchase-orders/:id',
  authorize(['purchase-orders.update']),
  validateObjectId('id'),
  validate(inventoryValidation.updatePurchaseOrder),
  inventoryController.updatePurchaseOrder
);

router.delete(
  '/purchase-orders/:id',
  authorize(['purchase-orders.delete']),
  validateObjectId('id'),
  inventoryController.deletePurchaseOrder
);

router.post(
  '/purchase-orders/:id/submit',
  authorize(['purchase-orders.update']),
  validateObjectId('id'),
  inventoryController.submitPurchaseOrder
);

router.post(
  '/purchase-orders/:id/approve',
  authorize(['purchase-orders.approve']),
  validateObjectId('id'),
  inventoryController.approvePurchaseOrder
);

router.post(
  '/purchase-orders/:id/order',
  authorize(['purchase-orders.update']),
  validateObjectId('id'),
  inventoryController.markPurchaseOrderAsOrdered
);

router.post(
  '/purchase-orders/:id/receive',
  authorize(['purchase-orders.update']),
  validateObjectId('id'),
  validate(inventoryValidation.receiveGoods),
  inventoryController.receiveGoods
);

router.post(
  '/purchase-orders/:id/cancel',
  authorize(['purchase-orders.update']),
  validateObjectId('id'),
  inventoryController.cancelPurchaseOrder
);

// Stock Movement Routes
router.get(
  '/movements',
  authorize(['inventory.read']),
  validate(inventoryValidation.getStockMovements, 'query'),
  inventoryController.getStockMovements
);

router.get(
  '/movements/item/:itemId',
  authorize(['inventory.read']),
  validateObjectId('itemId'),
  validate(inventoryValidation.getMovementsByItem, 'query'),
  inventoryController.getMovementsByItem
);

router.get(
  '/movements/summary',
  authorize(['inventory.read']),
  inventoryController.getMovementSummary
);

// Stock Adjustment Routes
router.post(
  '/adjustments',
  authorize(['stock-adjustments.create']),
  validate(inventoryValidation.createStockAdjustment),
  inventoryController.createStockAdjustment
);

router.get(
  '/adjustments',
  authorize(['stock-adjustments.read']),
  validate(inventoryValidation.getStockAdjustments, 'query'),
  inventoryController.getStockAdjustments
);

router.get(
  '/adjustments/:id',
  authorize(['stock-adjustments.read']),
  validateObjectId('id'),
  inventoryController.getStockAdjustment
);

router.put(
  '/adjustments/:id',
  authorize(['stock-adjustments.update']),
  validateObjectId('id'),
  validate(inventoryValidation.updateStockAdjustment),
  inventoryController.updateStockAdjustment
);

router.post(
  '/adjustments/:id/approve',
  authorize(['stock-adjustments.approve']),
  validateObjectId('id'),
  inventoryController.approveStockAdjustment
);

router.post(
  '/adjustments/:id/reject',
  authorize(['stock-adjustments.approve']),
  validateObjectId('id'),
  validate(inventoryValidation.rejectStockAdjustment),
  inventoryController.rejectStockAdjustment
);

router.get(
  '/adjustments/summary',
  authorize(['stock-adjustments.read']),
  inventoryController.getAdjustmentSummary
);

module.exports = router;
