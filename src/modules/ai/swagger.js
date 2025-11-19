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
 * /api/v1/ai/analyze-nutrition:
 *   post:
 *     summary: Analyze nutrition information
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
 *               dishId:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Nutrition analysis
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
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personalized recommendations
 */

/**
 * @swagger
 * /api/v1/ai/update-taste-profile:
 *   post:
 *     summary: Update customer taste profile
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
 *               customerId:
 *                 type: string
 *               preferences:
 *                 type: object
 *                 properties:
 *                   spicy:
 *                     type: number
 *                   sweet:
 *                     type: number
 *                   tangy:
 *                     type: number
 *                   salty:
 *                     type: number
 *     responses:
 *       200:
 *         description: Taste profile updated
 */

module.exports = {};
