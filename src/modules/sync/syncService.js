const SyncQueue = require('../../models/SyncQueue');
const { ValidationError } = require('../../utils/errorHandler');
const logger = require('../../utils/logger');

/**
 * Push sync - client sends data to server
 */
const pushSync = async (syncData, tenantId, userId) => {
  const { entity, entityId, action, data, clientTimestamp, deviceId } = syncData;
  
  try {
    // Create sync queue entry
    const syncEntry = new SyncQueue({
      tenantId,
      userId,
      deviceId,
      entity,
      entityId,
      action,
      data,
      direction: 'push',
      status: 'pending',
      clientTimestamp: new Date(clientTimestamp),
      serverTimestamp: new Date()
    });
    
    await syncEntry.save();
    
    // Process sync based on entity type
    const result = await processPushSync(syncEntry);
    
    // Update sync entry status
    syncEntry.status = result.success ? 'completed' : 'failed';
    syncEntry.error = result.error;
    syncEntry.processedAt = new Date();
    await syncEntry.save();
    
    return {
      syncId: syncEntry._id,
      status: syncEntry.status,
      serverTimestamp: syncEntry.serverTimestamp,
      result
    };
  } catch (error) {
    logger.error('Push sync failed:', error);
    throw new ValidationError('Failed to process push sync');
  }
};

/**
 * Process push sync based on entity type
 */
