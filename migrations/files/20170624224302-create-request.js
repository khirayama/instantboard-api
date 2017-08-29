module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('requests', {
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
      member_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      label_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'refused'),
        allowNull: false,
        defaultValue: 'pending',
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
    return queryInterface.dropTable('requests');
  }
};
