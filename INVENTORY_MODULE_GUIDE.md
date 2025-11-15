e4# 📦 Inventory Management Module - How It Works

## Overview

The Inventory Management System tracks raw materials, manages suppliers, links ingredients to dishes through recipes, handles purchase orders, and monitors all stock movements with a complete audit trail.

## Core Concepts

### 1. **Inventory Items** (Raw Materials)
These are the ingredients and supplies you purchase and use in your restaurant.

**Example:** Tomatoes, Chicken, Rice, Cooking Oil, Packaging boxes

**Key Features:**
- Track current stock levels
- Set minimum/maximum stock thresholds
- Get alerts when stock is low
- Auto-generate SKU codes (INV-20241114-0001)
- Track unit cost for valuation
- Set reorder points for automatic alerts
- Store location tracking (e.g., "Cold Storage A1")

**How It Works:**
```
1. Create an inventory item (e.g., "Tomatoes")
2. Set min stock = 10kg, max stock = 100kg, reorder point = 15kg
3. System tracks current stock automatically
4. When stock drops below 15kg → appears in "Reorder Items" list
5. When stock drops below 10kg → appears in "Low Stock Alerts"
```

---

### 2. **Suppliers** (Vendors)
Manage your vendors who supply raw materials.

**Example:** Fresh Vegetables Co., Meat Suppliers Ltd.

**Key Features:**
- Store contact information
- Track supplied categories (vegetables, meat, dairy, etc.)
- Rate suppliers (0-5 stars)
- Set payment terms (Net 30 days, etc.)
- Track credit days
- Monitor supplier performance

**How It Works:**
```
1. Create supplier with contact details
2. Link them to categories they supply
3. System tracks:
   - Total orders placed
   - On-time delivery rate
   - Average order value
4. Rate suppliers after each delivery
5. View performance metrics to choose best suppliers
```

---

### 3. **Recipes** (Dish-to-Ingredient Mapping)
Link your menu dishes to the inventory items they use.

**Example:** "Margherita Pizza" uses 0.2kg Tomatoes, 0.15kg Cheese, 0.3kg Flour

**Key Features:**
- Define exact quantities needed per dish
- Automatic cost calculation (COGS - Cost of Goods Sold)
- Check if enough ingredients available
- Auto-deduct inventory when order is placed
- Track portion sizes

**How It Works:**
```
1. Create a recipe for "Butter Chicken"
2. Add ingredients:
   - Chicken: 0.25kg
   - Butter: 0.05kg
   - Tomatoes: 0.1kg
   - Spices: 0.02kg
3. System calculates total cost automatically
4. When customer orders 1 Butter Chicken:
   → System checks if ingredients available
   → Deducts quantities from inventory
   → Creates stock movement record
5. You can check "Can I make 50 portions?" before accepting large orders
```

---

### 4. **Purchase Orders** (Ordering from Suppliers)
Complete workflow for ordering supplies from vendors.

**Workflow:**
```
Draft → Pending → Approved → Ordered → Received → Completed
```

**How It Works:**

**Step 1: Create PO (Draft)**
```
Manager creates PO:
- Select supplier
- Add items (Tomatoes: 50kg @ ₹25/kg)
- Add tax and shipping
- Status: Draft
```

**Step 2: Submit for Approval (Pending)**
```
Manager submits PO
- Status changes to: Pending
- Awaits approval from authorized person
```

**Step 3: Approve (Approved)**
```
Admin/Manager approves
- Status: Approved
- Ready to send to supplier
```

**Step 4: Place Order (Ordered)**
```
Send PO to supplier
- Status: Ordered
- Expected delivery date set
```

**Step 5: Receive Goods (Received)**
```
When goods arrive:
- Mark items as received (can be partial)
- System automatically:
  → Updates inventory stock
  → Creates stock movement records
  → Calculates received vs ordered
- Status: Partially Received or Received
```

**Key Features:**
- Track partial deliveries
- Auto-generate PO numbers (PO-20241114-0001)
- Calculate totals with tax and shipping
- Cancel orders if needed
- Complete audit trail

---

### 5. **Stock Movements** (Audit Trail)
Automatic tracking of every inventory change.

**Movement Types:**
- **Purchase** - Goods received from supplier
- **Usage** - Used in dish preparation (from recipes)
- **Adjustment** - Manual corrections (wastage, damage, etc.)
- **Transfer** - Moved between locations
- **Wastage** - Spoiled or expired items
- **Return** - Returned to supplier

