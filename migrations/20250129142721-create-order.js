"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderid: {
        type: Sequelize.STRING,
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      goodId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      categoryId: {
        type: Sequelize.INTEGER,
      },
      addressId: {
        type: Sequelize.INTEGER,
      },
      num: {
        type: Sequelize.INTEGER,
      },
      orderTime: {
        type: Sequelize.DATE,
      },
      paymentTime: {
        type: Sequelize.DATE,
      },
      status: {
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
    await queryInterface.addIndex("Orders", {
      fields: ["userId"],
    });
    await queryInterface.addIndex("Orders", {
      fields: ["categoryId"],
    });
    await queryInterface.addIndex("Orders", {
      fields: ["addressId"],
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Orders");
  },
};
