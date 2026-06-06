import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Payment extends Model {
  toJSON() {
    const values = { ...this.get() };
    if (values.id) {
      values._id = values.id;
    }
    if (values.invoice) {
      values.invoiceId = values.invoice;
      delete values.invoice;
    }
    if (values.creator) {
      values.createdBy = values.creator;
      delete values.creator;
    }
    return values;
  }
}

Payment.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoiceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amountPaid: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Payment'
});

export default Payment;