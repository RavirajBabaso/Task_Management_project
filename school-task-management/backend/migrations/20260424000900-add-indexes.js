'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add indexes for better query performance
    await queryInterface.addIndex('tasks', ['status'], {
      name: 'idx_tasks_status'
    });

    await queryInterface.addIndex('tasks', ['due_date'], {
      name: 'idx_tasks_due_date'
    });

    await queryInterface.addIndex('tasks', ['assigned_to'], {
      name: 'idx_tasks_assigned_to'
    });

    await queryInterface.addIndex('notifications', ['user_id'], {
      name: 'idx_notifications_user_id'
    });

    await queryInterface.addIndex('notifications', ['is_read'], {
      name: 'idx_notifications_is_read'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('tasks', 'idx_tasks_status');
    await queryInterface.removeIndex('tasks', 'idx_tasks_due_date');
    await queryInterface.removeIndex('tasks', 'idx_tasks_assigned_to');
    await queryInterface.removeIndex('notifications', 'idx_notifications_user_id');
    await queryInterface.removeIndex('notifications', 'idx_notifications_is_read');
  }
};