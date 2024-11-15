// src/migrations/[timestamp]-add-universityId-to-users.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'universityId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'universities',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'universityId');
  },
};
