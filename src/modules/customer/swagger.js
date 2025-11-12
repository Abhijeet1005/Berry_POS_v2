/**
 * @swagger
 * components:
 *   schemas:
 *     CustomerRegister:
 *       type: object
 *       required:
 *         - tenantId
 *         - phone
 *         - name
 *       properties:
 *         tenantId:
 *           type: string
 *           description: Restaurant/Outlet tenant ID
 *           example: "507f1f77bcf86cd799439011"
 *         phone:
 *           type: string
 *           pattern: '^[0-9]{10}$'
 *           description: 10-digit phone number
 *           example: "9876543210"
 *         name:
 *           type: string
 *           description: Customer name
 *           example: "John Customer"
 *         email:
 *           type: string
 *           format: email
 *           description: Customer email (optional)
 *           example: "customer@example.com"
 *
 *     CustomerLogin:
 *       type: object
 *       required:
 *         - tenantId
 *         - phone
 *       properties:
 *         tenantId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         phone:
 *           type: string
 *           pattern: '^[0-9]{10}$'
 *           example: "9876543210"
 *
 *     VerifyOTP:
 *       type: object
 *       required:
 *         - tenantId
 *         - phone
 *         - otp
 *       properties:
 *         tenantId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         otp:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           description: 6-digit OTP
 *           example: "123456"
 *
 *     CustomerProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           example: "John Customer"
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         email:
 *           type: string
 *           example: "customer@example.com"
 *         loyaltyPoints:
 *           type: number
 *           example: 150
 *         addresses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [home, work, other]
 *               address:
 *                 type: string
 *               landmark:
 *                 type: string
 *               city:
 *                 type: string
 *               pincode:
 *                 type: string
 *
 *     AddToCart:
 *       type: object
 *       required:
 *         - dishId
 *         - quantity
 *       properties:
 *         dishId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         specialInstructions:
 *           type: string
 *           example: "Extra spicy"
 *
 *     Cart:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               dishId:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               specialInstructions:
 *                 type: string
 *         total:
 *           type: number
 *           example: 598
 *
 *     PlaceOrder:
 *       type: object
 *       required:
 *         - outletId
 *         - orderType
 *         - paymentMethod
 *       properties:
 *         outletId:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         orderType:
 *           type: string
 *           enum: [dine-in, takeaway, delivery]
 *           example: "dine-in"
 *         tableId:
 *           type: string
 *           description: Required for dine-in orders
 *           example: "507f1f77bcf86cd799439011"
 *         deliveryAddress:
 *           type: object
 *           description: Required for delivery orders
 *           properties:
 *             address:
 *               type: string
 *             landmark:
 *               type: string
 *             city:
 *               type: string
 *             pincode:
 *               type: string
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, upi, wallet]
 *           example: "cash"
 */

/**
 * @swagger
 * /customer/auth/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Customer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerRegister'
 *     responses:
 *       201:
 *         description: Customer registered successfully, OTP sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Registration successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     customerId:
 *                       type: string
 *                     message:
 *                       type: string
 *                       example: "OTP sent to your phone number"
 *       400:
 *         description: Validation error or customer already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /customer/auth/login:
 *   post:
 *     summary: Login customer (sends OTP)
 *     tags: [Customer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerLogin'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "OTP sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     customerId:
 *                       type: string
 *                     message:
 *                       type: string
 *       404:
 *         description: Customer not found
 */

/**
 * @swagger
 * /customer/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and get authentication token
 *     tags: [Customer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOTP'
 *     responses:
 *       200:
 *         description: OTP verified, token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *                     customer:
 *                       $ref: '#/components/schemas/CustomerProfile'
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /customer/menu:
 *   get:
 *     summary: Browse restaurant menu (public)
 *     tags: [Customer]
 *     parameters:
 *       - in: query
 *         name: outletId
 *         required: true
 *         schema:
 *           type: string
 *         description: Outlet ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: dietaryTags
 *         schema:
 *           type: string
 *         description: Filter by dietary tags (comma-separated)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search dishes by name
 *     responses:
 *       200:
 *         description: Menu retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     dishes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Dish'
 *                     total:
 *                       type: integer
 */

/**
 * @swagger
 * /customer/profile:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CustomerProfile'
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     summary: Update customer profile
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               addresses:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /customer/cart:
 *   get:
 *     summary: Get customer cart
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *
 *   post:
 *     summary: Add item to cart
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCart'
 *     responses:
 *       200:
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *
 *   delete:
 *     summary: Clear cart
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 */

/**
 * @swagger
 * /customer/cart/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dish ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Set to 0 to remove item
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 */

/**
 * @swagger
 * /customer/orders:
 *   post:
 *     summary: Place order from cart
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlaceOrder'
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cart is empty or validation error
 *
 *   get:
 *     summary: Get customer order history
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by order status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of orders to return
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 */

/**
 * @swagger
 * /customer/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /customer/orders/{id}/cancel:
 *   post:
 *     summary: Cancel order
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
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
 *                 description: Reason for cancellation
 *                 example: "Changed my mind"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled at this stage
 *       404:
 *         description: Order not found
 */