**How It Works:**
```
Every time inventory changes, system creates a movement record:

Example:
- Previous Stock: 50kg
- Change: +20kg (Purchase from PO-123)
- New Stock: 70kg
- Timestamp: 2024-11-14 10:30 AM
- User: John Doe
- Reference: PO-123
```

**Benefits:**
- Complete audit trail
- Track who changed what and when
- Identify patterns (high wastage items)
- Generate movement reports
- Reconcile stock discrepancies

---

### 6. **Stock Adjustments** (Manual Corrections)
Handle wastage, damage, theft, expiry, or corrections with approval workflow.

**Adjustment Types:**
- **Wastage** - Food spoiled
- **Damage** - Items damaged
- **Theft** - Items stolen
- **Expiry** - Expired items
- **Correction** - Fix counting errors

**Workflow:**
```
Pending → Approved/Rejected
```

**How It Works:**

**Step 1: Create Adjustment**
```
Captain notices 5kg tomatoes expired:
- Type: Expiry
- Quantity: -5kg
- Reason: "Found expired during inspection"
- Status: Pending
```

**Step 2: Manager Reviews**
```
Manager checks:
- Reviews reason
- Verifies quantity
- Either:
  → Approves: Stock reduced, movement created
  → Rejects: No change, reason recorded
```

**Key Features:**
- Requires reason (minimum 5 characters)
- Approval workflow for accountability
- Tracks cost impact
- Auto-generate adjustment numbers (ADJ-20241114-0001)
- Summary reports by type

---

## Real-World Example: Complete Flow

### Scenario: Making Butter Chicken

**1. Setup (One-time)**
```
✓ Create inventory items: Chicken, Butter, Tomatoes, Spices
✓ Create supplier: "Fresh Meat Co."
✓ Create recipe: "Butter Chicken" with ingredient quantities
```

**2. Ordering Supplies**
```
Day 1: Stock low
- Check "Low Stock Items" → Chicken at 5kg (min: 10kg)
- Check "Reorder Items" → Chicken needs reorder

Day 2: Create Purchase Order
- Create PO for 50kg chicken @ ₹200/kg
- Submit for approval
- Approve and send to supplier

Day 5: Receive Goods
- Supplier delivers 50kg chicken
- Mark as received in system
- System automatically:
  → Updates chicken stock: 5kg → 55kg
  → Creates stock movement record
  → Updates PO status to "Received"
```

**3. Customer Orders**
```
Customer orders 10 Butter Chicken:

System checks recipe:
- Chicken needed: 10 × 0.25kg = 2.5kg
- Current stock: 55kg
- Available: ✓ Yes

System processes:
1. Deducts 2.5kg chicken from inventory
2. Creates stock movement (type: usage)
3. New stock: 52.5kg
4. Calculates COGS for the order
```

**4. Handling Wastage**
```
Next day: Chef finds 3kg chicken spoiled

Captain creates adjustment:
- Type: Wastage
- Quantity: -3kg
- Reason: "Refrigerator malfunction overnight"
- Status: Pending

Manager reviews and approves:
- Stock updated: 52.5kg → 49.5kg
- Movement created (type: wastage)
- Cost impact recorded
```

**5. Reports & Analytics**
```
End of month:
- View stock movements by item
- Check wastage summary
- Calculate inventory valuation
- Review supplier performance
- Identify high-cost items
```

---

## API Workflow Examples

### Example 1: Create and Use a Recipe

```javascript
// 1. Create inventory items
POST /inventory/items
{
  "name": "Chicken Breast",
  "category": "meat",
  "unit": "kg",
  "unitCost": 200,
  "currentStock": 50
}
// Response: { _id: "item123", ... }

// 2. Create recipe
POST /inventory/recipes
{
  "dishId": "dish456",
  "ingredients": [
    {
      "inventoryItemId": "item123",
      "quantity": 0.25,
      "unit": "kg"
    }
  ]
}

// 3. Check availability before accepting order
GET /inventory/recipes/{recipeId}/availability?quantity=10
// Response: { available: true, canMake: 200 }

// 4. Calculate cost
GET /inventory/recipes/{recipeId}/cost
// Response: { totalCost: 50, ingredients: [...] }
```

### Example 2: Complete Purchase Order Flow

