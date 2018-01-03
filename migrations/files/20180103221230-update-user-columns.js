module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint('users', ['name'], {
        type: 'unique',
      }),
      queryInterface.changeColumn('users', 'email', {
        type: Sequelize.STRING(255),
      }),
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint('users', ['name'], {
        type: 'unique',
      }),
      queryInterface.changeColumn('users', 'email', {
        type: Sequelize.STRING(126),
      }),
    ]);
  }
};
