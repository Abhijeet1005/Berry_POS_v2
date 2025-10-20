const reservationService = require('./reservationService');
const { successResponse, paginatedResponse } = require('../../utils/responseFormatter');
const { asyncHandler } = require('../../middleware/errorMiddleware');

/**
 * Create reservation
 * POST /api/v1/reservations
 */
const createReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationService.createReservation(req.body, req.tenantId);
  
  res.status(201).json(successResponse(reservation, 'Reservation created successfully'));
});

/**
 * Get availability
 * GET /api/v1/reservations/availability
 */
const getAvailability = asyncHandler(async (req, res) => {
  const availability = await reservationService.getAvailability(req.query, req.tenantId);
  
  res.json(successResponse(availability, 'Availability retrieved successfully'));
});

/**
 * Get all reservations
 * GET /api/v1/reservations
 */
const getReservations = asyncHandler(async (req, res) => {
  const result = await reservationService.getReservations(req.query, req.tenantId);
  
  res.json(paginatedResponse(
    result.reservations,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total
  ));
});

/**
 * Get reservation by ID
 * GET /api/v1/reservations/:id
 */
const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await reservationService.getReservationById(req.params.id, req.tenantId);
  
  res.json(successResponse(reservation, 'Reservation retrieved successfully'));
});

/**
 * Update reservation
 * PUT /api/v1/reservations/:id
 */
const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationService.updateReservation(
    req.params.id,
    req.body,
    req.tenantId
  );
  
  res.json(successResponse(reservation, 'Reservation updated successfully'));
});

/**
 * Cancel reservation
 * DELETE /api/v1/reservations/:id
 */
const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await reservationService.cancelReservation(req.params.id, req.tenantId);
  
  res.json(successResponse(reservation, 'Reservation cancelled successfully'));
});

/**
 * Add pre-order
 * POST /api/v1/reservations/:id/pre-order
 */
const addPreOrder = asyncHandler(async (req, res) => {
  const reservation = await reservationService.addPreOrder(
    req.params.id,
    req.body,
    req.tenantId
  );
  
  res.json(successResponse(reservation, 'Pre-order added successfully'));
});

module.exports = {
  createReservation,
  getAvailability,
  getReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
  addPreOrder
};
