const Subscription = require('../../models/Subscription');
const Tenant = require('../../models/Tenant');
const { NotFoundError, ValidationError } = require('../../utils/errorHandler');
const { addDays } = require('../../utils/dateHelper');

/**
 * Create subscription
 */
const createSubscription = async (subscriptionData) => {
    const { tenantId, plan, billingCycle, startDate, features } = subscriptionData;

    // Validate tenant exists
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
        throw new NotFoundError('Tenant');
    }

    // Calculate end date based on billing cycle
    const start = startDate ? new Date(startDate) : new Date();
    let endDate;

    switch (billingCycle) {
        case 'monthly':
            endDate = addDays(start, 30);
            break;
        case 'quarterly':
            endDate = addDays(start, 90);
            break;
        case 'yearly':
            endDate = addDays(start, 365);
            break;
        default:
            throw new ValidationError('Invalid billing cycle');
    }

    const subscription = new Subscription({
        tenantId,
        plan,
        billingCycle,
        startDate: start,
        endDate,
        status: 'active',
        features: features || []
    });

    await subscription.save();

    return subscription;
};

/**
 * Get all subscriptions
 */
const getSubscriptions = async (query) => {
    const { status, plan, tenantId } = query;

    const filter = {};

    if (status) {
        filter.status = status;
    }

    if (plan) {
        filter.plan = plan;
    }

    if (tenantId) {
        filter.tenantId = tenantId;
    }

    const subscriptions = await Subscription.find(filter)
        .populate('tenantId', 'name type')
        .sort({ createdAt: -1 });

    return subscriptions;
};

/**
 * Get subscription by ID
 */
const getSubscriptionById = async (subscriptionId) => {
    const subscription = await Subscription.findById(subscriptionId)
        .populate('tenantId', 'name type email phone');

    if (!subscription) {
        throw new NotFoundError('Subscription');
    }

    return subscription;
};

/**
 * Update subscription
 */
const updateSubscription = async (subscriptionId, updateData) => {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
        throw new NotFoundError('Subscription');
    }

    Object.assign(subscription, updateData);
    await subscription.save();

    return subscription;
};

/**
 * Pause subscription
 */
const pauseSubscription = async (subscriptionId) => {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
        throw new NotFoundError('Subscription');
    }

    if (subscription.status !== 'active') {
        throw new ValidationError('Only active subscriptions can be paused');
    }

    subscription.status = 'paused';
    subscription.pausedAt = new Date();
    await subscription.save();

    return subscription;
};

/**
 * Resume subscription
 */
const resumeSubscription = async (subscriptionId) => {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
        throw new NotFoundError('Subscription');
    }

    if (subscription.status !== 'paused') {
        throw new ValidationError('Only paused subscriptions can be resumed');
    }

    subscription.status = 'active';
    subscription.pausedAt = null;
    await subscription.save();

    return subscription;
};

/**
 * Extend subscription
 */
const extendSubscription = async (subscriptionId, days) => {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
        throw new NotFoundError('Subscription');
    }

    subscription.endDate = addDays(subscription.endDate, days);
    await subscription.save();

    return subscription;
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (subscriptionId, reason) => {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
        throw new NotFoundError('Subscription');
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason;
    await subscription.save();

    return subscription;
};

/**
 * Get subscription analytics
 */
const getSubscriptionAnalytics = async () => {
    const subscriptions = await Subscription.find();

    const analytics = {
        total: subscriptions.length,
        active: subscriptions.filter(s => s.status === 'active').length,
        paused: subscriptions.filter(s => s.status === 'paused').length,
        cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
        expired: subscriptions.filter(s => s.status === 'expired').length,
        byPlan: {},
        byBillingCycle: {},
        revenue: {
            monthly: 0,
            total: 0
        }
    };

    subscriptions.forEach(sub => {
        // Count by plan
        analytics.byPlan[sub.plan] = (analytics.byPlan[sub.plan] || 0) + 1;

        // Count by billing cycle
        analytics.byBillingCycle[sub.billingCycle] = (analytics.byBillingCycle[sub.billingCycle] || 0) + 1;
    });

    return analytics;
};

module.exports = {
    createSubscription,
    getSubscriptions,
    getSubscriptionById,
    updateSubscription,
    pauseSubscription,
    resumeSubscription,
    extendSubscription,
    cancelSubscription,
    getSubscriptionAnalytics
};
