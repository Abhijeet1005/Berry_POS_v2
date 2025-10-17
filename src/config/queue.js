const Queue = require('bull');
const config = require('./environment');

const redisConfig = {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined
  }
};

// Create queues for different job types
const notificationQueue = new Queue('notifications', redisConfig);
const analyticsQueue = new Queue('analytics', redisConfig);
const syncQueue = new Queue('sync', redisConfig);
const aiProcessingQueue = new Queue('ai-processing', redisConfig);
const integrationQueue = new Queue('integration', redisConfig);

// Queue event handlers
const setupQueueEvents = (queue, queueName) => {
  queue.on('completed', (job) => {
    console.log(`[${queueName}] Job ${job.id} completed`);
  });
  
  queue.on('failed', (job, err) => {
    console.error(`[${queueName}] Job ${job.id} failed:`, err);
  });
  
  queue.on('stalled', (job) => {
    console.warn(`[${queueName}] Job ${job.id} stalled`);
  });
};

setupQueueEvents(notificationQueue, 'notifications');
setupQueueEvents(analyticsQueue, 'analytics');
setupQueueEvents(syncQueue, 'sync');
setupQueueEvents(aiProcessingQueue, 'ai-processing');
setupQueueEvents(integrationQueue, 'integration');

module.exports = {
  notificationQueue,
  analyticsQueue,
  syncQueue,
  aiProcessingQueue,
  integrationQueue
};
