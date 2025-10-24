/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
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
 *               - orderType
 *               - items
 *             properties:
 *               outletId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               tableId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *               orderType:
 *                 type: string
 *                 enum: [dine-in, takeaway, delivery]
 *                 example: dine-in
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dishId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     customization:
 *                       type: string
 *               specialInstructions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
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
 *         description: Order details
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
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
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, preparing, ready, served, completed, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/v1/orders/{id}/kot:
 *   post:
 *     summary: Generate KOT for order
 *     tags: [Orders]
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
 *         description: KOT generated
 *       404:
 *         description: Order not found
 */

module.exports = {};
