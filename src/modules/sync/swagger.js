/**
 * @swagger
 * tags:
 *   name: Sync
 *   description: Offline sync management
 */

/**
 * @swagger
 * /api/v1/sync/push:
 *   post:
 *     summary: Push sync changes
 *     tags: [Sync]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *               changes:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Changes pushed
 */

/**
 * @swagger
 * /api/v1/sync/pull:
 *   post:
 *     summary: Pull sync changes
 *     tags: [Sync]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: string
 *               lastSyncTimestamp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Changes pulled
 */

module.exports = {};
