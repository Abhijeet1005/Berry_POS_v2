/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Audit log management
 */

/**
 * @swagger
 * /api/v1/audit/logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Audit]
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
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit logs
 */

/**
 * @swagger
 * /api/v1/audit/statistics:
 *   get:
 *     summary: Get audit statistics
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit statistics
 */

module.exports = {};
