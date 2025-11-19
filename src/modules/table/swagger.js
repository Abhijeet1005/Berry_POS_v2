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
 * /api/v1/tables/{id}:
 *   get:
 *     summary: Get table by ID
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
 *         description: Table details
 *       404:
 *         description: Table not found
 *
 *   put:
 *     summary: Update table
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
 *               tableNumber:
 *                 type: string
 *               capacity:
 *                 type: number
 *               section:
 *                 type: string
 *     responses:
 *       200:
 *         description: Table updated successfully
 *       404:
 *         description: Table not found
 *
 *   delete:
 *     summary: Delete table
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
 *         description: Table deleted successfully
 *       404:
 *         description: Table not found
 */

/**
 * @swagger
 * /api/v1/tables/transfer:
 *   post:
 *     summary: Transfer order between tables
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
 *               - orderId
 *               - fromTableId
 *               - toTableId
 *             properties:
 *               orderId:
 *                 type: string
 *               fromTableId:
 *                 type: string
 *               toTableId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order transferred successfully
 *       404:
 *         description: Table or order not found
 */

/**
 * @swagger
 * /api/v1/tables/merge:
 *   post:
 *     summary: Merge multiple tables
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
 *               - tableIds
 *             properties:
 *               tableIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of table IDs to merge
 *     responses:
 *       200:
 *         description: Tables merged successfully
 *       400:
 *         description: Invalid table IDs
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
 *
 *   post:
 *     summary: Regenerate table QR code
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
 *         description: QR code regenerated successfully
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
