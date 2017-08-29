module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('label_statuses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      label_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      visibled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('label_statuses');
  }
};
