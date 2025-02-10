"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Order.belongsTo(models.User, { as: "user" });
      models.Order.belongsTo(models.Category, { as: "category" });
      models.Order.belongsTo(models.Address, { as: "address" });
    }
  }
  Order.init(
    {
      orderId: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      goodId: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
      addressId: DataTypes.INTEGER,
      num: DataTypes.INTEGER,
      orderTime: DataTypes.DATE,
      paymentTime: DataTypes.DATE,
      status: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
