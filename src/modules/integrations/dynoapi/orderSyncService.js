const dynoApiService = require('./dynoApiService');
const PlatformIntegration = require('../../../models/PlatformIntegration');
const Order = require('../../../models/Order');
const Dish = require('../../../models/Dish');
const { DYNOAPI_PLATFORMS, ORDER_STATUS } = require('../../../config/constants');
const logger = require('../../../utils/logger');

/**
 * Order Sync Service
 * Handles polling and syncing orders from Swiggy and Zomato
 */
class OrderSyncService {
  /**
   * Poll orders from a platform
   */
  async pollOrders(platform, outletId, tenantId) {
    try {
      // Get platform integration
      const integration = await PlatformIntegration.findOne({
        outletId,
        platform,
        isActive: true
      });
      
      if (!integration) {
        logger.warn(`No active integration found for outlet ${outletId} on ${platform}`);
        return [];
      }
      
      // Fetch orders from platform
      const orders = await dynoApiService.getOrders(
        platform,
        integration.platformRestaurantId
      );
      
      if (!orders || !Array.isArray(orders)) {
        logger.warn(`No orders returned from ${platform}`);
        return [];
      }
      
      // Process each order
      const createdOrders = [];
      for (const platformOrder of orders) {
        try {
          const order = await this.processOrder(platformOrder, platform, outletId, tenantId, integration);
          if (order) {
            createdOrders.push(order);
          }
        } catch (error) {
          logger.error(`Error processing order from ${platform}:`, error);
        }
      }
      
      return createdOrders;
    } catch (error) {
      logger.error(`Error polling orders from ${platform}:`, error);
      throw error;
    }
  }
  
  /**
   * Process a single order
   */
  async processOrder(platformOrder, platform, outletId, tenantId, integration) {
    // Check if order already exists
    const existingOrder = await Order.findOne({
      'platformData.orderId': platformOrder.order_id || platformOrder.id,
      source: platform
    });
    
    if (existingOrder) {
      logger.info(`Order ${platformOrder.order_id || platformOrder.id} already exists`);
      return null;
    }
    
    // Parse order based on platform
    const parsedOrder = platform === DYNOAPI_PLATFORMS.SWIGGY
      ? this.parseSwiggyOrder(platformOrder)
      : this.parseZomatoOrder(platformOrder);
    
    // Create order in system
    const order = await this.createOrderInSystem(
      parsedOrder,
      platform,
      outletId,
      tenantId,
      integration
    );
    
    // Auto-accept if enabled
    if (integration.settings.autoAcceptOrders) {
      await this.acceptOrder(order, platform, integration);
    }
    
    return order;
  }
  
