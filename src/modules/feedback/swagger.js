/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Customer feedback management
 */

/**
 * @swagger
 * /api/v1/feedback:
 *   post:
 *     summary: Create feedback
 *     tags: [Feedback]
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
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *               categories:
 *                 type: object
 *                 properties:
 *                   food:
 *                     type: number
 *                   service:
 *                     type: number
 *                   ambiance:
 *                     type: number
 *     responses:
 *       201:
 *         description: Feedback created
 *   get:
 *     summary: Get all feedback
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of feedback
 */

/**
 * @swagger
 * /api/v1/feedback/analytics:
 *   get:
 *     summary: Get feedback analytics
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback analytics
 */

module.exports = {};
