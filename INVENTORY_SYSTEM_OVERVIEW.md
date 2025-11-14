# Inventory Management System - Task 31

## 📦 Overview

The Inventory Management System is a comprehensive module for tracking raw materials, ingredients, recipes, suppliers, and purchase orders. This is a **Phase 2** feature that extends the core POS functionality.

---

## 🎯 Key Features

### 1. **Inventory Items Management**
- Track raw materials and ingredients
- Monitor stock levels in real-time
- Set minimum stock thresholds
- Receive low stock alerts
- Track inventory valuation

### 2. **Recipe Management**
- Link dishes to inventory items
- Define ingredient quantities per dish
- Automatic inventory deduction on order
- Calculate Cost of Goods Sold (COGS)
- Recipe costing and profitability analysis

### 3. **Supplier Management**
- Maintain supplier database
- Track supplier contact information
- Monitor supplier performance
- Manage supplier pricing
- Supplier rating system

### 4. **Purchase Order Management**
- Create and manage purchase orders
- Send orders to suppliers
- Receive goods and update inventory
- Track purchase costs
- PO approval workflow

### 5. **Stock Movements & Adjustments**
- Track all inventory changes
- Record wastage, damage, theft
- Stock transfer between outlets
- Audit trail for all movements

### 6. **Inventory Reports**
- Current stock levels
- Stock movement history
- Low stock alerts
- Inventory valuation
- Wastage reports
- Cost analysis
- Supplier performance

---

## 📊 Database Models

### **InventoryItem**
```javascript
{
  tenantId: ObjectId,
  outletId: ObjectId,
  name: String,
  sku: String,
  category: String, // 'vegetables', 'meat', 'dairy', 'spices', etc.
  unit: String, // 'kg', 'liter', 'piece', etc.
  currentStock: Number,
  minStockLevel: Number,
  maxStockLevel: Number,
  reorderPoint: Number,
  unitCost: Number,
  totalValue: Number, // currentStock * unitCost
  supplierId: ObjectId,
  lastRestocked: Date,
  expiryDate: Date,
  isActive: Boolean
}
```

### **Recipe**
```javascript
{
  tenantId: ObjectId,
  outletId: ObjectId,
  dishId: ObjectId,
  ingredients: [{
    inventoryItemId: ObjectId,
    quantity: Number,
    unit: String,
    cost: Number
  }],
  totalCost: Number, // Sum of all ingredient costs
  portionSize: String,
  preparationTime: Number,
  isActive: Boolean
}
```

### **Supplier**
```javascript
{
  tenantId: ObjectId,
  name: String,
  contactPerson: String,
  phone: String,
  email: String,
  address: String,
  suppliedItems: [String], // Categories they supply
  paymentTerms: String,
  rating: Number,
  isActive: Boolean
}
```

### **PurchaseOrder**
```javascript
{
  tenantId: ObjectId,
  outletId: ObjectId,
  poNumber: String,
  supplierId: ObjectId,
  items: [{
    inventoryItemId: ObjectId,
    quantity: Number,
    unitCost: Number,
    totalCost: Number
  }],
  subtotal: Number,
  tax: Number,
  total: Number,
  status: String, // 'draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'
  orderedDate: Date,
  expectedDeliveryDate: Date,
  receivedDate: Date,
  approvedBy: ObjectId,
  notes: String
}
```

### **StockMovement**
```javascript
{
  tenantId: ObjectId,
  outletId: ObjectId,
  inventoryItemId: ObjectId,
  type: String, // 'purchase', 'usage', 'adjustment', 'transfer', 'wastage'
  quantity: Number,
  unit: String,
  previousStock: Number,
  newStock: Number,
  referenceType: String, // 'PurchaseOrder', 'Order', 'StockAdjustment'
  referenceId: ObjectId,
  performedBy: ObjectId,
  notes: String,
  timestamp: Date
}
```

### **StockAdjustment**
```javascript
{
  tenantId: ObjectId,
  outletId: ObjectId,
  inventoryItemId: ObjectId,
  adjustmentType: String, // 'wastage', 'damage', 'theft', 'correction'
  quantity: Number,
  reason: String,
  performedBy: ObjectId,
  approvedBy: ObjectId,
  cost: Number, // Financial impact
  timestamp: Date
}
```

---

## 🔄 Workflow Examples

### **1. Creating a Recipe**
```
1. Manager creates a new dish
2. Manager links dish to recipe
3. Add ingredients from inventory items
4. Specify quantities for each ingredient
5. System calculates total recipe cost
6. Recipe is saved and linked to dish
```

### **2. Order Processing with Inventory**
```
1. Customer orders a dish
2. System checks recipe for the dish
3. For each ingredient in recipe:
   - Deduct quantity from inventory
   - Create stock movement record
4. If stock falls below minimum:
   - Generate low stock alert
   - Suggest creating purchase order
```

### **3. Purchase Order Flow**
```
1. Manager creates purchase order
2. Add items and quantities
3. Submit for approval (if required)
4. Send to supplier
5. Receive goods:
   - Update inventory quantities
   - Create stock movement records
   - Mark PO as received
6. Generate receiving report
```

### **4. Stock Adjustment**
```
1. Staff discovers wastage/damage
2. Create stock adjustment record
3. Specify reason and quantity
4. Manager approves adjustment
5. Inventory is updated
6. Cost is recorded for reporting
```

---

## 📋 API Endpoints

