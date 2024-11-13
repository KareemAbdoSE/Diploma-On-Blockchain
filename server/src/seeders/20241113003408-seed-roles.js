'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = [
      { name: 'Student', createdAt: new Date(), updatedAt: new Date() },
      { name: 'UniversityAdmin', createdAt: new Date(), updatedAt: new Date() },
      { name: 'PlatformAdmin', createdAt: new Date(), updatedAt: new Date() },
    ];

    for (const role of roles) {
      const existingRole = await queryInterface.rawSelect('roles', {
        where: { name: role.name },
      }, ['id']);

      if (!existingRole) {
        await queryInterface.bulkInsert('roles', [role], {});
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
