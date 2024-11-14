'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'isVerified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Users will start as unverified
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'isVerified');
  },
};
