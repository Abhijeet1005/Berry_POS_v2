/**
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered features
 */

/**
 * @swagger
 * /api/v1/ai/generate-dish-profile:
 *   post:
 *     summary: Generate AI dish profile
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dishName:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Generated dish profile
 */

/**
 * @swagger
 * /api/v1/ai/recommendations/{customerId}:
 *   get:
 *     summary: Get AI recommendations
 *     tags: [AI]
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
 *         description: Personalized recommendations
 */

module.exports = {};
