import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (action, entity, entityId, userId) => {
  try {
    await ActivityLog.create({
      action,
      entity,
      entityId,
      performedBy: userId
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
