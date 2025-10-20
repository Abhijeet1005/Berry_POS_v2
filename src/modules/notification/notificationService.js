const { ValidationError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

/**
 * Send push notification
 */
const sendPushNotification = async (userId, notification) => {
  const { title, body, data } = notification;
  
  try {
    // TODO: Integrate with Firebase Cloud Messaging or similar service
    logger.info('Push notification sent', {
      userId,
      title,
      body
    });
    
    return {
      success: true,
      userId,
      title,
      body,
      sentAt: new Date()
    };
  } catch (error) {
    logger.error('Push notification failed:', error);
    throw new ValidationError('Failed to send push notification');
  }
};

/**
 * Send SMS
 */
const sendSMS = async (phone, message) => {
  try {
    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    logger.info('SMS sent', {
      phone,
      message: message.substring(0, 50) + '...'
    });
    
    return {
      success: true,
      phone,
      sentAt: new Date()
    };
  } catch (error) {
    logger.error('SMS sending failed:', error);
    throw new ValidationError('Failed to send SMS');
  }
};

/**
 * Send email
 */
const sendEmail = async (to, subject, body, html) => {
  try {
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    logger.info('Email sent', {
      to,
      subject
    });
    
    return {
      success: true,
      to,
      subject,
      sentAt: new Date()
    };
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw new ValidationError('Failed to send email');
  }
};

/**
 * Send WhatsApp message
 */
const sendWhatsApp = async (phone, message, templateId) => {
  try {
    // TODO: Integrate with WhatsApp Business API
    logger.info('WhatsApp message sent', {
      phone,
      templateId
    });
    
    return {
      success: true,
      phone,
      templateId,
      sentAt: new Date()
    };
  } catch (error) {
    logger.error('WhatsApp sending failed:', error);
    throw new ValidationError('Failed to send WhatsApp message');
  }
};

/**
 * Orchestrate notification sending across multiple channels
 */
const sendNotification = async (notificationData, tenantId) => {
  const { userId, customerId, channels, title, body, data, phone, email } = notificationData;
  
  const results = {
    success: [],
    failed: []
  };
  
  // Send to each requested channel
  for (const channel of channels) {
    try {
      let result;
      
      switch (channel) {
        case 'push':
          if (userId) {
            result = await sendPushNotification(userId, { title, body, data });
            results.success.push({ channel: 'push', ...result });
          }
          break;
          
        case 'sms':
          if (phone) {
            result = await sendSMS(phone, body);
            results.success.push({ channel: 'sms', ...result });
          }
          break;
          
        case 'email':
          if (email) {
            result = await sendEmail(email, title, body);
            results.success.push({ channel: 'email', ...result });
          }
          break;
          
        case 'whatsapp':
          if (phone) {
            result = await sendWhatsApp(phone, body);
            results.success.push({ channel: 'whatsapp', ...result });
          }
          break;
          
        default:
          logger.warn(`Unknown notification channel: ${channel}`);
      }
    } catch (error) {
      results.failed.push({
        channel,
        error: error.message
      });
    }
  }
  
  return results;
};

/**
 * Send order notification
 */
const sendOrderNotification = async (order, type, tenantId) => {
  const notificationMap = {
    'order_placed': {
      title: 'Order Placed',
      body: `Your order #${order.orderNumber} has been placed successfully.`
    },
    'order_confirmed': {
      title: 'Order Confirmed',
      body: `Your order #${order.orderNumber} has been confirmed and is being prepared.`
    },
    'order_ready': {
      title: 'Order Ready',
      body: `Your order #${order.orderNumber} is ready for pickup/delivery.`
    },
    'order_completed': {
      title: 'Order Completed',
      body: `Your order #${order.orderNumber} has been completed. Thank you!`
    },
    'order_cancelled': {
      title: 'Order Cancelled',
      body: `Your order #${order.orderNumber} has been cancelled.`
    }
  };
  
  const notification = notificationMap[type];
  
  if (!notification) {
    logger.warn(`Unknown order notification type: ${type}`);
    return;
  }
  
  // Get customer details
  if (order.customerId) {
    const Customer = require('../../models/Customer');
    const customer = await Customer.findById(order.customerId);
    
    if (customer) {
      return await sendNotification({
        customerId: customer._id,
        channels: ['push', 'sms'],
        title: notification.title,
        body: notification.body,
        phone: customer.phone,
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          type
        }
      }, tenantId);
    }
  }
};

/**
 * Send reservation reminder
 */
const sendReservationReminder = async (reservation, tenantId) => {
  const Customer = require('../../models/Customer');
  const customer = await Customer.findById(reservation.customerId);
  
  if (!customer) {
    return;
  }
  
  const reservationTime = new Date(reservation.reservationDate).toLocaleString();
  
  return await sendNotification({
    customerId: customer._id,
    channels: ['push', 'sms', 'whatsapp'],
    title: 'Reservation Reminder',
    body: `Reminder: You have a reservation for ${reservation.numberOfGuests} guests at ${reservationTime}.`,
    phone: customer.phone,
    data: {
      reservationId: reservation._id,
      type: 'reservation_reminder'
    }
  }, tenantId);
};

/**
 * Send feedback request
 */
const sendFeedbackRequest = async (order, tenantId) => {
  const Customer = require('../../models/Customer');
  const customer = await Customer.findById(order.customerId);
  
  if (!customer) {
    return;
  }
  
  const feedbackUrl = `${process.env.CUSTOMER_APP_URL}/feedback/${order._id}`;
  
  return await sendNotification({
    customerId: customer._id,
    channels: ['sms', 'whatsapp'],
    title: 'Share Your Feedback',
    body: `How was your experience with order #${order.orderNumber}? Share your feedback: ${feedbackUrl}`,
    phone: customer.phone,
    data: {
      orderId: order._id,
      type: 'feedback_request',
      url: feedbackUrl
    }
  }, tenantId);
};

/**
 * Send payment reminder
 */
const sendPaymentReminder = async (order, tenantId) => {
  const Customer = require('../../models/Customer');
  const customer = await Customer.findById(order.customerId);
  
  if (!customer) {
    return;
  }
  
  return await sendNotification({
    customerId: customer._id,
    channels: ['push', 'sms'],
    title: 'Payment Pending',
    body: `Payment pending for order #${order.orderNumber}. Total: ₹${order.total}`,
    phone: customer.phone,
    data: {
      orderId: order._id,
      type: 'payment_reminder'
    }
  }, tenantId);
};

/**
 * Send staff notification
 */
const sendStaffNotification = async (staffId, notification, tenantId) => {
  return await sendNotification({
    userId: staffId,
    channels: ['push'],
    title: notification.title,
    body: notification.body,
    data: notification.data
  }, tenantId);
};

/**
 * Send owner alert
 */
const sendOwnerAlert = async (outletId, alert, tenantId) => {
  const User = require('../../models/User');
  
  // Get all admins and managers for the outlet
  const owners = await User.find({
    tenantId,
    outletId,
    role: { $in: ['admin', 'manager'] },
    isActive: true
  });
  
  const results = [];
  
  for (const owner of owners) {
    const result = await sendNotification({
      userId: owner._id,
      channels: ['push', 'email'],
      title: alert.title,
      body: alert.body,
      email: owner.email,
      data: alert.data
    }, tenantId);
    
    results.push(result);
  }
  
  return results;
};

module.exports = {
  sendNotification,
  sendPushNotification,
  sendSMS,
  sendEmail,
  sendWhatsApp,
  sendOrderNotification,
  sendReservationReminder,
  sendFeedbackRequest,
  sendPaymentReminder,
  sendStaffNotification,
  sendOwnerAlert
};
