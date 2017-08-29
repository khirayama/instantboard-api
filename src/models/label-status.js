module.exports = (sequelize, DataTypes) => {
  const LabelStatus = sequelize.define('LabelStatus', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    labelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'label_id',
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    visibled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    tableName: 'label_statuses',
    timestamps: true,
    underscored: true,
  });

  return LabelStatus;
};
