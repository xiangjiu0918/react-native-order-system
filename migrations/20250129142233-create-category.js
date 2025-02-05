"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Categories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      goodId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      typeId: {
        type: Sequelize.INTEGER,
      },
      sizeId: {
        type: Sequelize.INTEGER,
      },
      inventory: {
        allowNull: false,
        type: Sequelize.INTEGERs,
      },
      price: {
        allowNull: false,
        type: Sequelize.DECIMAL,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
    await queryInterface.addIndex("Categories", {
      fields: ["typeId"],
    });
    await queryInterface.addIndex("Categories", {
      fields: ["sizeId"],
    });
    await queryInterface.addIndex("Categories", {
      fields: ["goodId"],
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Categories");
  },
};
