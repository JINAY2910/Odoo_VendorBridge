import { ActivityLog, User } from '../models/index.js';

export const getActivityLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = await ActivityLog.findAll({
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'performer', attributes: ['name', 'email'] }
      ]
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getActivityLogCount = async (req, res) => {
  try {
    const count = await ActivityLog.count();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};

