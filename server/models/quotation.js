import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Quotation extends Model {
  toJSON() {
    const values = { ...this.get() };
    if (values.id) {
      values._id = values.id;
    }
    if (values.vendor) {
      values.vendorId = values.vendor;
      delete values.vendor;
    }
    if (values.creator) {
      values.createdBy = values.creator;
      delete values.creator;
    }
    if (values.approver) {
      values.approvedBy = values.approver;
      delete values.approver;
    }
    return values;
  }
}

Quotation.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quotationNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lineItems: {
    type: DataTypes.JSON,
    allowNull: false
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  tax: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  discount: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  grandTotal: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending Approval'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rfqId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  timeline: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Quotation'
});

export default Quotation;