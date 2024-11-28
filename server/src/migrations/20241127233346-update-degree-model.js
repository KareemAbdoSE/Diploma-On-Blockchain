'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get the current table description
    const table = await queryInterface.describeTable('degrees');

    // Add 'studentEmail' column if it doesn't exist
    if (!table.studentEmail) {
      await queryInterface.addColumn('degrees', 'studentEmail', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '',
      });
    }

    // Add 'status' column if it doesn't exist
    if (!table.status) {
      await queryInterface.addColumn('degrees', 'status', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'draft',
      });
    }

    // Modify 'userId' column to be nullable if it's not already
    if (table.userId.allowNull === false) {
      await queryInterface.changeColumn('degrees', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('degrees');

    // Remove 'studentEmail' column if it exists
    if (table.studentEmail) {
      await queryInterface.removeColumn('degrees', 'studentEmail');
    }

    // Remove 'status' column if it exists
    if (table.status) {
      await queryInterface.removeColumn('degrees', 'status');
    }

    // Revert 'userId' column to be non-nullable if it's nullable
    if (table.userId.allowNull === true) {
      await queryInterface.changeColumn('degrees', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: false,
      });
    }
  },
};
