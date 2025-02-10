"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Preselects", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      goodId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      categoryId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      addressId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      num: {
        defaultValue: 1,
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex("Preselects", {
      fields: ["userId"],
    });
    await queryInterface.addIndex("Preselects", {
      fields: ["categoryId"],
    });
    await queryInterface.addIndex("Preselects", {
      fields: ["addressId"],
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Preselects");
  },
};
