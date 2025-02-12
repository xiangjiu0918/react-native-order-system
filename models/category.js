"use strict";
const { Model } = require("sequelize");
const { NotFound } = require("http-errors");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Category.belongsTo(models.Type, { as: "type" });
      models.Category.belongsTo(models.Size, { as: "size" });
      models.Category.belongsTo(models.Good, { as: "good" });
    }
  }
  Category.init(
    {
      typeId: DataTypes.INTEGER,
      sizeId: DataTypes.INTEGER,
      goodId: DataTypes.INTEGER,
      inventory: {
        type: DataTypes.INTEGER,
        set(value) {
          if (value < 0) {
            throw new NotFound("库存不足！");
          } else {
            this.setDataValue("inventory", value);
          }
        },
      },
      price: DataTypes.INTEGER,
      version: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Category",
      version: true, // 乐观锁
    }
  );
  return Category;
};
