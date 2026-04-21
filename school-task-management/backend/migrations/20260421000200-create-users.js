'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(191),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('CHAIRMAN', 'DIRECTOR', 'PROPERTY', 'FINANCE', 'ADMIN', 'PRINCIPAL', 'ADMISSION', 'HR', 'PURCHASE', 'IT', 'TRANSPORT'),
        allowNull: false
      },
      department_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    await queryInterface.addConstraint('departments', {
      fields: ['head_user_id'],
      type: 'foreign key',
      name: 'fk_departments_head_user_id',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint('departments', 'fk_departments_head_user_id');
    await queryInterface.dropTable('users');
  }
};
