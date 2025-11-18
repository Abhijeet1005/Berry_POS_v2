const dynoApiClient = require('./dynoApiClient');
const { DYNOAPI_PLATFORMS } = require('../../../config/constants');

/**
 * DynoAPI Service
 * Handles all interactions with DynoAPI for Swiggy and Zomato integrations
 */
class DynoApiService {
  /**
   * Get orders from platform
   */
  async getOrders(platform, resId = null) {
    const endpoint = resId 
      ? `/api/v1/${platform}/orders/${resId}`
      : `/api/v1/${platform}/orders`;
    
    return await dynoApiClient.get(endpoint);
  }
  
  /**
   * Accept an order
   */
  async acceptOrder(platform, orderId, prepTime = 30, resId = null) {
    const endpoint = resId
      ? `/api/v1/${platform}/orders/accept/${resId}`
      : `/api/v1/${platform}/orders/accept`;
    
    const params = {
      order_id: orderId,
      prep_time: prepTime
    };
    
    if (platform === DYNOAPI_PLATFORMS.ZOMATO) {
      params.delivery_time = prepTime;
    }
    
    return await dynoApiClient.post(endpoint, {}, params);
  }
  
  /**
   * Mark order as ready
   */
  async markOrderReady(platform, orderId, resId = null) {
    const endpoint = resId
      ? `/api/v1/${platform}/orders/${platform === 'swiggy' ? 'ready' : 'mark_ready'}/${resId}`
      : `/api/v1/${platform}/orders/${platform === 'swiggy' ? 'ready' : 'mark_ready'}`;
    
    const params = { order_id: orderId };
    
    return await dynoApiClient.post(endpoint, {}, params);
  }
  
  /**
   * Reject an order (Zomato only)
   */
  async rejectOrder(platform, orderId, restaurantId) {
    if (platform !== DYNOAPI_PLATFORMS.ZOMATO) {
      throw new Error('Reject order is only supported for Zomato');
    }
    
    const params = {
      restaurant_id: restaurantId,
      order_id: orderId
    };
    
    return await dynoApiClient.post('/api/v1/zomato/orders/reject', {}, params);
  }
  
  /**
   * Get items/menu from platform
   */
  async getItems(platform, resId = null) {
    const endpoint = resId
      ? `/api/v1/${platform}/items/${resId}`
      : `/api/v1/${platform}/items`;
    
    return await dynoApiClient.get(endpoint);
  }
  
  /**
   * Mark item as in stock
   */
  async markItemInStock(platform, itemId, resId = null) {
    const endpoint = resId
      ? `/api/v1/${platform}/items/${platform === 'swiggy' ? 'instock' : 'in_stock'}/${resId}`
      : `/api/v1/${platform}/items/${platform === 'swiggy' ? 'instock' : 'in_stock'}`;
    
    const params = { item_id: itemId };
    
    return await dynoApiClient.post(endpoint, {}, params);
  }
  
  /**
   * Mark item as out of stock
   */
  async markItemOutOfStock(platform, itemId, resId = null) {
    const endpoint = resId
      ? `/api/v1/${platform}/items/${platform === 'swiggy' ? 'outofstock' : 'out_of_stock'}/${resId}`
      : `/api/v1/${platform}/items/${platform === 'swiggy' ? 'outofstock' : 'out_of_stock'}`;
    
    const params = { item_id: itemId };
    
    return await dynoApiClient.post(endpoint, {}, params);
  }
  
  /**
   * Mark category as in stock
   */
  async markCategoryInStock(platform, categoryId, resId = null) {
    const endpoint = resId
      ? `/api/v1/${platform}/category/${platform === 'swiggy' ? 'instock' : 'in_stock'}/${resId}`
      : `/api/v1/${platform}/category/${platform === 'swiggy' ? 'instock' : 'in_stock'}`;
    
    const params = { category_id: categoryId };
    
    return await dynoApiClient.post(endpoint, {}, params);
  }
  
  /**
   * Mark category as out of stock
   */
  async markCategoryOutOfStock(platform, categoryId, resId = null) {
    const endpoint = resId
      ? `/api/v1/${platform}/category/${platform === 'swiggy' ? 'outofstock' : 'out_of_stock'}/${resId}`
      : `/api/v1/${platform}/category/${platform === 'swiggy' ? 'outofstock' : 'out_of_stock'}`;
    
    const params = { category_id: categoryId };
    
    return await dynoApiClient.post(endpoint, {}, params);
  }
  
  /**
   * Close outlet and set reopen time
   */
  async closeOutlet(platform, reopenTime = {}, resId = null) {
    const endpoint = resId
      ? `/api/v1/${platform}/close_outlet/${resId}`
      : `/api/v1/${platform}/close_outlet`;
    
    const params = {
      date: reopenTime.date || '',
      month: reopenTime.month || '',
      year: reopenTime.year || '',
      hour: reopenTime.hour || '',
      min: reopenTime.min || '',
      sec: reopenTime.sec || ''
    };
    
    return await dynoApiClient.post(endpoint, {}, params);
  }
  
  /**
   * Get order history
   */
  async getOrderHistory(platform, restaurantId) {
    const params = { restaurant_id: restaurantId };
    
    return await dynoApiClient.get(`/api/v1/${platform}/orderHistory`, params);
  }
  
  /**
   * Modify item price (Swiggy only)
   */
  async modifyItemPrice(restaurantId, itemId, amount) {
    const params = {
      restaurant_id: restaurantId,
      item_id: itemId,
      amount: amount.toString()
    };
    
    return await dynoApiClient.post('/api/v1/swiggy/item/price', {}, params);
  }
  
  /**
   * Get order details (Zomato only)
   */
  async getOrderDetails(orderId) {
    const params = { order_id: orderId };
    
    return await dynoApiClient.get('/api/v1/zomato/order/details', params);
  }
  
  /**
   * Get current orders (Zomato only)
   */
  async getCurrentOrders() {
    return await dynoApiClient.get('/api/v1/zomato/orders/current');
  }
}

module.exports = new DynoApiService();
