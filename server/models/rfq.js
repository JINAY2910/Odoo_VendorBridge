import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

class RFQ extends Model {
  toJSON() {
    const values = { ...this.get() };
    if (values.id) {
      values._id = values.id;
    }
    if (values.creator) {
      values.createdBy = values.creator;
      delete values.creator;
    }
    return values;
  }
}

RFQ.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  rfqNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  items: {
    type: DataTypes.JSON, // array of { name, quantity, unit }
    allowNull: false
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING, // open/closed/awarded
    defaultValue: 'open'
  },
  assignedVendors: {
    type: DataTypes.JSON, // array of vendor IDs
    allowNull: true,
    defaultValue: []
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'RFQ'
});

export default RFQ;
