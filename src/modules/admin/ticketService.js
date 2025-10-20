const SupportTicket = require('../../models/SupportTicket');
const User = require('../../models/User');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { parsePaginationParams, buildPaginationMeta } = require('../../utils/paginationHelper');

/**
 * Create support ticket
 */
const createTicket = async (ticketData, tenantId, userId) => {
  const { subject, description, priority, category } = ticketData;
  
  const ticket = new SupportTicket({
    tenantId,
    userId,
    subject,
    description,
    priority: priority || 'medium',
    category,
    status: 'open'
  });
  
  await ticket.save();
  
  // TODO: Send notification to support team
  
  return ticket;
};

/**
 * Get all tickets
 */
const getTickets = async (query) => {
  const { page, limit, skip } = parsePaginationParams(query);
  const { status, priority, category, tenantId, assignedTo } = query;
  
  const filter = {};
  
  if (status) {
    filter.status = status;
  }
  
  if (priority) {
    filter.priority = priority;
  }
  
  if (category) {
    filter.category = category;
  }
  
  if (tenantId) {
    filter.tenantId = tenantId;
  }
  
  if (assignedTo) {
    filter.assignedTo = assignedTo;
  }
  
  const tickets = await SupportTicket.find(filter)
    .populate('userId', 'firstName lastName email')
    .populate('tenantId', 'name')
    .populate('assignedTo', 'firstName lastName')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await SupportTicket.countDocuments(filter);
  
  return {
    tickets,
    pagination: buildPaginationMeta(page, limit, total)
  };
};

/**
 * Get ticket by ID
 */
const getTicketById = async (ticketId) => {
  const ticket = await SupportTicket.findById(ticketId)
    .populate('userId', 'firstName lastName email phone')
    .populate('tenantId', 'name type')
    .populate('assignedTo', 'firstName lastName email')
    .populate('responses.userId', 'firstName lastName');
  
  if (!ticket) {
    throw new NotFoundError('Support ticket');
  }
  
  return ticket;
};

/**
 * Update ticket status
 */
const updateTicketStatus = async (ticketId, status, userId) => {
  const ticket = await SupportTicket.findById(ticketId);
  
  if (!ticket) {
    throw new NotFoundError('Support ticket');
  }
  
  const oldStatus = ticket.status;
  ticket.status = status;
  
  if (status === 'resolved') {
    ticket.resolvedAt = new Date();
    ticket.resolvedBy = userId;
  }
  
  if (status === 'closed') {
    ticket.closedAt = new Date();
  }
  
  await ticket.save();
  
  // TODO: Send notification to ticket creator
  
  return ticket;
};

/**
 * Assign ticket
 */
const assignTicket = async (ticketId, assignedTo) => {
  const ticket = await SupportTicket.findById(ticketId);
  
  if (!ticket) {
    throw new NotFoundError('Support ticket');
  }
  
  // Validate assignee exists
  const assignee = await User.findById(assignedTo);
  if (!assignee) {
    throw new NotFoundError('User to assign');
  }
  
  ticket.assignedTo = assignedTo;
  ticket.assignedAt = new Date();
  await ticket.save();
  
  // TODO: Send notification to assignee
  
  return ticket;
};

/**
 * Add response to ticket
 */
const addResponse = async (ticketId, responseData, userId) => {
  const { message, isInternal } = responseData;
  
  const ticket = await SupportTicket.findById(ticketId);
  
  if (!ticket) {
    throw new NotFoundError('Support ticket');
  }
  
  ticket.responses.push({
    userId,
    message,
    isInternal: isInternal || false,
    createdAt: new Date()
  });
  
  await ticket.save();
  
  // TODO: Send notification to relevant parties
  
  return ticket;
};

/**
 * Escalate ticket
 */
const escalateTicket = async (ticketId, reason) => {
  const ticket = await SupportTicket.findById(ticketId);
  
  if (!ticket) {
    throw new NotFoundError('Support ticket');
  }
  
  // Increase priority
  if (ticket.priority === 'low') {
    ticket.priority = 'medium';
  } else if (ticket.priority === 'medium') {
    ticket.priority = 'high';
  } else if (ticket.priority === 'high') {
    ticket.priority = 'critical';
  }
  
  ticket.escalatedAt = new Date();
  ticket.escalationReason = reason;
  
  await ticket.save();
  
  // TODO: Send escalation notification
  
  return ticket;
};

/**
 * Get ticket statistics
 */
const getTicketStatistics = async (query) => {
  const { tenantId, startDate, endDate } = query;
  
  const filter = {};
  
  if (tenantId) {
    filter.tenantId = tenantId;
  }
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }
  
  const tickets = await SupportTicket.find(filter);
  
  const stats = {
    total: tickets.length,
    byStatus: {
      open: tickets.filter(t => t.status === 'open').length,
      'in-progress': tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    },
    byPriority: {
      low: tickets.filter(t => t.priority === 'low').length,
      medium: tickets.filter(t => t.priority === 'medium').length,
      high: tickets.filter(t => t.priority === 'high').length,
      critical: tickets.filter(t => t.priority === 'critical').length
    },
    byCategory: {},
    averageResolutionTime: 0
  };
  
  // Calculate by category
  tickets.forEach(ticket => {
    if (ticket.category) {
      stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1;
    }
  });
  
  // Calculate average resolution time
  const resolvedTickets = tickets.filter(t => t.resolvedAt);
  if (resolvedTickets.length > 0) {
    const totalTime = resolvedTickets.reduce((sum, ticket) => {
      return sum + (ticket.resolvedAt - ticket.createdAt);
    }, 0);
    stats.averageResolutionTime = Math.round(totalTime / resolvedTickets.length / (1000 * 60 * 60)); // in hours
  }
  
  return stats;
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  assignTicket,
  addResponse,
  escalateTicket,
  getTicketStatistics
};
