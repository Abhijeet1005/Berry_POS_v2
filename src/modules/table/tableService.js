const Table = require('../../models/Table');
const Order = require('../../models/Order');
const QRCode = require('qrcode');
const { NotFoundError, ValidationError, ConflictError } = require('../../utils/errorHandler');
const { TABLE_STATUS, ORDER_STATUS } = require('../../config/constants');

/**
 * Create a new table
 */
const createTable = async (tableData, tenantId) => {
  const { outletId, tableNumber, capacity, section } = tableData;
  
  // Check if table number already exists for this outlet
  const existingTable = await Table.findOne({ tenantId, outletId, tableNumber });
  if (existingTable) {
    throw new ConflictError('Table number already exists for this outlet');
  }
  
  // Generate QR code
  const qrData = JSON.stringify({
    tenantId,
    outletId,
    tableId: null, // Will be updated after save
    tableNumber
  });
  
  const table = new Table({
    tenantId,
    outletId,
    tableNumber,
    capacity,
    section,
    status: TABLE_STATUS.AVAILABLE
  });
  
  await table.save();
  
  // Generate QR code with table ID
  const qrCodeData = JSON.stringify({
    tenantId,
    outletId,
    tableId: table._id,
    tableNumber
  });
  
  const qrCode = await QRCode.toDataURL(qrCodeData);
  table.qrCode = qrCode;
  await table.save();
  
  return table;
};

/**
 * Get all tables
 */
const getTables = async (query, tenantId) => {
  const filter = { tenantId };
  
  if (query.outletId) {
    filter.outletId = query.outletId;
  }
  
  if (query.status) {
    filter.status = query.status;
  }
  
  if (query.section) {
    filter.section = query.section;
  }
  
  const tables = await Table.find(filter)
    .populate('currentOrderId', 'orderNumber total status')
    .sort({ tableNumber: 1 });
  
  return tables;
};

/**
 * Get table by ID
 */
const getTableById = async (tableId, tenantId) => {
  const table = await Table.findOne({ _id: tableId, tenantId })
    .populate('currentOrderId', 'orderNumber items total status createdAt');
  
  if (!table) {
    throw new NotFoundError('Table');
  }
  
  return table;
};

/**
 * Update table
 */
const updateTable = async (tableId, updateData, tenantId) => {
  const table = await Table.findOne({ _id: tableId, tenantId });
  
  if (!table) {
    throw new NotFoundError('Table');
  }
  
  // If table number is being changed, check for conflicts
  if (updateData.tableNumber && updateData.tableNumber !== table.tableNumber) {
    const existingTable = await Table.findOne({
      tenantId,
      outletId: table.outletId,
      tableNumber: updateData.tableNumber,
      _id: { $ne: tableId }
    });
    
    if (existingTable) {
      throw new ConflictError('Table number already exists for this outlet');
    }
  }
  
  Object.assign(table, updateData);
  await table.save();
  
  return table;
};

/**
 * Delete table
 */
const deleteTable = async (tableId, tenantId) => {
  const table = await Table.findOne({ _id: tableId, tenantId });
  
  if (!table) {
    throw new NotFoundError('Table');
  }
  
  // Check if table is occupied
  if (table.status === TABLE_STATUS.OCCUPIED) {
    throw new ValidationError('Cannot delete occupied table');
  }
  
  await table.deleteOne();
  
  return { message: 'Table deleted successfully' };
};

/**
 * Update table status
 */
const updateTableStatus = async (tableId, status, tenantId) => {
  const table = await Table.findOne({ _id: tableId, tenantId });
  
  if (!table) {
    throw new NotFoundError('Table');
  }
  
  // Validate status transition
  if (status === TABLE_STATUS.OCCUPIED && !table.currentOrderId) {
    throw new ValidationError('Cannot mark table as occupied without an active order');
  }
  
  table.status = status;
  
  // Clear current order if table is being marked as available
  if (status === TABLE_STATUS.AVAILABLE) {
    table.currentOrderId = null;
  }
  
  await table.save();
  
  return table;
};

