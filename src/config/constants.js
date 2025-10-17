module.exports = {
  // User roles
  ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    CAPTAIN: 'captain',
    CASHIER: 'cashier',
    KITCHEN: 'kitchen'
  },
  
  // Tenant types
  TENANT_TYPES: {
    COMPANY: 'company',
    BRAND: 'brand',
    OUTLET: 'outlet'
  },
  
  // Order types
  ORDER_TYPES: {
    DINE_IN: 'dine-in',
    TAKEAWAY: 'takeaway',
    DELIVERY: 'delivery'
  },
  
  // Order sources
  ORDER_SOURCES: {
    POS: 'pos',
    CUSTOMER_APP: 'customer-app',
    KIOSK: 'kiosk',
    SWIGGY: 'swiggy',
    ZOMATO: 'zomato'
  },
  
  // Order statuses
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    SERVED: 'served',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  // KOT statuses
  KOT_STATUS: {
    PENDING: 'pending',
    PREPARING: 'preparing',
    READY: 'ready'
  },
  
  // Payment methods
  PAYMENT_METHODS: {
    CASH: 'cash',
    CARD: 'card',
    UPI: 'upi',
    WALLET: 'wallet'
  },
  
  // Payment statuses
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },
  
  // Table statuses
  TABLE_STATUS: {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    RESERVED: 'reserved',
    CLEANING: 'cleaning'
  },
  
  // Reservation statuses
  RESERVATION_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SEATED: 'seated',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  
  // Valet statuses
  VALET_STATUS: {
    REQUESTED: 'requested',
    IN_QUEUE: 'in-queue',
    DISPATCHED: 'dispatched',
    DELIVERED: 'delivered'
  },
  
  // Dietary tags
  DIETARY_TAGS: {
    VEG: 'veg',
    NON_VEG: 'non-veg',
    VEGAN: 'vegan',
    JAIN: 'jain',
    EGGETARIAN: 'eggetarian'
  },
  
  // Coupon types
  COUPON_TYPES: {
    FLAT: 'flat',
    PERCENTAGE: 'percentage',
    BOGO: 'bogo'
  },
  
  // Loyalty transaction types
  LOYALTY_TRANSACTION_TYPES: {
    EARN: 'earn',
    REDEEM: 'redeem',
    BONUS: 'bonus',
    EXPIRE: 'expire'
  },
  
  // Customer segments
  CUSTOMER_SEGMENTS: {
    NEW: 'new',
    RETURNING: 'returning',
    VIP: 'vip'
  },
  
  // Feedback sentiments
  FEEDBACK_SENTIMENTS: {
    POSITIVE: 'positive',
    NEUTRAL: 'neutral',
    NEGATIVE: 'negative'
  },
  
  // Subscription tiers
  SUBSCRIPTION_TIERS: {
    BASIC: 'basic',
    PRO: 'pro',
    ENTERPRISE: 'enterprise'
  },
  
  // Subscription statuses
  SUBSCRIPTION_STATUS: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
  },
  
  // Ticket statuses
  TICKET_STATUS: {
    OPEN: 'open',
    IN_PROGRESS: 'in-progress',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
  },
  
  // Ticket priorities
  TICKET_PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
  },
  
  // Campaign types
  CAMPAIGN_TYPES: {
    COUPON: 'coupon',
    LOYALTY: 'loyalty',
    WHATSAPP: 'whatsapp'
  },
  
  // Campaign statuses
  CAMPAIGN_STATUS: {
    DRAFT: 'draft',
    ACTIVE: 'active',
    COMPLETED: 'completed'
  },
  
  // Sync operations
  SYNC_OPERATIONS: {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete'
  }
};
