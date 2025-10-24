/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing endpoints
 */

/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     summary: Process payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *               - paymentMethods
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethods:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     method:
 *                       type: string
 *                       enum: [cash, card, upi, wallet]
 *                     amount:
 *                       type: number
 *                     transactionId:
 *                       type: string
 *     responses:
 *       201:
 *         description: Payment processed
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/v1/payments/split:
 *   post:
 *     summary: Process split payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               paymentMethods:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Split payment processed
 */

/**
 * @swagger
 * /api/v1/payments/{id}/receipt:
 *   get:
 *     summary: Get payment receipt
 *     tags: [Payments]
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
 *         description: Receipt data
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /api/v1/payments/razorpay/create-order:
 *   post:
 *     summary: Create Razorpay order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Razorpay order created
 */

/**
 * @swagger
 * /api/v1/payments/razorpay/verify:
 *   post:
 *     summary: Verify Razorpay payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               razorpayOrderId:
 *                 type: string
 *               razorpayPaymentId:
 *                 type: string
 *               razorpaySignature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified
 */

module.exports = {};
