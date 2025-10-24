/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin panel management
 */

/**
 * @swagger
 * /api/v1/admin/tenants:
 *   get:
 *     summary: Get all tenants (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tenants
 */

/**
 * @swagger
 * /api/v1/admin/subscriptions:
 *   post:
 *     summary: Create subscription
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantId:
 *                 type: string
 *               plan:
 *                 type: string
 *               billingCycle:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription created
 *   get:
 *     summary: Get all subscriptions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscriptions
 */

/**
 * @swagger
 * /api/v1/admin/tickets:
 *   post:
 *     summary: Create support ticket
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantId:
 *                 type: string
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket created
 *   get:
 *     summary: Get all tickets
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 */

/**
 * @swagger
 * /api/v1/admin/features:
 *   get:
 *     summary: Get all features
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of features
 */

module.exports = {};
