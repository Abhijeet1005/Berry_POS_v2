/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryItem:
 *       type: object
 *       required:
 *         - outletId
 *         - name
 *         - category
 *         - unit
 *         - unitCost
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         outletId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           example: "Tomatoes"
 *         sku:
 *           type: string
 *           example: "INV-20241114-0001"
 *         category:
 *           type: string
 *           enum: [vegetables, fruits, meat, seafood, dairy, grains, spices, oils, beverages, packaging, other]
 *           example: "vegetables"
 *         unit:
 *           type: string
 *           enum: [kg, gram, liter, ml, piece, dozen, packet, box]
 *           example: "kg"
 *         currentStock:
 *           type: number
 *           minimum: 0
 *           example: 50
 *         minStockLevel:
 *           type: number
 *           minimum: 0
 *           example: 10
 *         maxStockLevel:
 *           type: number
 *           minimum: 0
 *           example: 100
 *         reorderPoint:
 *           type: number
 *           minimum: 0
 *           example: 15
 *         unitCost:
 *           type: number
 *           minimum: 0
 *           example: 25.50
 *         supplierId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         lastRestocked:
 *           type: string
 *           format: date-time
 *         expiryDate:
 *           type: string
 *           format: date-time
 *         storageLocation:
 *           type: string
 *           example: "Cold Storage A1"
 *         isActive:
 *           type: boolean
 *           default: true
 *
 *     Supplier:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           example: "Fresh Vegetables Co."
 *         contactPerson:
 *           type: string
 *           example: "John Smith"
 *         phone:
 *           type: string
 *           example: "+91-9876543210"
 *         email:
 *           type: string
 *           format: email
 *           example: "contact@freshveggies.com"
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             pincode:
 *               type: string
 *             country:
 *               type: string
 *               default: "India"
 *         suppliedCategories:
 *           type: array
 *           items:
 *             type: string
 *         paymentTerms:
 *           type: string
 *           example: "Net 30 days"
 *         creditDays:
 *           type: number
 *           minimum: 0
 *           default: 0
 *         rating:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *           default: 0
 *         isActive:
 *           type: boolean
 *           default: true
 *
 *     Recipe:
 *       type: object
 *       required:
 *         - outletId
 *         - dishId
 *         - ingredients
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         outletId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         dishId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         ingredients:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               inventoryItemId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *         portionSize:
 *           type: string
 *           example: "1 serving"
 *         totalCost:
 *           type: number
 *           readOnly: true
 *
 *     PurchaseOrder:
 *       type: object
 *       required:
 *         - outletId
 *         - supplierId
 *         - items
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         poNumber:
 *           type: string
 *           example: "PO-20241114-0001"
 *         outletId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         supplierId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               inventoryItemId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               unitCost:
 *                 type: number
 *         status:
 *           type: string
 *           enum: [draft, pending, approved, ordered, partially-received, received, cancelled]
 *           default: "draft"
 *         total:
 *           type: number
 *           minimum: 0
 *
 *     StockAdjustment:
 *       type: object
 *       required:
 *         - outletId
 *         - inventoryItemId
 *         - adjustmentType
 *         - quantity
 *         - reason
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         adjustmentNumber:
 *           type: string
 *           example: "ADJ-20241114-0001"
 *         adjustmentType:
 *           type: string
 *           enum: [wastage, damage, theft, expiry, correction]
 *         quantity:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: "pending"
 *         reason:
 *           type: string
 *           example: "Expired vegetables"
 */

/**
 * @swagger
 * tags:
 *   - name: Inventory
 *     description: Inventory item management
 *   - name: Suppliers
 *     description: Supplier management
 *   - name: Recipes
 *     description: Recipe and ingredient management
 *   - name: Purchase Orders
 *     description: Purchase order management
 *   - name: Stock Movements
 *     description: Stock movement tracking
 *   - name: Stock Adjustments
 *     description: Stock adjustment management
 */

