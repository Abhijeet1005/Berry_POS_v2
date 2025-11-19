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
 * /api/v1/admin/subscriptions/analytics:
 *   get:
 *     summary: Get subscription analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription analytics data
 */

/**
 * @swagger
 * /api/v1/admin/subscriptions/{id}:
 *   get:
 *     summary: Get subscription by ID
 *     tags: [Admin]
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
 *         description: Subscription details
 *
 *   put:
 *     summary: Update subscription
 *     tags: [Admin]
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
 *     responses:
 *       200:
 *         description: Subscription updated
 */

/**
 * @swagger
 * /api/v1/admin/subscriptions/{id}/pause:
 *   post:
 *     summary: Pause subscription
 *     tags: [Admin]
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
 *         description: Subscription paused
 */

/**
 * @swagger
 * /api/v1/admin/subscriptions/{id}/resume:
 *   post:
 *     summary: Resume subscription
 *     tags: [Admin]
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
 *         description: Subscription resumed
 */

/**
 * @swagger
 * /api/v1/admin/subscriptions/{id}/cancel:
 *   post:
 *     summary: Cancel subscription
 *     tags: [Admin]
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
 *         description: Subscription cancelled
 */

/**
 * @swagger
 * /api/v1/admin/tickets/statistics:
 *   get:
 *     summary: Get ticket statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket statistics
 */

/**
 * @swagger
 * /api/v1/admin/tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Admin]
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
 *         description: Ticket details
 */

/**
 * @swagger
 * /api/v1/admin/tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status
 *     tags: [Admin]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in-progress, resolved, closed]
 *     responses:
 *       200:
 *         description: Ticket status updated
 */

/**
 * @swagger
 * /api/v1/admin/tickets/{id}/assign:
 *   post:
 *     summary: Assign ticket to agent
 *     tags: [Admin]
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
 *             required:
 *               - agentId
 *             properties:
 *               agentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket assigned
 */

/**
 * @swagger
 * /api/v1/admin/tickets/{id}/responses:
 *   post:
 *     summary: Add response to ticket
 *     tags: [Admin]
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
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Response added
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

/**
 * @swagger
 * /api/v1/admin/features/{key}:
 *   put:
 *     summary: Update feature
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
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
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Feature updated
 */

/**
 * @swagger
 * /api/v1/admin/features/{key}/enable:
 *   post:
 *     summary: Enable feature for tenant
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *             properties:
 *               tenantId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feature enabled for tenant
 */

/**
 * @swagger
 * /api/v1/admin/features/{key}/disable:
 *   post:
 *     summary: Disable feature for tenant
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *             properties:
 *               tenantId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feature disabled for tenant
 */

/**
 * @swagger
 * /api/v1/admin/features/tenant/{tenantId}:
 *   get:
 *     summary: Get tenant features
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tenantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tenant features
 */

/**
 * @swagger
 * /api/v1/admin/analytics:
 *   get:
 *     summary: Get admin analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin analytics data
 */

module.exports = {};