```javascript
// 1. Create PO (Draft)
POST /inventory/purchase-orders
{
  "supplierId": "sup123",
  "items": [
    {
      "inventoryItemId": "item123",
      "quantity": 50,
      "unit": "kg",
      "unitCost": 200
    }
  ],
  "taxAmount": 1800,
  "shippingCost": 200
}
// Response: { _id: "po123", status: "draft", poNumber: "PO-20241114-0001" }

// 2. Submit for approval
POST /inventory/purchase-orders/po123/submit
// Response: { status: "pending" }

// 3. Approve
POST /inventory/purchase-orders/po123/approve
// Response: { status: "approved" }

// 4. Mark as ordered
POST /inventory/purchase-orders/po123/order
// Response: { status: "ordered" }

// 5. Receive goods
POST /inventory/purchase-orders/po123/receive
{
  "items": [
    {
      "itemId": "item123",
      "quantity": 50
    }
  ]
}
// System automatically:
// - Updates inventory stock
// - Creates stock movement
// - Updates PO status
```

### Example 3: Handle Stock Adjustment

```javascript
// 1. Create adjustment (Captain)
POST /inventory/adjustments
{
  "inventoryItemId": "item123",
  "adjustmentType": "wastage",
  "quantity": -5,
  "unit": "kg",
  "reason": "Expired items found during inspection"
}
// Response: { _id: "adj123", status: "pending" }

// 2. Approve (Manager)
POST /inventory/adjustments/adj123/approve
// System automatically:
// - Updates inventory stock
// - Creates stock movement
// - Records cost impact
```

---

## Key Benefits

### 1. **Automated Stock Tracking**
- No manual stock registers
- Real-time stock levels
- Automatic deductions on orders

### 2. **Cost Control**
- Know exact COGS per dish
- Track inventory valuation
- Identify high-cost items
- Reduce wastage

### 3. **Prevent Stockouts**
- Low stock alerts
- Reorder notifications
- Check availability before accepting orders

### 4. **Accountability**
- Complete audit trail
- Approval workflows
- Track who did what and when

### 5. **Supplier Management**
- Performance tracking
- Rating system
- Compare suppliers

### 6. **Data-Driven Decisions**
- Movement reports
- Wastage analysis
- Cost trends
- Usage patterns

---

## RBAC (Role-Based Access)

### Admin
- Full access to everything

### Manager
- Full inventory management
- Create/approve purchase orders
- Approve stock adjustments
- View all reports

### Captain
- View inventory (read-only)
- View recipes (read-only)
- Create stock adjustments (needs approval)

### Kitchen
- View inventory (read-only)
- View recipes (read-only)

### Cashier
- No inventory access

---

## Database Schema

### Collections Created:
1. **InventoryItem** - Raw materials
2. **Supplier** - Vendors
3. **Recipe** - Dish-to-ingredient mapping
4. **PurchaseOrder** - Orders to suppliers
5. **StockMovement** - Audit trail
6. **StockAdjustment** - Manual corrections

### Relationships:
```
InventoryItem ←→ Supplier (many-to-one)
Recipe ←→ Dish (one-to-one)
Recipe ←→ InventoryItem (many-to-many)
PurchaseOrder ←→ Supplier (many-to-one)
PurchaseOrder ←→ InventoryItem (many-to-many)
StockMovement ←→ InventoryItem (many-to-one)
StockAdjustment ←→ InventoryItem (many-to-one)
```

---

## Quick Start Guide

### 1. Setup Inventory
```
1. Create suppliers
2. Create inventory items
3. Link items to suppliers
```

### 2. Setup Recipes
```
1. Create recipes for your dishes
2. Add ingredients with quantities
3. System calculates costs automatically
```

### 3. Order Supplies
```
1. Check low stock items
2. Create purchase order
3. Submit → Approve → Order
4. Receive goods when delivered
```

### 4. Monitor & Adjust
```
1. View stock movements
2. Handle wastage/damage via adjustments
3. Review reports
4. Optimize based on data
```

---

## Summary

The Inventory Management Module provides:
- ✅ Complete stock tracking
- ✅ Recipe-based cost calculation
- ✅ Purchase order workflow
- ✅ Supplier management
- ✅ Audit trail for all changes
- ✅ Approval workflows for accountability
- ✅ Real-time alerts and notifications
- ✅ Comprehensive reporting

**Result:** Better cost control, reduced wastage, prevented stockouts, and data-driven decision making!