  /**
   * Parse Swiggy order format
   */
  parseSwiggyOrder(order) {
    return {
      platformOrderId: order.order_id,
      platformOrderNumber: order.order_number,
      customer: {
        name: order.customer?.name,
        phone: order.customer?.phone,
        address: order.delivery_address
      },
      items: order.items?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        platformItemId: item.item_id,
        customization: item.customization_text
      })) || [],
      subtotal: order.order_total,
      deliveryCharge: order.delivery_charge || 0,
      total: order.total_amount,
      paymentMethod: order.payment_mode,
      deliveryTime: order.delivery_time,
      specialInstructions: order.instructions,
      platformData: order
    };
  }
  
  /**
   * Parse Zomato order format
   */
  parseZomatoOrder(order) {
    return {
      platformOrderId: order.order_id || order.id,
      platformOrderNumber: order.order_number,
      customer: {
        name: order.customer?.name,
        phone: order.customer?.phone,
        address: order.delivery_address?.complete_address
      },
      items: order.order_items?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        platformItemId: item.id,
        customization: item.variant_name
      })) || [],
      subtotal: order.order_subtotal,
      deliveryCharge: order.delivery_charge || 0,
      total: order.order_total,
      paymentMethod: order.payment_method,
      deliveryTime: order.preparation_time,
      specialInstructions: order.cooking_instructions,
      platformData: order
    };
  }
  
  /**
   * Create order in system
   */
  async createOrderInSystem(parsedOrder, platform, outletId, tenantId, integration) {
    // Map items to dishes
    const orderItems = [];
    
    for (const item of parsedOrder.items) {
      // Find dish by platform item ID
      const mapping = integration.itemMappings.find(
        m => m.platformItemId === item.platformItemId
      );
      
      if (!mapping) {
        logger.warn(`No mapping found for platform item ${item.platformItemId}`);
        continue;
      }
      
      const dish = await Dish.findById(mapping.dishId);
      
      if (!dish) {
        logger.warn(`Dish not found for mapping ${mapping.dishId}`);
        continue;
      }
      
      orderItems.push({
        dishId: dish._id,
        name: dish.name,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization,
        status: 'pending'
      });
    }
    
    if (orderItems.length === 0) {
      throw new Error('No valid items found in order');
    }
    
    // Create order
    const order = new Order({
      tenantId,
      outletId,
      orderType: 'delivery',
      source: platform,
      items: orderItems,
      subtotal: parsedOrder.subtotal,
      taxAmount: 0,
      discountAmount: 0,
      total: parsedOrder.total,
      status: ORDER_STATUS.PENDING,
      specialInstructions: parsedOrder.specialInstructions,
      platformData: {
        orderId: parsedOrder.platformOrderId,
        orderNumber: parsedOrder.platformOrderNumber,
        customer: parsedOrder.customer,
        deliveryCharge: parsedOrder.deliveryCharge,
        paymentMethod: parsedOrder.paymentMethod,
        deliveryTime: parsedOrder.deliveryTime,
        rawData: parsedOrder.platformData
      }
    });
    
    await order.save();
    
    logger.info(`Order created from ${platform}: ${order.orderNumber}`);
    
    return order;
  }
  
  /**
   * Accept order on platform
   */
  async acceptOrder(order, platform, integration) {
    try {
      const prepTime = integration.settings.defaultPrepTime || 30;
      
      await dynoApiService.acceptOrder(
        platform,
        order.platformData.orderId,
        prepTime,
        integration.platformRestaurantId
      );
      
      // Update order status
      order.status = ORDER_STATUS.CONFIRMED;
      await order.save();
      
      logger.info(`Order ${order.orderNumber} accepted on ${platform}`);
    } catch (error) {
      logger.error(`Error accepting order ${order.orderNumber} on ${platform}:`, error);
      throw error;
    }
  }
  
  /**
   * Sync order status to platform
   */
  async syncOrderStatus(orderId, status) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order || !order.platformData?.orderId) {
        return;
      }
      
      const platform = order.source;
      
      if (platform !== DYNOAPI_PLATFORMS.SWIGGY && platform !== DYNOAPI_PLATFORMS.ZOMATO) {
        return;
      }
      
      // Get integration
      const integration = await PlatformIntegration.findOne({
        outletId: order.outletId,
        platform,
        isActive: true
      });
      
      if (!integration) {
        logger.warn(`No integration found for order ${order.orderNumber}`);
        return;
      }
      
      // Map status and update platform
      if (status === ORDER_STATUS.READY) {
        await dynoApiService.markOrderReady(
          platform,
          order.platformData.orderId,
          integration.platformRestaurantId
        );
        
        logger.info(`Order ${order.orderNumber} marked ready on ${platform}`);
      }
    } catch (error) {
      logger.error(`Error syncing order status:`, error);
      // Don't throw - this is a background sync
    }
  }
  
  /**
   * Poll orders from all platforms for an outlet
   */
  async pollAllPlatforms(outletId, tenantId) {
    const results = {
      swiggy: [],
      zomato: []
    };
    
    try {
      results.swiggy = await this.pollOrders(DYNOAPI_PLATFORMS.SWIGGY, outletId, tenantId);
    } catch (error) {
      logger.error('Error polling Swiggy orders:', error);
    }
    
    try {
      results.zomato = await this.pollOrders(DYNOAPI_PLATFORMS.ZOMATO, outletId, tenantId);
    } catch (error) {
      logger.error('Error polling Zomato orders:', error);
    }
    
    return results;
  }
}

module.exports = new OrderSyncService();
