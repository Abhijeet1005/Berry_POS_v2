/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Tenant/Outlet management
 */

/**
 * @swagger
 * /api/v1/tenants:
 *   post:
 *     summary: Create tenant (company or outlet)
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *               - contactInfo
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [company, outlet]
 *               name:
 *                 type: string
 *               parentTenant:
 *                 type: string
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: object
 *     responses:
 *       201:
 *         description: Tenant created
 *   get:
 *     summary: Get all tenants
 *     tags: [Tenants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tenants
 */

/**
 * @swagger
 * /api/v1/tenants/{id}:
 *   get:
 *     summary: Get tenant by ID
 *     tags: [Tenants]
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
 *         description: Tenant details
 *
 *   put:
 *     summary: Update tenant
 *     tags: [Tenants]
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
 *               name:
 *                 type: string
 *               contactInfo:
 *                 type: object
 *     responses:
 *       200:
 *         description: Tenant updated successfully
 *
 *   delete:
 *     summary: Delete tenant (soft delete)
 *     tags: [Tenants]
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
 *         description: Tenant deleted successfully
 */

/**
 * @swagger
 * /api/v1/tenants/{id}/hierarchy:
 *   get:
 *     summary: Get tenant hierarchy
 *     tags: [Tenants]
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
 *         description: Tenant hierarchy
 */

/**
 * @swagger
 * /api/v1/tenants/{id}/outlets:
 *   post:
 *     summary: Create outlet under a brand
 *     tags: [Tenants]
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
 *               - name
 *               - contactInfo
 *             properties:
 *               name:
 *                 type: string
 *               contactInfo:
 *                 type: object
 *     responses:
 *       201:
 *         description: Outlet created successfully
 */

/**
 * @swagger
 * /api/v1/tenants/{id}/subscription:
 *   get:
 *     summary: Get subscription details
 *     tags: [Tenants]
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
 *     tags: [Tenants]
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
 *               plan:
 *                 type: string
 *               billingCycle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 */

module.exports = {};
