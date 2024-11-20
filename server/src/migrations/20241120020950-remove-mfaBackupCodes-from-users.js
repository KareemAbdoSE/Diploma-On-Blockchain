'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'mfaBackupCodes');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'mfaBackupCodes', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
  },
};