/**
 * @swagger
 * tags:
 *   name: Loyalty
 *   description: Loyalty program management
 */

/**
 * @swagger
 * /api/v1/loyalty/customer/{customerId}:
 *   get:
 *     summary: Get customer loyalty balance
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Loyalty balance
 */

/**
 * @swagger
 * /api/v1/loyalty/earn:
 *   post:
 *     summary: Earn loyalty points
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *               orderId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Points earned
 */

/**
 * @swagger
 * /api/v1/loyalty/redeem:
 *   post:
 *     summary: Redeem loyalty points
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *               orderId:
 *                 type: string
 *               points:
 *                 type: number
 *     responses:
 *       200:
 *         description: Points redeemed
 */

module.exports = {};
