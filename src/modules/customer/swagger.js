/**
 * @swagger
 * /api/v1/customer/auth/register:
 *   post:
 *     summary: Register new customer
 *     tags: [Customer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       201:
 *         description: Registration successful, OTP sent
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/customer/auth/login:
 *   post:
 *     summary: Login customer (request OTP)
 *     tags: [Customer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: Customer not found
 */

/**
 * @swagger
 * /api/v1/customer/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and get auth token
 *     tags: [Customer Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                     token:
 *                       type: string
 *                     customer:
 *                       $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid OTP
 */

/**
 * @swagger
 * /api/v1/customer/menu:
 *   get:
 *     summary: Browse menu
 *     tags: [Customer]
 *     parameters:
 *       - in: query
 *         name: outletId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: dietaryTags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
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
 */

/**
 * @swagger
 * /api/v1/customer/cart:
 *   get:
 *     summary: Get shopping cart
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *             type: object
 *             required:
 *               - dishId
 *               - quantity
 *             properties:
 *               dishId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               specialInstructions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item added to cart
 *   delete:
 *     summary: Clear cart
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */

/**
 * @swagger
 * /api/v1/customer/orders:
 *   post:
 *     summary: Place order
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - outletId
 *               - orderType
 *               - paymentMethod
 *             properties:
 *               outletId:
 *                 type: string
 *               orderType:
 *                 type: string
 *                 enum: [dine-in, takeaway, delivery]
 *               tableId:
 *                 type: string
 *               deliveryAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, upi, wallet]
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
 *   get:
 *     summary: Get order history
 *     tags: [Customer]
 *     security:
 *       - customerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */

/**
 * @swagger
 * /api/v1/customer/orders/{id}:
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
 *     responses:
 *       200:
 *         description: Order details retrieved
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/v1/customer/orders/{id}/cancel:
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
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled
 */
