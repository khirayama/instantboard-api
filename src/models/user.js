module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      imageUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'image_url',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
      tableName: 'users',
      timestamps: true,
      underscored: true,
    },
  );

  return User;
};
