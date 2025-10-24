/**
 * @swagger
 * tags:
 *   name: Valet
 *   description: Valet service management
 */

/**
 * @swagger
 * /api/v1/valet/requests:
 *   post:
 *     summary: Create valet request
 *     tags: [Valet]
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
 *               outletId:
 *                 type: string
 *               vehicleNumber:
 *                 type: string
 *               vehicleType:
 *                 type: string
 *               requestType:
 *                 type: string
 *                 enum: [park, retrieve]
 *     responses:
 *       201:
 *         description: Valet request created
 *   get:
 *     summary: Get valet requests
 *     tags: [Valet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of valet requests
 */

/**
 * @swagger
 * /api/v1/valet/requests/{id}/status:
 *   patch:
 *     summary: Update valet status
 *     tags: [Valet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 */

module.exports = {};
