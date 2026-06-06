import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Vendor extends Model {
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

Vendor.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vendorName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactDetails: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gstNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Vendor'
});

export default Vendor;