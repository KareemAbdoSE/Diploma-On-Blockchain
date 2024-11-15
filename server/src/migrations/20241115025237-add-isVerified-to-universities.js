// src/migrations/[timestamp]-add-isVerified-to-universities.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('universities', 'isVerified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('universities', 'verificationDocument', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('universities', 'verificationDocument');
    await queryInterface.removeColumn('universities', 'isVerified');
  },
};