const processPushSync = async (syncEntry) => {
  const { entity, action, data, tenantId } = syncEntry;
  
  try {
    let Model;
    
    // Get appropriate model
    switch (entity) {
      case 'order':
        Model = require('../../models/Order');
        break;
      case 'payment':
        Model = require('../../models/Payment');
        break;
      case 'customer':
        Model = require('../../models/Customer');
        break;
      case 'table':
        Model = require('../../models/Table');
        break;
      default:
        throw new Error(`Unknown entity type: ${entity}`);
    }
    
    // Perform action
    let result;
    
    switch (action) {
      case 'create':
        result = await Model.create({ ...data, tenantId });
        break;
        
      case 'update':
        result = await Model.findOneAndUpdate(
          { _id: syncEntry.entityId, tenantId },
          data,
          { new: true }
        );
        break;
        
      case 'delete':
        result = await Model.findOneAndDelete({
          _id: syncEntry.entityId,
          tenantId
        });
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    logger.error('Process push sync error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Pull sync - client requests data from server
 */
const pullSync = async (pullData, tenantId, userId) => {
  const { entities, lastSyncTimestamp, deviceId } = pullData;
  
  try {
    const changes = {};
    const serverTimestamp = new Date();
    
    // Get changes for each requested entity
    for (const entity of entities) {
      changes[entity] = await getEntityChanges(
        entity,
        lastSyncTimestamp,
        tenantId,
        userId
      );
    }
    
    // Record pull sync
    const syncEntry = new SyncQueue({
      tenantId,
      userId,
      deviceId,
      entity: 'multiple',
      action: 'pull',
      direction: 'pull',
      status: 'completed',
      clientTimestamp: lastSyncTimestamp ? new Date(lastSyncTimestamp) : null,
      serverTimestamp,
      processedAt: serverTimestamp
    });
    
    await syncEntry.save();
    
    return {
      syncId: syncEntry._id,
      serverTimestamp,
      changes,
      hasMore: false // TODO: Implement pagination
    };
  } catch (error) {
    logger.error('Pull sync failed:', error);
    throw new ValidationError('Failed to process pull sync');
  }
};

/**
 * Get entity changes since last sync
 */
const getEntityChanges = async (entity, lastSyncTimestamp, tenantId, userId) => {
  let Model;
  
  switch (entity) {
    case 'order':
      Model = require('../../models/Order');
      break;
    case 'payment':
      Model = require('../../models/Payment');
      break;
    case 'customer':
      Model = require('../../models/Customer');
      break;
    case 'table':
      Model = require('../../models/Table');
      break;
    case 'dish':
      Model = require('../../models/Dish');
      break;
    default:
      return [];
  }
  
  const filter = { tenantId };
  
  if (lastSyncTimestamp) {
    filter.updatedAt = { $gt: new Date(lastSyncTimestamp) };
  }
  
  const changes = await Model.find(filter)
    .sort({ updatedAt: 1 })
    .limit(100); // Limit to prevent large payloads
  
  return changes;
};

/**
 * Get sync status
 */
const getSyncStatus = async (query, tenantId, userId) => {
  const { deviceId, entity } = query;
  
  const filter = { tenantId, userId };
  
  if (deviceId) {
    filter.deviceId = deviceId;
  }
  
  if (entity) {
    filter.entity = entity;
  }
  
  const syncEntries = await SyncQueue.find(filter)
    .sort({ serverTimestamp: -1 })
    .limit(50);
  
  const stats = {
    total: syncEntries.length,
    pending: syncEntries.filter(s => s.status === 'pending').length,
    completed: syncEntries.filter(s => s.status === 'completed').length,
    failed: syncEntries.filter(s => s.status === 'failed').length,
    lastSync: syncEntries.length > 0 ? syncEntries[0].serverTimestamp : null
  };
  
  return {
    stats,
    recentSyncs: syncEntries.slice(0, 10)
  };
};

/**
 * Resolve sync conflict
 */
const resolveConflict = async (conflictData, tenantId, userId) => {
  const { syncId, resolution, data } = conflictData;
  
  const syncEntry = await SyncQueue.findOne({
    _id: syncId,
    tenantId,
    userId
  });
  
  if (!syncEntry) {
    throw new ValidationError('Sync entry not found');
  }
  
  if (syncEntry.status !== 'conflict') {
    throw new ValidationError('Sync entry is not in conflict state');
  }
  
  try {
    let result;
    
    switch (resolution) {
      case 'server_wins':
        // Keep server data, discard client changes
        syncEntry.status = 'completed';
        syncEntry.resolution = 'server_wins';
        break;
        
      case 'client_wins':
        // Apply client changes, overwrite server data
        result = await processPushSync({
          ...syncEntry.toObject(),
          data
        });
        syncEntry.status = result.success ? 'completed' : 'failed';
        syncEntry.resolution = 'client_wins';
        break;
        
      case 'merge':
        // Merge both versions
        const mergedData = { ...syncEntry.data, ...data };
        result = await processPushSync({
          ...syncEntry.toObject(),
          data: mergedData
        });
        syncEntry.status = result.success ? 'completed' : 'failed';
        syncEntry.resolution = 'merge';
        break;
        
      default:
        throw new ValidationError('Invalid resolution strategy');
    }
    
    syncEntry.resolvedAt = new Date();
    await syncEntry.save();
    
    return {
      syncId: syncEntry._id,
      status: syncEntry.status,
      resolution: syncEntry.resolution
    };
  } catch (error) {
    logger.error('Conflict resolution failed:', error);
    throw new ValidationError('Failed to resolve conflict');
  }
};

/**
 * Retry failed sync
 */
const retrySync = async (syncId, tenantId, userId) => {
  const syncEntry = await SyncQueue.findOne({
    _id: syncId,
    tenantId,
    userId
  });
  
  if (!syncEntry) {
    throw new ValidationError('Sync entry not found');
  }
  
  if (syncEntry.status !== 'failed') {
    throw new ValidationError('Only failed syncs can be retried');
  }
  
  // Reset status and retry
  syncEntry.status = 'pending';
  syncEntry.error = null;
  await syncEntry.save();
  
  const result = await processPushSync(syncEntry);
  
  syncEntry.status = result.success ? 'completed' : 'failed';
  syncEntry.error = result.error;
  syncEntry.processedAt = new Date();
  await syncEntry.save();
  
  return {
    syncId: syncEntry._id,
    status: syncEntry.status,
    result
  };
};

module.exports = {
  pushSync,
  pullSync,
  getSyncStatus,
  resolveConflict,
  retrySync
};
