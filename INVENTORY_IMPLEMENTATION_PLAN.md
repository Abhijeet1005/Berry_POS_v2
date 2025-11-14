# Inventory System - Detailed Implementation Plan

## 📋 Analysis Complete

### **Codebase Patterns Identified:**

1. ✅ **Model Structure**
   - Always include `tenantId` and `outletId` with indexes
   - Use `timestamps: true` for createdAt/updatedAt
   - Include `isActive` for soft deletes
   - Use pre-save hooks for auto-generation (numbers, etc.)
   - Include helper methods on schema
   - Proper indexing for performance

2. ✅ **Service Layer**
   - Use `NotFoundError` and `ValidationError` from utils
   - Always validate tenantId for multi-tenancy
   - Use pagination helpers for list endpoints
   - Return consistent data structures

3. ✅ **Controller Layer**
   - Use `asyncHandler` wrapper
   - Use `successResponse` and `paginatedResponse` formatters
   - Consistent HTTP status codes (201 for create, 200 for others)
   - Consistent message format

4. ✅ **Validation**
   - Use Joi for all validation
   - Use `commonSchemas.objectId` for ObjectId validation
   - Separate create and update schemas
   - Include query parameter validation

5. ✅ **Constants**
   - All enums defined in constants.js
   - Use Object.values() for enum validation
   - Consistent naming (UPPERCASE_WITH_UNDERSCORES)

---

## 🎯 Implementation Order

### **Step 1: Add Constants** ✅ Ready
Add inventory-related constants to `src/config/constants.js`

### **Step 2: Create Models** (6 models)
1. InventoryItem
2. Recipe
3. Supplier
4. PurchaseOrder
5. StockMovement
6. StockAdjustment

### **Step 3: Create Services** (6 services)
1. inventoryItemService
2. recipeService
3. supplierService
4. purchaseOrderService
5. stockMovementService
6. stockAdjustmentService

### **Step 4: Create Controllers**
1. inventoryController (combines all inventory operations)

### **Step 5: Create Validation Schemas**
1. inventoryValidation.js

### **Step 6: Create Routes**
1. inventoryRoutes.js

### **Step 7: Register Routes**
1. Update app.js

### **Step 8: Add Swagger Documentation**
1. inventorySwagger.js

### **Step 9: Update RBAC**
1. Add inventory permissions to rbacMiddleware.js

### **Step 10: Integration**
1. Link recipes to order processing
2. Auto-deduct inventory on order

---

## 📝 Detailed Specifications

### **Constants to Add:**

```javascript
// Inventory item categories
INVENTORY_CATEGORIES: {
  VEGETABLES: 'vegetables',
  FRUITS: 'fruits',
  MEAT: 'meat',
  SEAFOOD: 'seafood',
  DAIRY: 'dairy',
  GRAINS: 'grains',
  SPICES: 'spices',
  OILS: 'oils',
  BEVERAGES: 'beverages',
  PACKAGING: 'packaging',
  OTHER: 'other'
},

// Inventory units
INVENTORY_UNITS: {
  KG: 'kg',
  GRAM: 'gram',
  LITER: 'liter',
  ML: 'ml',
  PIECE: 'piece',
  DOZEN: 'dozen',
  PACKET: 'packet',
  BOX: 'box'
},

// Stock movement types
STOCK_MOVEMENT_TYPES: {
  PURCHASE: 'purchase',
  USAGE: 'usage',
  ADJUSTMENT: 'adjustment',
  TRANSFER: 'transfer',
  WASTAGE: 'wastage',
  RETURN: 'return'
},

// Stock adjustment types
STOCK_ADJUSTMENT_TYPES: {
  WASTAGE: 'wastage',
  DAMAGE: 'damage',
  THEFT: 'theft',
  EXPIRY: 'expiry',
  CORRECTION: 'correction'
},

// Purchase order statuses
PURCHASE_ORDER_STATUS: {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  ORDERED: 'ordered',
  PARTIALLY_RECEIVED: 'partially-received',
  RECEIVED: 'received',
  CANCELLED: 'cancelled'
}
```

---

## 🔧 Model Specifications

### **1. InventoryItem Model**

