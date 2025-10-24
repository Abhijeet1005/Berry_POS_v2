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
 */

module.exports = {};
