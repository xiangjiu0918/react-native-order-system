'use strict';
const {
  Model
} = require('sequelize');
const { BadRequest } = require('http-errors');
module.exports = (sequelize, DataTypes) => {
  class Address extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Address.belongsTo(models.User, { as: 'user' });
    }
  }
  Address.init({
    userId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    tel: {
      type: DataTypes.STRING,
      set(value) {
        if (value) {
          if (value.match(/^1[3-9]\d{9}$/)) {
            this.setDataValue('tel', value);
          } else {
            throw new BadRequest('手机号不合法！');
          }
        }
      }
    },
    district: DataTypes.STRING,
    detail: DataTypes.TEXT,
    default: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Address',
  });
  return Address;
};