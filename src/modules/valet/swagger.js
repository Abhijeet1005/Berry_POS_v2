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
 * /api/v1/valet/performance:
 *   get:
 *     summary: Get valet performance metrics
 *     tags: [Valet]
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
 *         description: Valet performance data
 */

/**
 * @swagger
 * /api/v1/valet/requests/customer/{customerId}:
 *   get:
 *     summary: Get customer valet requests
 *     tags: [Valet]
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
 *         description: Customer valet requests
 */

/**
 * @swagger
 * /api/v1/valet/requests/{id}:
 *   get:
 *     summary: Get valet request by ID
 *     tags: [Valet]
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
 *         description: Valet request details
 *       404:
 *         description: Valet request not found
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
 *                 enum: [pending, parked, retrieving, completed, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 */

module.exports = {};
