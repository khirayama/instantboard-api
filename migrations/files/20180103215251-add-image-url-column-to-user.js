module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'image_url', { 
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'email',
    }, {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('users', 'image_url');
  }
};
