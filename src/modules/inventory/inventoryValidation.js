const Joi = require('joi');
const { commonSchemas } = require('../../utils/validationHelper');
const { 
  INVENTORY_CATEGORIES, 
  INVENTORY_UNITS, 
  STOCK_MOVEMENT_TYPES,
  STOCK_ADJUSTMENT_TYPES,
  PURCHASE_ORDER_STATUS
} = require('../../config/constants');

// Inventory Item Validation
const createInventoryItem = Joi.object({
  outletId: commonSchemas.objectId.required(),
  name: Joi.string().trim().min(2).max(100).required(),
  category: Joi.string().valid(...Object.values(INVENTORY_CATEGORIES)).required(),
  unit: Joi.string().valid(...Object.values(INVENTORY_UNITS)).required(),
  currentStock: Joi.number().min(0).default(0),
  minStockLevel: Joi.number().min(0).default(0),
  maxStockLevel: Joi.number().min(0),
  reorderPoint: Joi.number().min(0),
  unitCost: Joi.number().min(0).required(),
  supplierId: commonSchemas.objectId,
  expiryDate: Joi.date(),
  storageLocation: Joi.string().trim().max(100)
});

const updateInventoryItem = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  category: Joi.string().valid(...Object.values(INVENTORY_CATEGORIES)),
  unit: Joi.string().valid(...Object.values(INVENTORY_UNITS)),
  minStockLevel: Joi.number().min(0),
  maxStockLevel: Joi.number().min(0),
  reorderPoint: Joi.number().min(0),
  unitCost: Joi.number().min(0),
  supplierId: commonSchemas.objectId,
  expiryDate: Joi.date(),
  storageLocation: Joi.string().trim().max(100)
});

const updateStock = Joi.object({
  quantity: Joi.number().required(),
  operation: Joi.string().valid('set', 'increment', 'decrement').required()
});

const getInventoryItems = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  outletId: commonSchemas.objectId,
  category: Joi.string().valid(...Object.values(INVENTORY_CATEGORIES)),
  supplierId: commonSchemas.objectId,
  lowStock: Joi.string().valid('true', 'false'),
  search: Joi.string().trim().max(100)
});

// Supplier Validation
const createSupplier = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  contactPerson: Joi.string().trim().max(100),
  phone: Joi.string().pattern(/^[0-9+\-\s()]{10,15}$/).required(),
  email: Joi.string().email(),
  address: Joi.object({
    street: Joi.string().trim().max(200),
    city: Joi.string().trim().max(50),
    state: Joi.string().trim().max(50),
    pincode: Joi.string().pattern(/^[0-9]{6}$/),
    country: Joi.string().trim().max(50).default('India')
  }),
  suppliedCategories: Joi.array().items(
    Joi.string().valid(...Object.values(INVENTORY_CATEGORIES))
  ),
  paymentTerms: Joi.string().trim().max(200),
  creditDays: Joi.number().integer().min(0).default(0),
  notes: Joi.string().max(500)
});

const updateSupplier = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  contactPerson: Joi.string().trim().max(100),
  phone: Joi.string().pattern(/^[0-9+\-\s()]{10,15}$/),
  email: Joi.string().email(),
  address: Joi.object({
    street: Joi.string().trim().max(200),
    city: Joi.string().trim().max(50),
    state: Joi.string().trim().max(50),
    pincode: Joi.string().pattern(/^[0-9]{6}$/),
    country: Joi.string().trim().max(50)
  }),
  suppliedCategories: Joi.array().items(
    Joi.string().valid(...Object.values(INVENTORY_CATEGORIES))
  ),
  paymentTerms: Joi.string().trim().max(200),
  creditDays: Joi.number().integer().min(0),
  notes: Joi.string().max(500)
});

const updateSupplierRating = Joi.object({
  rating: Joi.number().min(0).max(5).required()
});

const getSuppliers = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  category: Joi.string().valid(...Object.values(INVENTORY_CATEGORIES)),
  search: Joi.string().trim().max(100),
  minRating: Joi.number().min(0).max(5)
});

// Recipe Validation
const createRecipe = Joi.object({
  outletId: commonSchemas.objectId.required(),
  dishId: commonSchemas.objectId.required(),
  ingredients: Joi.array().items(
    Joi.object({
      inventoryItemId: commonSchemas.objectId.required(),
      quantity: Joi.number().min(0).required(),
      unit: Joi.string().valid(...Object.values(INVENTORY_UNITS)).required()
    })
  ).min(1).required(),
  portionSize: Joi.string().trim().max(50),
  preparationNotes: Joi.string().max(1000)
});

const updateRecipe = Joi.object({
  ingredients: Joi.array().items(
    Joi.object({
      inventoryItemId: commonSchemas.objectId.required(),
      quantity: Joi.number().min(0).required(),
      unit: Joi.string().valid(...Object.values(INVENTORY_UNITS)).required()
    })
  ).min(1),
  portionSize: Joi.string().trim().max(50),
  preparationNotes: Joi.string().max(1000)
});

