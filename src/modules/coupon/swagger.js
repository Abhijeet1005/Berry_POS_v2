/**
 * @swagger
 * tags:
 *   name: Coupons
 *   description: Coupon management
 */

/**
 * @swagger
 * /api/v1/coupons:
 *   post:
 *     summary: Create coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *               minOrderAmount:
 *                 type: number
 *               validFrom:
 *                 type: string
 *                 format: date
 *               validUntil:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Coupon created
 *   get:
 *     summary: Get all coupons
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons
 */

/**
 * @swagger
 * /api/v1/coupons/validate:
 *   post:
 *     summary: Validate coupon
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               orderAmount:
 *                 type: number
 *               customerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon validation result
 */

module.exports = {};
