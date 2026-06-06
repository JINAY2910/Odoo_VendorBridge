import { ApprovalLog, User } from '../models/index.js';

export const getApprovalLogs = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const logs = await ApprovalLog.findAll({
      where: {
        entityType,
        entityId
      },
      include: [{
        model: User,
        as: 'performer',
        attributes: ['id', 'name', 'role', 'email']
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Server error' });
  }
};
