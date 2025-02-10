"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Preselect extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Preselect.belongsTo(models.User, { as: "user" });
      models.Preselect.belongsTo(models.Category, { as: "category" });
      models.Preselect.belongsTo(models.Address, { as: "address" });
    }
  }
  Preselect.init(
    {
      userId: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
      addressId: DataTypes.INTEGER,
      num: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Preselect",
    }
  );
  return Preselect;
};
