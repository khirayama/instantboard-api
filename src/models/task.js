module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'tasks',
    timestamps: true,
    underscored: true,
  });

  Task.createWithPriority = function (values) {
    return new Promise(resolve => {
      Task.count({
        where: {
          userId: values.userId,
          labelId: values.labelId,
        },
      }).then(count => {
        Task.create({
          userId: values.userId,
          labelId: values.labelId,
          content: values.content,
          priority: count,
          completed: false,
        }).then(task => {
          resolve(task);
        });
      });
    });
  };

  return Task;
};
