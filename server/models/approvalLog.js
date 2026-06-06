import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

class ApprovalLog extends Model {
  toJSON() {
    const values = { ...this.get() };
    if (values.id) {
      values._id = values.id;
    }
    if (values.performer) {
      values.performedBy = values.performer;
      delete values.performer;
    }
    return values;
  }
}

ApprovalLog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entityType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  performedBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'ApprovalLog'
});

export default ApprovalLog;