```javascript
{
  tenantId: ObjectId (required, indexed),
  outletId: ObjectId (required, indexed),
  name: String (required, trimmed),
  sku: String (unique per tenant, auto-generated),
  category: String (enum: INVENTORY_CATEGORIES),
  unit: String (enum: INVENTORY_UNITS, required),
  currentStock: Number (default: 0, min: 0),
  minStockLevel: Number (default: 0),
  maxStockLevel: Number,
  reorderPoint: Number,
  unitCost: Number (required, min: 0),
  supplierId: ObjectId (ref: Supplier),
  lastRestocked: Date,
  expiryDate: Date,
  storageLocation: String,
  isActive: Boolean (default: true),
  timestamps: true
}

Indexes:
- { tenantId: 1, outletId: 1, isActive: 1 }
- { tenantId: 1, sku: 1 } (unique)
- { tenantId: 1, category: 1 }
- { currentStock: 1 }

Methods:
- getTotalValue() - returns currentStock * unitCost
- isLowStock() - returns currentStock <= minStockLevel
- needsReorder() - returns currentStock <= reorderPoint

Pre-save hook:
- Generate SKU if not provided (INV-YYYYMMDD-XXXX)
```

### **2. Recipe Model**

```javascript
{
  tenantId: ObjectId (required, indexed),
  outletId: ObjectId (required, indexed),
  dishId: ObjectId (required, ref: Dish, unique per outlet),
  ingredients: [{
    inventoryItemId: ObjectId (required, ref: InventoryItem),
    quantity: Number (required, min: 0),
    unit: String (required),
    cost: Number (calculated)
  }],
  portionSize: String,
  preparationNotes: String,
  isActive: Boolean (default: true),
  timestamps: true
}

Indexes:
- { tenantId: 1, outletId: 1, dishId: 1 } (unique)
- { tenantId: 1, 'ingredients.inventoryItemId': 1 }

Methods:
- calculateTotalCost() - sum of all ingredient costs
- deductInventory(quantity) - deduct ingredients from inventory
- checkAvailability() - check if all ingredients are available

Virtual:
- totalCost - calculated from ingredients
```

### **3. Supplier Model**

```javascript
{
  tenantId: ObjectId (required, indexed),
  name: String (required, trimmed),
  contactPerson: String,
  phone: String (required),
  email: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String (default: 'India')
  },
  suppliedCategories: [String] (enum: INVENTORY_CATEGORIES),
  paymentTerms: String,
  creditDays: Number (default: 0),
  rating: Number (min: 0, max: 5, default: 0),
  notes: String,
  isActive: Boolean (default: true),
  timestamps: true
}

Indexes:
- { tenantId: 1, isActive: 1 }
- { tenantId: 1, name: 1 }
- { phone: 1 }

Methods:
- updateRating(newRating) - update supplier rating
```

### **4. PurchaseOrder Model**

```javascript
{
  tenantId: ObjectId (required, indexed),
  outletId: ObjectId (required, indexed),
  poNumber: String (auto-generated, unique),
  supplierId: ObjectId (required, ref: Supplier),
  items: [{
    inventoryItemId: ObjectId (required, ref: InventoryItem),
    quantity: Number (required, min: 0),
    unit: String (required),
    unitCost: Number (required, min: 0),
    receivedQuantity: Number (default: 0),
    totalCost: Number (calculated)
  }],
  subtotal: Number (required, min: 0),
  taxAmount: Number (default: 0),
  shippingCost: Number (default: 0),
  total: Number (required, min: 0),
  status: String (enum: PURCHASE_ORDER_STATUS, default: 'draft'),
  orderedDate: Date,
  expectedDeliveryDate: Date,
  receivedDate: Date,
  createdBy: ObjectId (ref: User),
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  notes: String,
  timestamps: true
}

Indexes:
- { tenantId: 1, outletId: 1, status: 1 }
- { poNumber: 1 } (unique)
- { supplierId: 1 }
- { createdAt: -1 }

Methods:
- calculateTotals() - calculate subtotal and total
- approve(userId) - approve PO
- receive(items) - mark items as received
- isFullyReceived() - check if all items received

Pre-save hook:
- Generate PO number (PO-YYYYMMDD-XXXX)
- Calculate totals if items changed
```

### **5. StockMovement Model**

