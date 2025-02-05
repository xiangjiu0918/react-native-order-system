"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Goods", "price");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Goods", "price", {
      allowNull: false,
      type: Sequelize.INTEGER,
    });
  },
};
