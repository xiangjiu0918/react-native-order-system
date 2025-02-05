"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Good extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Good.hasMany(models.Category, { as: "categories" });
      models.Good.hasMany(models.Type, { as: "types" });
      models.Good.hasMany(models.Size, { as: "sizes" });
    }
  }
  Good.init(
    {
      name: DataTypes.STRING,
      sale: DataTypes.INTEGER,
      district: DataTypes.STRING,
      postage: DataTypes.INTEGER,
      previewUrl: DataTypes.STRING,
      timeOfSale: DataTypes.DATE,
      status: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Good",
    }
  );
  return Good;
};