### **Inventory Items**
- `POST /api/v1/inventory/items` - Create inventory item
- `GET /api/v1/inventory/items` - List all items
- `GET /api/v1/inventory/items/:id` - Get item details
- `PUT /api/v1/inventory/items/:id` - Update item
- `DELETE /api/v1/inventory/items/:id` - Delete item
- `GET /api/v1/inventory/items/low-stock` - Get low stock items

### **Recipes**
- `POST /api/v1/inventory/recipes` - Create recipe
- `GET /api/v1/inventory/recipes` - List all recipes
- `GET /api/v1/inventory/recipes/dish/:dishId` - Get recipe for dish
- `PUT /api/v1/inventory/recipes/:id` - Update recipe
- `DELETE /api/v1/inventory/recipes/:id` - Delete recipe

### **Suppliers**
- `POST /api/v1/inventory/suppliers` - Create supplier
- `GET /api/v1/inventory/suppliers` - List all suppliers
- `GET /api/v1/inventory/suppliers/:id` - Get supplier details
- `PUT /api/v1/inventory/suppliers/:id` - Update supplier
- `DELETE /api/v1/inventory/suppliers/:id` - Delete supplier

### **Purchase Orders**
- `POST /api/v1/inventory/purchase-orders` - Create PO
- `GET /api/v1/inventory/purchase-orders` - List all POs
- `GET /api/v1/inventory/purchase-orders/:id` - Get PO details
- `PUT /api/v1/inventory/purchase-orders/:id` - Update PO
- `POST /api/v1/inventory/purchase-orders/:id/approve` - Approve PO
- `POST /api/v1/inventory/purchase-orders/:id/receive` - Receive goods

### **Stock Movements**
- `GET /api/v1/inventory/movements` - List stock movements
- `GET /api/v1/inventory/movements/item/:itemId` - Get movements for item

### **Stock Adjustments**
- `POST /api/v1/inventory/adjustments` - Create adjustment
- `GET /api/v1/inventory/adjustments` - List adjustments
- `POST /api/v1/inventory/adjustments/:id/approve` - Approve adjustment

### **Reports**
- `GET /api/v1/inventory/reports/stock-levels` - Current stock report
- `GET /api/v1/inventory/reports/valuation` - Inventory valuation
- `GET /api/v1/inventory/reports/wastage` - Wastage report
- `GET /api/v1/inventory/reports/cost-analysis` - Cost analysis
- `GET /api/v1/inventory/reports/supplier-performance` - Supplier report

---

## 🔐 RBAC Permissions

### **Admin**
- Full access to all inventory features

### **Manager**
- Create/Edit inventory items
- Create/Edit recipes
- Create/Edit suppliers
- Create/Approve purchase orders
- View all reports
- Approve stock adjustments

### **Captain**
- View inventory items (read-only)
- View recipes (read-only)
- Create stock adjustments (requires approval)

### **Cashier**
- No access

### **Kitchen**
- View recipes (read-only)
- View inventory items (read-only)

---

## 📊 Reports & Analytics

### **1. Stock Level Report**
- Current stock for all items
- Items below minimum level
- Items near expiry
- Stock value by category

### **2. Stock Movement Report**
- All movements in date range
- Movements by type
- Movements by item
- Usage patterns

### **3. Wastage Report**
- Total wastage by period
- Wastage by item
- Wastage by reason
- Financial impact

### **4. Cost Analysis**
- Recipe costs
- Dish profitability
- Cost trends over time
- Cost per category

### **5. Supplier Performance**
- Delivery reliability
- Price comparison
- Quality ratings
- Order frequency

---

## 🚀 Implementation Priority

### **Phase 1 (Core Features)**
1. ✅ Inventory Items CRUD
2. ✅ Recipe Management
3. ✅ Basic Stock Movements
4. ✅ Low Stock Alerts

### **Phase 2 (Advanced Features)**
5. ⏳ Supplier Management
6. ⏳ Purchase Orders
7. ⏳ Stock Adjustments
8. ⏳ Approval Workflows

### **Phase 3 (Reporting)**
9. ⏳ Stock Reports
10. ⏳ Cost Analysis
11. ⏳ Wastage Reports
12. ⏳ Supplier Reports

---

## 💡 Business Benefits

1. **Cost Control**
   - Track ingredient costs
   - Identify wastage
   - Optimize purchasing

2. **Stock Management**
   - Prevent stockouts
   - Reduce overstocking
   - Minimize wastage

3. **Profitability Analysis**
   - Calculate dish profitability
   - Optimize menu pricing
   - Identify high-margin items

4. **Supplier Management**
   - Compare supplier pricing
   - Track delivery performance
   - Negotiate better terms

5. **Compliance**
   - Track expiry dates
   - Maintain audit trail
   - Food safety compliance

---

## 📝 Next Steps

1. **Review this overview** - Confirm features and scope
2. **Create detailed spec** - Define requirements in detail
3. **Design database schema** - Finalize model structures
4. **Implement models** - Create Mongoose schemas
5. **Build services** - Implement business logic
6. **Create controllers** - Build API endpoints
7. **Add validation** - Implement Joi schemas
8. **Write tests** - Unit and integration tests
9. **Document APIs** - Add Swagger documentation
10. **Deploy** - Roll out to production

---

**Status**: ✅ Task Added (Task 31)
**Priority**: Phase 2 (After core POS features)
**Estimated Time**: 2-3 weeks
**Dependencies**: Core POS system, Dish management
