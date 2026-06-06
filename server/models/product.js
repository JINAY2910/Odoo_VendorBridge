import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Product extends Model {
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

Product.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codeType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gstRate: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  defaultPrice: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Product'
});

export default Product;