```javascript
{
  tenantId: ObjectId (required, indexed),
  outletId: ObjectId (required, indexed),
  inventoryItemId: ObjectId (required, ref: InventoryItem, indexed),
  type: String (enum: STOCK_MOVEMENT_TYPES, required),
  quantity: Number (required),
  unit: String (required),
  previousStock: Number (required),
  newStock: Number (required),
  unitCost: Number,
  totalCost: Number (calculated),
  referenceType: String (enum: ['PurchaseOrder', 'Order', 'StockAdjustment', 'Recipe']),
  referenceId: ObjectId,
  performedBy: ObjectId (ref: User),
  notes: String,
  timestamp: Date (default: Date.now, indexed),
  timestamps: true
}

Indexes:
- { tenantId: 1, outletId: 1, inventoryItemId: 1, timestamp: -1 }
- { tenantId: 1, type: 1, timestamp: -1 }
- { referenceType: 1, referenceId: 1 }

Static methods:
- createMovement(data) - create movement and update inventory
```

### **6. StockAdjustment Model**

```javascript
{
  tenantId: ObjectId (required, indexed),
  outletId: ObjectId (required, indexed),
  adjustmentNumber: String (auto-generated, unique),
  inventoryItemId: ObjectId (required, ref: InventoryItem),
  adjustmentType: String (enum: STOCK_ADJUSTMENT_TYPES, required),
  quantity: Number (required),
  unit: String (required),
  previousStock: Number (required),
  newStock: Number (required),
  reason: String (required),
  cost: Number (financial impact),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  createdBy: ObjectId (ref: User, required),
  approvedBy: ObjectId (ref: User),
  approvedAt: Date,
  notes: String,
  timestamps: true
}

Indexes:
- { tenantId: 1, outletId: 1, status: 1 }
- { adjustmentNumber: 1 } (unique)
- { inventoryItemId: 1 }
- { createdAt: -1 }

Methods:
- approve(userId) - approve adjustment and update inventory
- reject(userId, reason) - reject adjustment

Pre-save hook:
- Generate adjustment number (ADJ-YYYYMMDD-XXXX)
```

---

## 🔐 RBAC Permissions to Add

```javascript
[ROLES.MANAGER]: [
  // ... existing permissions
  'inventory.*',
  'recipes.*',
  'suppliers.*',
  'purchase-orders.*',
  'stock-adjustments.create',
  'stock-adjustments.approve'
],

[ROLES.CAPTAIN]: [
  // ... existing permissions
  'inventory.read',
  'recipes.read',
  'stock-adjustments.create'
],

[ROLES.KITCHEN]: [
  // ... existing permissions
  'inventory.read',
  'recipes.read'
]
```

---

## 📊 Integration Points

### **1. Order Processing Integration**

When an order is placed:
```javascript
// In orderService.createOrder()
// After order is created and before saving:

if (order.items && order.items.length > 0) {
  for (const item of order.items) {
    // Find recipe for the dish
    const recipe = await Recipe.findOne({ 
      dishId: item.dishId, 
      outletId: order.outletId,
      isActive: true 
    });
    
    if (recipe) {
      // Deduct inventory for each ingredient
      await recipe.deductInventory(item.quantity);
    }
  }
}
```

### **2. Low Stock Alerts**

Create a background job or check on inventory updates:
```javascript
// After any stock movement
if (inventoryItem.isLowStock()) {
  // Send notification to manager
  await notificationService.sendNotification({
    type: 'low_stock_alert',
    recipientRole: 'manager',
    outletId: inventoryItem.outletId,
    data: {
      itemName: inventoryItem.name,
      currentStock: inventoryItem.currentStock,
      minStock: inventoryItem.minStockLevel
    }
  });
}
```

---

## ✅ Implementation Checklist

- [ ] Step 1: Add constants to constants.js
- [ ] Step 2: Create 6 models
- [ ] Step 3: Create 6 services
- [ ] Step 4: Create controller
- [ ] Step 5: Create validation schemas
- [ ] Step 6: Create routes
- [ ] Step 7: Register routes in app.js
- [ ] Step 8: Add Swagger documentation
- [ ] Step 9: Update RBAC permissions
- [ ] Step 10: Integrate with order processing
- [ ] Step 11: Test all endpoints
- [ ] Step 12: Update Postman collection

---

**Ready to proceed with implementation?**
**Estimated Time**: 4-6 hours for complete implementation
**Files to Create**: 15+ files
**Files to Modify**: 3 files (constants.js, rbacMiddleware.js, app.js)