/**
 * Transfer order between tables
 */
const transferOrder = async (fromTableId, toTableId, tenantId) => {
  const fromTable = await Table.findOne({ _id: fromTableId, tenantId });
  const toTable = await Table.findOne({ _id: toTableId, tenantId });
  
  if (!fromTable || !toTable) {
    throw new NotFoundError('Table');
  }
  
  if (!fromTable.currentOrderId) {
    throw new ValidationError('Source table has no active order');
  }
  
  if (toTable.status === TABLE_STATUS.OCCUPIED) {
    throw new ValidationError('Destination table is already occupied');
  }
  
  // Update order
  const order = await Order.findById(fromTable.currentOrderId);
  if (order) {
    order.tableId = toTableId;
    await order.save();
  }
  
  // Update tables
  toTable.currentOrderId = fromTable.currentOrderId;
  toTable.status = TABLE_STATUS.OCCUPIED;
  await toTable.save();
  
  fromTable.currentOrderId = null;
  fromTable.status = TABLE_STATUS.AVAILABLE;
  await fromTable.save();
  
  return { fromTable, toTable };
};

/**
 * Merge tables
 */
const mergeTables = async (tableIds, tenantId) => {
  if (tableIds.length < 2) {
    throw new ValidationError('At least 2 tables required for merging');
  }
  
  const tables = await Table.find({ _id: { $in: tableIds }, tenantId });
  
  if (tables.length !== tableIds.length) {
    throw new NotFoundError('One or more tables not found');
  }
  
  // Get all orders from the tables
  const orderIds = tables
    .filter(t => t.currentOrderId)
    .map(t => t.currentOrderId);
  
  if (orderIds.length === 0) {
    throw new ValidationError('No active orders on selected tables');
  }
  
  // Use the first table as the primary table
  const primaryTable = tables[0];
  const primaryOrder = await Order.findById(primaryTable.currentOrderId);
  
  if (!primaryOrder) {
    throw new NotFoundError('Primary order');
  }
  
  // Merge other orders into the primary order
  for (let i = 1; i < orderIds.length; i++) {
    const order = await Order.findById(orderIds[i]);
    if (order) {
      // Add items to primary order
      primaryOrder.items.push(...order.items);
      primaryOrder.calculateTotals();
      
      // Mark the merged order as cancelled
      order.status = ORDER_STATUS.CANCELLED;
      await order.save();
    }
  }
  
  await primaryOrder.save();
  
  // Update all tables to point to the primary order
  for (const table of tables) {
    table.currentOrderId = primaryOrder._id;
    table.status = TABLE_STATUS.OCCUPIED;
    await table.save();
  }
  
  return { primaryTable, mergedOrder: primaryOrder, tables };
};

/**
 * Get table by QR code
 */
const getTableByQRCode = async (qrData) => {
  const { tenantId, tableId } = JSON.parse(qrData);
  
  const table = await Table.findOne({ _id: tableId, tenantId })
    .populate('currentOrderId');
  
  if (!table) {
    throw new NotFoundError('Table');
  }
  
  return table;
};

/**
 * Regenerate QR code for table
 */
const regenerateQRCode = async (tableId, tenantId) => {
  const table = await Table.findOne({ _id: tableId, tenantId });
  
  if (!table) {
    throw new NotFoundError('Table');
  }
  
  const qrCodeData = JSON.stringify({
    tenantId,
    outletId: table.outletId,
    tableId: table._id,
    tableNumber: table.tableNumber
  });
  
  const qrCode = await QRCode.toDataURL(qrCodeData);
  table.qrCode = qrCode;
  await table.save();
  
  return table;
};

module.exports = {
  createTable,
  getTables,
  getTableById,
  updateTable,
  deleteTable,
  updateTableStatus,
  transferOrder,
  mergeTables,
  getTableByQRCode,
  regenerateQRCode
};
