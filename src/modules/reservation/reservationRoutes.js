const express = require('express');
const router = express.Router();
const reservationController = require('./reservationController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { tenantMiddleware } = require('../../middleware/tenantMiddleware');
const { rbacMiddleware } = require('../../middleware/rbacMiddleware');
const { validate } = require('../../middleware/validationMiddleware');
const reservationValidation = require('./reservationValidation');

// Apply auth and tenant middleware to all routes
router.use(authMiddleware);
router.use(tenantMiddleware);

// Create reservation (all authenticated users)
router.post(
  '/',
  validate(reservationValidation.createReservation),
  reservationController.createReservation
);

// Get all reservations (admin, manager, captain)
router.get(
  '/',
  rbacMiddleware(['admin', 'manager', 'captain']),
  validate(reservationValidation.getReservations),
  reservationController.getReservations
);

// Get availability (all authenticated users)
router.get(
  '/availability',
  validate(reservationValidation.getAvailability),
  reservationController.getAvailability
);

// Get reservation by ID (all authenticated users)
router.get(
  '/:id',
  validate(reservationValidation.getReservationById),
  reservationController.getReservationById
);

// Update reservation (all authenticated users)
router.put(
  '/:id',
  validate(reservationValidation.updateReservation),
  reservationController.updateReservation
);

// Cancel reservation (all authenticated users)
router.delete(
  '/:id',
  validate(reservationValidation.cancelReservation),
  reservationController.cancelReservation
);

// Add pre-order (all authenticated users)
router.post(
  '/:id/pre-order',
  validate(reservationValidation.addPreOrder),
  reservationController.addPreOrder
);

module.exports = router;
