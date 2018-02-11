const Sequelize = require('sequelize');

function _getRequests(label, requests, users) {
  const requests_ = [];
  for (let j = 0; j < requests.length; j++) {
    const request = requests[j];
    if (label.id === request.labelId) {
      for (let k = 0; k < users.length; k++) {
        const user = users[k];
        if (user.id === request.memberId) {
          requests_.push({
            id: request.id,
            status: request.status,
            member: {
              id: user.id,
              name: user.name,
              email: user.email,
              imageUrl: user.imageUrl,
            },
          });
        }
      }
    }
  }
  return requests_;
}

module.exports = (sequelize, DataTypes) => {
  const Label = sequelize.define(
    'Label',
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      tableName: 'labels',
      timestamps: true,
      underscored: true,
    },
  );

  // Public static findAllFromStatus
  // public static findByIdAndUser
  // public static createWithStatus
  // public static updateWithStatus
  // public static destroyByUser
  // public static sort

  Label.findAllFromStatus = async function(options = {}) {
    const LabelStatus = sequelize.models.LabelStatus;
    const Request = sequelize.models.Request;
    const User = sequelize.models.User;

    const labelStatuses = await LabelStatus.findAll(options);
    const labelIds = labelStatuses.map(labelStatus => labelStatus.labelId);
    const values = await Promise.all([
      Label.findAll({
        where: { id: labelIds },
      }),
      Request.findAll({
        where: { labelId: labelIds },
      }),
    ]);
    const labels = values[0];
    const requests = values[1];

    const userIds = [].concat(
      requests.map(request => request.memberId),
      requests.map(request => request.userId),
    );
    const users = await User.findAll({
      where: { id: userIds },
    });
    const labels_ = labelStatuses.map(labelStatus => {
      let newLabel = {};
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        if (label.id === labelStatus.labelId) {
          newLabel = {
            id: label.id,
            name: label.name,
            priority: labelStatus.priority,
            visibled: labelStatus.visibled,
            createdAt: label.createdAt,
            updatedAt: label.updatedAt,
            requests: _getRequests(label, requests, users),
          };
        }
      }
      return newLabel;
    });
    return labels_;
  };

  Label.findByIdAndUser = async function(labelId, userId) {
    const LabelStatus = sequelize.models.LabelStatus;
    const Request = sequelize.models.Request;
    const User = sequelize.models.User;

    const values = await Promise.all([
      Label.findById(labelId),
      LabelStatus.findOne({
        where: { userId, labelId },
      }),
      Request.findAll({
        where: { labelId },
      }),
    ]);
    const label = values[0];
    const labelStatus = values[1];
    const requests = values[2];

    const userIds = [].concat(requests.map(request => request.memberId), requests.map(request => request.userId));
    const users = await User.findAll({
      where: { id: userIds },
    });
    return {
      id: label.id,
      name: label.name,
      priority: labelStatus.priority,
      visibled: labelStatus.visibled,
      createdAt: label.createdAt,
      updatedAt: label.updatedAt,
      requests: _getRequests(label, requests, users),
    };
  };

  Label.createWithStatus = async function(values) {
    // Property: userId, name
    const LabelStatus = sequelize.models.LabelStatus;
    const Request = sequelize.models.Request;

    const values_ = await Promise.all([
      Label.create({
        userId: values.userId,
        name: values.name,
      }),
      LabelStatus.count({
        where: {
          userId: values.userId,
        },
      }),
    ]);
    const label = values_[0];
    const count = values_[1];

    await LabelStatus.create({
      userId: values.userId,
      labelId: label.id,
      priority: count,
      visibled: true,
    });
    const label_ = await Label.findByIdAndUser(label.id, values.userId);
    await Request.create({
      userId: values.userId,
      memberId: values.userId,
      labelId: label.id,
      status: 'accepted',
    });
    return label_;
  };

  Label.updateWithStatus = async function(labelId, userId, values) {
    const LabelStatus = sequelize.models.LabelStatus;

    const values_ = await Promise.all([Label.findById(labelId), LabelStatus.findOne({ where: { userId, labelId } })]);
    const label = values_[0];
    const labelStatus = values_[1];

    await Promise.all([
      label.update({
        name: values.name === undefined ? label.name : values.name,
      }),
      labelStatus.update({
        visibled: values.visibled === undefined ? labelStatus.visibled : values.visibled,
      }),
    ]);
    const label_ = await Label.findByIdAndUser(labelId, userId);
    return label_;
  };

  Label.destroyByUser = async function(labelId, userId) {
    const LabelStatus = sequelize.models.LabelStatus;
    const Task = sequelize.models.Task;
    const Request = sequelize.models.Request;

    const cachedLabel = await Label.findByIdAndUser(labelId, userId);
    const labelStatuses = await LabelStatus.findAll({
      where: {
        userId,
        priority: {
          [Sequelize.Op.gt]: cachedLabel.priority,
        },
      },
    });
    labelStatuses.forEach(labelStatus => {
      labelStatus.update({ priority: labelStatus.priority - 1 });
    });
    await LabelStatus.destroy({
      where: { labelId, userId },
    });
    const count = await LabelStatus.count({
      where: { labelId },
    });
    if (count === 0) {
      // If destroy label, remove request and task
      await Label.destroy({
        where: { id: labelId },
      })
      await Promise.all([
        Request.destroy({
          where: { labelId },
        }),
        Task.destroy({
          where: { labelId },
        }),
      ]);
      return cachedLabel;
    }
    // If don't destroy label, remove request
    await Request.destroy({
      where: { labelId, memberId: userId },
    })
    return cachedLabel;
  };

  Label.sort = async function(labelId, userId, priority) {
    const LabelStatus = sequelize.models.LabelStatus;

    const labelStatus = await LabelStatus.findOne({
      where: { userId, labelId },
    });
    if (labelStatus.priority < priority) {
      const labelStatuses = await LabelStatus.findAll({
        where: {
          userId,
          priority: {
            [Sequelize.Op.gt]: labelStatus.priority,
            [Sequelize.Op.lte]: priority,
          },
        },
      });
      labelStatuses.forEach(labelStatus_ => {
        labelStatus_.update({ priority: labelStatus_.priority - 1 });
      });
      await labelStatus.update({ priority });
      const labels = await Label.findAllFromStatus({
        where: { userId },
        order: [['priority', 'ASC']],
      });
      return labels;
    } else if (labelStatus.priority > priority) {
      const labelStatuses = await LabelStatus.findAll({
        where: {
          userId,
          priority: {
            [Sequelize.Op.gte]: priority,
            [Sequelize.Op.lt]: labelStatus.priority,
          },
        },
      });
      labelStatuses.forEach(labelStatus_ => {
        labelStatus_.update({ priority: labelStatus_.priority + 1 });
      });
      await labelStatus.update({ priority });
      const labels = await Label.findAllFromStatus({
        where: { userId },
        order: [['priority', 'ASC']],
      });
      return labels;
    }
  };

  return Label;
}
