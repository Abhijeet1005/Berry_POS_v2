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

/**
 * @swagger
 * /api/v1/analytics/staff:
 *   get:
 *     summary: Get staff analytics
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
 *         name: endDate:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Staff analytics data
 */

/**
 * @swagger
 * /api/v1/analytics/campaigns:
 *   get:
 *     summary: Get campaign analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Campaign analytics data
 */

/**
 * @swagger
 * /api/v1/analytics/reports/export:
 *   post:
 *     summary: Export analytics report
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *               - format
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [sales, dishes, customers, staff]
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, csv]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Report exported successfully
 */

module.exports = {};
