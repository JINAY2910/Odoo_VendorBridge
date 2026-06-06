import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Vendor extends Model {
  get name() {
    return this.vendorName;
  }
  set name(val) {
    this.vendorName = val;
  }

  get contactDetails() {
    if (this.phone && this.email) {
      return `${this.phone} (${this.email})`;
    }
    return this.phone || this.email || '';
  }
  set contactDetails(val) {
    this.phone = val;
  }

  toJSON() {
    const values = { ...this.get() };
    if (values.id) {
      values._id = values.id;
    }
    values.name = this.name;
    values.contactDetails = this.contactDetails;
    
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
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gstNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Services'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
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