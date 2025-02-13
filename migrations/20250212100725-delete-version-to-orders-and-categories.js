"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn("Orders", "version");
    await queryInterface.removeColumn("Categories", "version");
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn("Orders", "version", {
      allowNull: false,
      defaultValue: 0,
      type: Sequelize.INTEGER.UNSIGNED,
    });
    await queryInterface.addColumn("Categories", "version", {
      allowNull: false,
      defaultValue: 0,
      type: Sequelize.INTEGER.UNSIGNED,
    });
  },
};
