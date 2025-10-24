/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Table reservation management
 */

/**
 * @swagger
 * /api/v1/reservations:
 *   post:
 *     summary: Create reservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               outletId:
 *                 type: string
 *               customerName:
 *                 type: string
 *               customerPhone:
 *                 type: string
 *               partySize:
 *                 type: number
 *               reservationDate:
 *                 type: string
 *                 format: date
 *               reservationTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reservation created
 *   get:
 *     summary: Get all reservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reservations
 */

/**
 * @swagger
 * /api/v1/reservations/availability:
 *   get:
 *     summary: Check availability
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: outletId
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *       - in: query
 *         name: partySize
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Availability status
 */

module.exports = {};
