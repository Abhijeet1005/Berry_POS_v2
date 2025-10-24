/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Staff management
 */

/**
 * @swagger
 * /api/v1/staff:
 *   post:
 *     summary: Create staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               outletId:
 *                 type: string
 *               role:
 *                 type: string
 *               shift:
 *                 type: string
 *               salary:
 *                 type: number
 *     responses:
 *       201:
 *         description: Staff created
 *   get:
 *     summary: Get all staff
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staff
 */

/**
 * @swagger
 * /api/v1/staff/{id}/performance:
 *   get:
 *     summary: Get staff performance
 *     tags: [Staff]
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
 *         description: Performance metrics
 */

module.exports = {};
