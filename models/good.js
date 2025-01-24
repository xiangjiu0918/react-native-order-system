'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Good extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Good.init({
    name: DataTypes.STRING,
    price: DataTypes.NUMBER,
    sale: DataTypes.NUMBER,
    district: DataTypes.STRING,
    postage: DataTypes.NUMBER,
    previewUrl: DataTypes.STRING,
    timeofSale: DataTypes.DATE,
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Good',
  });
  return Good;
};