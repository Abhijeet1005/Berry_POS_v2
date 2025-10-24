/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: Table management endpoints
 */

/**
 * @swagger
 * /api/v1/tables:
 *   post:
 *     summary: Create a new table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - outletId
 *               - tableNumber
 *               - capacity
 *             properties:
 *               outletId:
 *                 type: string
 *               tableNumber:
 *                 type: string
 *               capacity:
 *                 type: number
 *               section:
 *                 type: string
 *     responses:
 *       201:
 *         description: Table created
 *   get:
 *     summary: Get all tables
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tables
 */

/**
 * @swagger
 * /api/v1/tables/{id}/qr:
 *   get:
 *     summary: Get table QR code
 *     tags: [Tables]
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
 *         description: QR code image
 */

/**
 * @swagger
 * /api/v1/tables/{id}/status:
 *   patch:
 *     summary: Update table status
 *     tags: [Tables]
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
 *                 enum: [available, occupied, reserved, cleaning]
 *     responses:
 *       200:
 *         description: Status updated
 */

module.exports = {};