/**
 * @swagger
 * /inventory/items:
 *   post:
 *     summary: Create inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - outletId
 *               - name
 *               - category
 *               - unit
 *               - unitCost
 *             properties:
 *               outletId:
 *                 type: string
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               unit:
 *                 type: string
 *               unitCost:
 *                 type: number
 *     responses:
 *       201:
 *         description: Inventory item created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *
 * /inventory/items/low-stock:
 *   get:
 *     summary: Get low stock items
 *     description: Get items that are below their minimum stock level
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Low stock items retrieved successfully
 *
 * /inventory/items/reorder:
 *   get:
 *     summary: Get items that need reordering
 *     description: Get items that have reached their reorder point
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reorder items retrieved successfully
 *
 * /inventory/items/valuation:
 *   get:
 *     summary: Get inventory valuation
 *     description: Get total value of current inventory
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory valuation retrieved successfully
 *
 * /inventory/items/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item retrieved successfully
 *       404:
 *         description: Inventory item not found
 *
 *   put:
 *     summary: Update inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
 *       404:
 *         description: Inventory item not found
 *
 *   delete:
 *     summary: Delete inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
 *       404:
 *         description: Inventory item not found
 *
 * /inventory/items/{id}/stock:
 *   patch:
 *     summary: Update inventory item stock
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - type
 *             properties:
 *               quantity:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [add, remove, set]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *       404:
 *         description: Inventory item not found
 *
 * /inventory/suppliers:
 *   post:
 *     summary: Create supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       201:
 *         description: Supplier created successfully
 *
 *   get:
 *     summary: Get all suppliers
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Suppliers retrieved successfully
 *
 * /inventory/suppliers/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supplier retrieved successfully
 *       404:
 *         description: Supplier not found
 *
 *   put:
 *     summary: Update supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       200:
 *         description: Supplier updated successfully
 *       404:
 *         description: Supplier not found
 *
 *   delete:
 *     summary: Delete supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supplier deleted successfully
 *       404:
 *         description: Supplier not found
 *
 * /inventory/suppliers/{id}/rating:
 *   patch:
 *     summary: Update supplier rating
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Supplier rating updated successfully
 *       404:
 *         description: Supplier not found
 *
 * /inventory/suppliers/{id}/performance:
 *   get:
 *     summary: Get supplier performance metrics
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supplier performance retrieved successfully
 *       404:
 *         description: Supplier not found
 *
 * /inventory/recipes:
 *   post:
 *     summary: Create recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *
 *   get:
 *     summary: Get all recipes
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recipes retrieved successfully
 *
 * /inventory/recipes/dish/{dishId}:
 *   get:
 *     summary: Get recipe by dish ID
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dishId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe retrieved successfully
 *       404:
 *         description: Recipe not found
 *
 * /inventory/recipes/{id}:
 *   get:
 *     summary: Get recipe by ID
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe retrieved successfully
 *       404:
 *         description: Recipe not found
 *
 *   put:
 *     summary: Update recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Recipe'
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       404:
 *         description: Recipe not found
 *
 *   delete:
 *     summary: Delete recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *       404:
 *         description: Recipe not found
 *
 * /inventory/recipes/{id}/availability:
 *   get:
 *     summary: Check recipe availability
 *     description: Check if enough ingredients are available to make the recipe
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: quantity
 *         schema:
 *           type: number
 *           default: 1
 *     responses:
 *       200:
 *         description: Recipe availability checked successfully
 *       404:
 *         description: Recipe not found
 *
 * /inventory/recipes/{id}/cost:
 *   get:
 *     summary: Calculate recipe cost
 *     description: Calculate total cost based on ingredient prices
 *     tags: [Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe cost calculated successfully
 *       404:
 *         description: Recipe not found
 *
 * /inventory/purchase-orders:
 *   post:
 *     summary: Create purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseOrder'
 *     responses:
 *       201:
 *         description: Purchase order created successfully
 *
 *   get:
 *     summary: Get all purchase orders
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase orders retrieved successfully
 *
 * /inventory/purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order retrieved successfully
 *       404:
 *         description: Purchase order not found
 *
 *   put:
 *     summary: Update purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseOrder'
 *     responses:
 *       200:
 *         description: Purchase order updated successfully
 *       404:
 *         description: Purchase order not found
 *
 *   delete:
 *     summary: Delete purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order deleted successfully
 *       404:
 *         description: Purchase order not found
 *
 * /inventory/purchase-orders/{id}/submit:
 *   post:
 *     summary: Submit purchase order for approval
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order submitted successfully
 *       404:
 *         description: Purchase order not found
 *
 * /inventory/purchase-orders/{id}/approve:
 *   post:
 *     summary: Approve purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order approved successfully
 *       404:
 *         description: Purchase order not found
 *
 * /inventory/purchase-orders/{id}/order:
 *   post:
 *     summary: Mark purchase order as ordered
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order marked as ordered
 *       404:
 *         description: Purchase order not found
 *
 * /inventory/purchase-orders/{id}/receive:
 *   post:
 *     summary: Receive goods from purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     inventoryItemId:
 *                       type: string
 *                     receivedQuantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Goods received successfully
 *       404:
 *         description: Purchase order not found
 *
 * /inventory/purchase-orders/{id}/cancel:
 *   post:
 *     summary: Cancel purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase order cancelled successfully
 *       404:
 *         description: Purchase order not found
 *
 * /inventory/movements:
 *   get:
 *     summary: Get all stock movements
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock movements retrieved successfully
 *
 * /inventory/movements/item/{itemId}:
 *   get:
 *     summary: Get stock movements for specific item
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stock movements retrieved successfully
 *       404:
 *         description: Item not found
 *
 * /inventory/movements/summary:
 *   get:
 *     summary: Get stock movement summary
 *     tags: [Stock Movements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock movement summary retrieved successfully
 *
 * /inventory/adjustments:
 *   post:
 *     summary: Create stock adjustment
 *     tags: [Stock Adjustments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockAdjustment'
 *     responses:
 *       201:
 *         description: Stock adjustment created successfully
 *
 *   get:
 *     summary: Get all stock adjustments
 *     tags: [Stock Adjustments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock adjustments retrieved successfully
 *
 * /inventory/adjustments/{id}:
 *   get:
 *     summary: Get stock adjustment by ID
 *     tags: [Stock Adjustments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock adjustment retrieved successfully
 *       404:
 *         description: Stock adjustment not found
 *
 *   put:
 *     summary: Update stock adjustment
 *     tags: [Stock Adjustments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockAdjustment'
 *     responses:
 *       200:
 *         description: Stock adjustment updated successfully
 *       404:
 *         description: Stock adjustment not found
 *
 * /inventory/adjustments/{id}/approve:
 *   post:
 *     summary: Approve stock adjustment
 *     tags: [Stock Adjustments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Stock adjustment approved successfully
 *       404:
 *         description: Stock adjustment not found
 *
 * /inventory/adjustments/{id}/reject:
 *   post:
 *     summary: Reject stock adjustment
 *     tags: [Stock Adjustments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock adjustment rejected successfully
 *       404:
 *         description: Stock adjustment not found
 *
 * /inventory/adjustments/summary:
 *   get:
 *     summary: Get stock adjustment summary
 *     tags: [Stock Adjustments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock adjustment summary retrieved successfully
 */
