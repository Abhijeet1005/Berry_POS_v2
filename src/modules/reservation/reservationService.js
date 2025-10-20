const Reservation = require('../../models/Reservation');
const Table = require('../../models/Table');
const Customer = require('../../models/Customer');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');
const { addHours, isFuture, isPast } = require('../../utils/dateHelper');

/**
 * Create reservation
 */
const createReservation = async (reservationData, tenantId) => {
  const { customerId, outletId, reservationDate, reservationTime, numberOfGuests, tablePreference, specialRequests, preOrder } = reservationData;
  
  // Validate customer
  const customer = await Customer.findOne({ _id: customerId, tenantId });
  if (!customer) {
    throw new NotFoundError('Customer');
  }
  
  // Combine date and time
  const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);
  
  // Validate reservation is in future
  if (isPast(reservationDateTime)) {
    throw new ValidationError('Reservation date and time must be in the future');
  }
  
  // Check table availability
  const isAvailable = await checkAvailability(outletId, reservationDateTime, numberOfGuests, tenantId);
  
  if (!isAvailable) {
    throw new ValidationError('No tables available for the selected time and party size');
  }
  
  const reservation = new Reservation({
    customerId,
    tenantId,
    outletId,
    reservationDate: reservationDateTime,
    numberOfGuests,
    tablePreference,
    specialRequests,
    preOrder: preOrder || [],
    status: 'pending'
  });
  
  await reservation.save();
  
  // TODO: Schedule reminder notification
  
  return reservation;
};

/**
 * Check table availability
 */
const checkAvailability = async (outletId, reservationDateTime, numberOfGuests, tenantId) => {
  // Get all tables at outlet
  const tables = await Table.find({
    outletId,
    tenantId,
    isActive: true
  });
  
  if (tables.length === 0) {
    return false;
  }
  
  // Check for overlapping reservations (2-hour window)
  const startTime = new Date(reservationDateTime);
  const endTime = addHours(reservationDateTime, 2);
  
  const overlappingReservations = await Reservation.find({
    outletId,
    tenantId,
    status: { $in: ['pending', 'confirmed', 'seated'] },
    reservationDate: {
      $gte: addHours(startTime, -2),
      $lte: endTime
    }
  });
  
  // Calculate available capacity
  const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0);
  const reservedCapacity = overlappingReservations.reduce((sum, res) => sum + res.numberOfGuests, 0);
  const availableCapacity = totalCapacity - reservedCapacity;
  
  return availableCapacity >= numberOfGuests;
};

/**
 * Get availability for date
 */
const getAvailability = async (query, tenantId) => {
  const { outletId, date, numberOfGuests } = query;
  
  if (!outletId || !date || !numberOfGuests) {
    throw new ValidationError('outletId, date, and numberOfGuests are required');
  }
  
  const guests = parseInt(numberOfGuests);
  const targetDate = new Date(date);
  
  // Check availability for different time slots
  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];
  
  const availability = [];
  
  for (const time of timeSlots) {
    const dateTime = new Date(`${date}T${time}`);
    
    // Skip past times
    if (isPast(dateTime)) {
      continue;
    }
    
    const isAvailable = await checkAvailability(outletId, dateTime, guests, tenantId);
    
    availability.push({
      time,
      available: isAvailable
    });
  }
  
  return availability;
};

/**
 * Get reservation by ID
 */
const getReservationById = async (reservationId, tenantId) => {
  const reservation = await Reservation.findOne({ _id: reservationId, tenantId })
    .populate('customerId', 'name email phone')
    .populate('outletId', 'name address phone')
    .populate('tableId', 'tableNumber capacity')
    .populate('preOrder.dishId', 'name price');
  
  if (!reservation) {
    throw new NotFoundError('Reservation');
  }
  
  return reservation;
};

/**
 * Update reservation
 */
const updateReservation = async (reservationId, updateData, tenantId) => {
  const reservation = await Reservation.findOne({ _id: reservationId, tenantId });
  
  if (!reservation) {
    throw new NotFoundError('Reservation');
  }
  
  if (reservation.status === 'completed' || reservation.status === 'cancelled') {
    throw new ValidationError('Cannot update completed or cancelled reservation');
  }
  
  // If updating date/time/guests, check availability
  if (updateData.reservationDate || updateData.numberOfGuests) {
    const newDateTime = updateData.reservationDate || reservation.reservationDate;
    const newGuests = updateData.numberOfGuests || reservation.numberOfGuests;
    
    const isAvailable = await checkAvailability(
      reservation.outletId,
      newDateTime,
      newGuests,
      tenantId
    );
    
    if (!isAvailable) {
      throw new ValidationError('No tables available for the updated time and party size');
    }
  }
  
  Object.assign(reservation, updateData);
  await reservation.save();
  
  return reservation;
};

/**
 * Cancel reservation
 */
const cancelReservation = async (reservationId, tenantId) => {
  const reservation = await Reservation.findOne({ _id: reservationId, tenantId });
  
  if (!reservation) {
    throw new NotFoundError('Reservation');
  }
  
  if (reservation.status === 'completed' || reservation.status === 'cancelled') {
    throw new ValidationError('Reservation is already completed or cancelled');
  }
  
  reservation.status = 'cancelled';
  await reservation.save();
  
  return reservation;
};

/**
 * Add pre-order to reservation
 */
const addPreOrder = async (reservationId, preOrderData, tenantId) => {
  const { items } = preOrderData;
  
  const reservation = await Reservation.findOne({ _id: reservationId, tenantId });
  
  if (!reservation) {
    throw new NotFoundError('Reservation');
  }
  
  if (reservation.status !== 'pending' && reservation.status !== 'confirmed') {
    throw new ValidationError('Can only add pre-order to pending or confirmed reservations');
  }
  
  // Add items to pre-order
  items.forEach(item => {
    reservation.preOrder.push({
      dishId: item.dishId,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions
    });
  });
  
  await reservation.save();
  
  return reservation;
};

/**
 * Get reservations with filters
 */
const getReservations = async (query, tenantId) => {
  const { page, limit, skip } = parsePaginationParams(query);
  
  const filter = { tenantId };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.customerId) {
    filter.customerId = query.customerId;
  }
  
  if (query.status) {
    filter.status = query.status;
  }
  
  if (query.date) {
    const startOfDay = new Date(query.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(query.date);
    endOfDay.setHours(23, 59, 59, 999);
    
    filter.reservationDate = {
      $gte: startOfDay,
      $lte: endOfDay
    };
  }
  
  const reservations = await Reservation.find(filter)
    .populate('customerId', 'name phone')
    .populate('outletId', 'name')
    .populate('tableId', 'tableNumber')
    .skip(skip)
    .limit(limit)
    .sort({ reservationDate: 1 });
  
  const total = await Reservation.countDocuments(filter);
  
  return {
    reservations,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

module.exports = {
  createReservation,
  getAvailability,
  getReservationById,
  updateReservation,
  cancelReservation,
  addPreOrder,
  getReservations
};
