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

/**
 * @swagger
 * /api/v1/sync/status:
 *   get:
 *     summary: Get sync status
 *     tags: [Sync]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sync status retrieved
 */

/**
 * @swagger
 * /api/v1/sync/resolve-conflict:
 *   post:
 *     summary: Resolve sync conflict
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
 *               conflictId:
 *                 type: string
 *               resolution:
 *                 type: string
 *                 enum: [server, client]
 *     responses:
 *       200:
 *         description: Conflict resolved
 */

/**
 * @swagger
 * /api/v1/sync/retry/{syncId}:
 *   post:
 *     summary: Retry failed sync
 *     tags: [Sync]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: syncId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sync retried successfully
 *       404:
 *         description: Sync record not found
 */

module.exports = {};
