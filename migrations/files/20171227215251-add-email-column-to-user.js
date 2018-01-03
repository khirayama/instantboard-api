module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'email', {
      type: Sequelize.STRING(126),
      allowNull: true,
      unique: true,
      after: 'name',
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'email');
  }
};
