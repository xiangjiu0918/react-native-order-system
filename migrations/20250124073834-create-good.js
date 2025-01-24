'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Goods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      price: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      sale: {
        default: 0,
        type: Sequelize.INTEGER
      },
      district: {
        allowNull: false,
        type: Sequelize.STRING
      },
      postage: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      previewUrl: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      timeofSale: {
        allowNull: false,
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Goods');
  }
};