const getRecipes = Joi.object({
  outletId: commonSchemas.objectId,
  dishId: commonSchemas.objectId
});

const checkRecipeAvailability = Joi.object({
  quantity: Joi.number().integer().min(1).default(1)
});

// Purchase Order Validation
const createPurchaseOrder = Joi.object({
  outletId: commonSchemas.objectId.required(),
  supplierId: commonSchemas.objectId.required(),
  items: Joi.array().items(
    Joi.object({
      inventoryItemId: commonSchemas.objectId.required(),
      quantity: Joi.number().min(0).required(),
      unit: Joi.string().valid(...Object.values(INVENTORY_UNITS)).required(),
      unitCost: Joi.number().min(0).required()
    })
  ).min(1).required(),
  taxAmount: Joi.number().min(0).default(0),
  shippingCost: Joi.number().min(0).default(0),
  expectedDeliveryDate: Joi.date(),
  notes: Joi.string().max(500)
});

const updatePurchaseOrder = Joi.object({
  items: Joi.array().items(
    Joi.object({
      inventoryItemId: commonSchemas.objectId.required(),
      quantity: Joi.number().min(0).required(),
      unit: Joi.string().valid(...Object.values(INVENTORY_UNITS)).required(),
      unitCost: Joi.number().min(0).required()
    })
  ).min(1),
  taxAmount: Joi.number().min(0),
  shippingCost: Joi.number().min(0),
  expectedDeliveryDate: Joi.date(),
  notes: Joi.string().max(500)
});

const receiveGoods = Joi.object({
  items: Joi.array().items(
    Joi.object({
      itemId: commonSchemas.objectId.required(),
      quantity: Joi.number().min(0).required()
    })
  ).min(1).required()
});

const getPurchaseOrders = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  outletId: commonSchemas.objectId,
  supplierId: commonSchemas.objectId,
  status: Joi.string().valid(...Object.values(PURCHASE_ORDER_STATUS)),
  startDate: Joi.date(),
  endDate: Joi.date()
});

// Stock Movement Validation
const getStockMovements = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  outletId: commonSchemas.objectId,
  inventoryItemId: commonSchemas.objectId,
  type: Joi.string().valid(...Object.values(STOCK_MOVEMENT_TYPES)),
  startDate: Joi.date(),
  endDate: Joi.date()
});

const getMovementsByItem = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  type: Joi.string().valid(...Object.values(STOCK_MOVEMENT_TYPES)),
  startDate: Joi.date(),
  endDate: Joi.date()
});

// Stock Adjustment Validation
const createStockAdjustment = Joi.object({
  outletId: commonSchemas.objectId.required(),
  inventoryItemId: commonSchemas.objectId.required(),
  adjustmentType: Joi.string().valid(...Object.values(STOCK_ADJUSTMENT_TYPES)).required(),
  quantity: Joi.number().required(),
  unit: Joi.string().valid(...Object.values(INVENTORY_UNITS)).required(),
  reason: Joi.string().min(5).max(500).required(),
  notes: Joi.string().max(500),
  newStock: Joi.when('adjustmentType', {
    is: 'correction',
    then: Joi.number().min(0).required(),
    otherwise: Joi.number().min(0)
  })
});

const updateStockAdjustment = Joi.object({
  adjustmentType: Joi.string().valid(...Object.values(STOCK_ADJUSTMENT_TYPES)),
  quantity: Joi.number(),
  reason: Joi.string().min(5).max(500),
  notes: Joi.string().max(500)
});

const rejectStockAdjustment = Joi.object({
  reason: Joi.string().min(5).max(500).required()
});

const getStockAdjustments = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  outletId: commonSchemas.objectId,
  inventoryItemId: commonSchemas.objectId,
  adjustmentType: Joi.string().valid(...Object.values(STOCK_ADJUSTMENT_TYPES)),
  status: Joi.string().valid('pending', 'approved', 'rejected'),
  startDate: Joi.date(),
  endDate: Joi.date()
});

module.exports = {
  // Inventory items
  createInventoryItem,
  updateInventoryItem,
  updateStock,
  getInventoryItems,
  
  // Suppliers
  createSupplier,
  updateSupplier,
  updateSupplierRating,
  getSuppliers,
  
  // Recipes
  createRecipe,
  updateRecipe,
  getRecipes,
  checkRecipeAvailability,
  
  // Purchase orders
  createPurchaseOrder,
  updatePurchaseOrder,
  receiveGoods,
  getPurchaseOrders,
  
  // Stock movements
  getStockMovements,
  getMovementsByItem,
  
  // Stock adjustments
  createStockAdjustment,
  updateStockAdjustment,
  rejectStockAdjustment,
  getStockAdjustments
};
