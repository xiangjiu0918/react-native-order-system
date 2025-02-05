"use strict";
const { Model } = require("sequelize");
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
      inventory: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Category",
    }
  );
  return Category;
};
