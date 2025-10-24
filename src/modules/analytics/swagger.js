/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and reporting
 */

/**
 * @swagger
 * /api/v1/analytics/sales:
 *   get:
 *     summary: Get sales analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Sales analytics data
 */

/**
 * @swagger
 * /api/v1/analytics/dishes:
 *   get:
 *     summary: Get dish analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dish analytics data
 */

/**
 * @swagger
 * /api/v1/analytics/customers:
 *   get:
 *     summary: Get customer analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer analytics data
 */

module.exports = {};
