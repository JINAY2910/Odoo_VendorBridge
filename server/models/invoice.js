import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Invoice extends Model {
  toJSON() {
    const values = { ...this.get() };
    if (values.id) {
      values._id = values.id;
    }
    if (values.po) {
      values.poId = values.po;
      delete values.po;
    }
    if (values.vendor) {
      values.vendorId = values.vendor;
      delete values.vendor;
    }
    if (values.creator) {
      values.createdBy = values.creator;
      delete values.creator;
    }
    return values;
  }
}

Invoice.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  poId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  items: {
    type: DataTypes.JSON,
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
  grandTotal: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Unpaid'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Invoice'
});

export default Invoice;