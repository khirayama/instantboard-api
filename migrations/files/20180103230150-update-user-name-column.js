module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('users', 'name', {
      type: Sequelize.TEXT,
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('users', 'name', {
      type: Sequelize.STRING(126),
    });
  }
};
