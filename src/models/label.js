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
            },
          });
        } else if (user.id === label.userId) {
          requests_.push({
            id: request.id,
            status: 'accepted',
            member: {
              id: user.id,
              name: user.name,
            },
          });
        }
      }
    }
  }
  return requests_;
}

module.exports = (sequelize, DataTypes) => {
  const Label = sequelize.define('Label', {
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
  }, {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    tableName: 'labels',
    timestamps: true,
    underscored: true,
  });

  // Public static findAllFromStatus
  // public static findByIdAndUser
  // public static createWithStatus
  // public static updateWithStatus
  // public static destroyByUser
  // public static sort

  Label.findAllFromStatus = function (options = {}) {
    const LabelStatus = sequelize.models.LabelStatus;
    const Request = sequelize.models.Request;
    const User = sequelize.models.User;

    return new Promise(resolve => {
      LabelStatus.findAll(options).then(labelStatuses => {
        const labelIds = labelStatuses.map(labelStatus => labelStatus.labelId);
        Promise.all([
          Label.findAll({
            where: {id: labelIds},
          }),
          Request.findAll({
            where: {labelId: labelIds},
          }),
        ]).then(values => {
          const labels = values[0];
          const requests = values[1];

          const userIds = [].concat(
            requests.map(request => request.memberId),
            requests.map(request => request.userId)
          );
          User.findAll({
            where: {id: userIds},
          }).then(users => {
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
            resolve(labels_);
          });
        }).catch(err => console.log(err));
      });
    });
  };

  Label.findByIdAndUser = function (labelId, userId) {
    const LabelStatus = sequelize.models.LabelStatus;
    const Request = sequelize.models.Request;
    const User = sequelize.models.User;

    return new Promise(resolve => {
      Promise.all([
        Label.findById(labelId),
        LabelStatus.findOne({
          where: {userId, labelId},
        }),
        Request.findAll({
          where: {labelId},
        }),
      ]).then(values => {
        const label = values[0];
        const labelStatus = values[1];
        const requests = values[2];

        const userIds = [].concat(
          requests.map(request => request.memberId),
          requests.map(request => request.userId)
        );
        User.findAll({
          where: {id: userIds},
        }).then(users => {
          resolve({
            id: label.id,
            name: label.name,
            priority: labelStatus.priority,
            visibled: labelStatus.visibled,
            createdAt: label.createdAt,
            updatedAt: label.updatedAt,
            requests: _getRequests(label, requests, users),
          });
        });
      });
    });
  };

  Label.createWithStatus = function (values) {
    // Property: userId, name
    const LabelStatus = sequelize.models.LabelStatus;
    const Request = sequelize.models.Request;

    return new Promise(resolve => {
      Promise.all([
        Label.create({
          userId: values.userId,
          name: values.name,
        }),
        LabelStatus.count({
          where: {
            userId: values.userId,
          },
        }),
      ]).then(values_ => {
        const label = values_[0];
        const count = values_[1];

        LabelStatus.create({
          userId: values.userId,
          labelId: label.id,
          priority: count,
          visibled: true,
        }).then(() => {
          Label.findByIdAndUser(label.id, values.userId).then(label_ => {
            resolve(label_);
          });
        });
        Request.create({
          userId: values.userId,
          memberId: values.userId,
          labelId: label.id,
          status: 'accepted',
        });
      });
    });
  };

  Label.updateWithStatus = function (labelId, userId, values) {
    const LabelStatus = sequelize.models.LabelStatus;

    return new Promise(resolve => {
      Promise.all([
        Label.findById(labelId),
        LabelStatus.findOne({where: {userId, labelId}}),
      ]).then(values_ => {
        const label = values_[0];
        const labelStatus = values_[1];

        Promise.all([
          label.update({
            name: (values.name === undefined) ? label.name : values.name,
          }),
          labelStatus.update({
            visibled: (values.visibled === undefined) ? labelStatus.visibled : values.visibled,
          }),
        ]).then(() => {
          Label.findByIdAndUser(labelId, userId).then(label => {
            resolve(label);
          });
        });
      });
    });
  };

  Label.destroyByUser = function (labelId, userId) {
    const LabelStatus = sequelize.models.LabelStatus;
    const Task = sequelize.models.Task;
    const Request = sequelize.models.Request;

    return new Promise(resolve => {
      Label.findByIdAndUser(labelId, userId).then(cachedLabel => {
        LabelStatus.findAll({
          where: {
            userId,
            priority: {
              $gt: cachedLabel.priority,
            },
          },
        }).then(labelStatuses => {
          labelStatuses.forEach(labelStatus => {
            labelStatus.update({priority: labelStatus.priority - 1});
          });
        }).catch(err => console.log(err));
        LabelStatus.destroy({
          where: {labelId, userId},
        }).then(() => {
          LabelStatus.count({
            where: {labelId},
          }).then(count => {
            if (count === 0) {
              // If destroy label, remove request and task
              Label.destroy({
                where: {id: labelId},
              }).then(() => {
                Promise.all([
                  Request.destroy({
                    where: {labelId},
                  }),
                  Task.destroy({
                    where: {labelId},
                  }),
                ]).then(() => {
                  resolve(cachedLabel);
                }).catch(err => console.log(err));
              }).catch(err => console.log(err));
            } else {
              // If don't destroy label, remove request
              Request.destroy({
                where: {labelId, memberId: userId},
              }).then(() => {
                resolve(cachedLabel);
              }).catch(err => console.log(err));
            }
          }).catch(err => console.log(err));
        }).catch(err => console.log(err));
      }).catch(err => console.log(err));
    }).catch(err => console.log(err));
  };

  Label.sort = function (labelId, userId, priority) {
    const LabelStatus = sequelize.models.LabelStatus;

    return new Promise(resolve => {
      LabelStatus.findOne({
        where: {userId, labelId},
      }).then(labelStatus => {
        if (labelStatus.priority < priority) {
          LabelStatus.findAll({
            where: {
              userId,
              priority: {
                $gt: labelStatus.priority,
                $lte: priority,
              },
            },
          }).then(labelStatuses => {
            labelStatuses.forEach(labelStatus_ => {
              labelStatus_.update({priority: labelStatus_.priority - 1});
            });
            labelStatus.update({priority}).then(() => {
              Label.findAllFromStatus({
                where: {userId},
                order: [['priority', 'ASC']],
              }).then(labels => {
                resolve(labels);
              });
            });
          });
        } else if (labelStatus.priority > priority) {
          LabelStatus.findAll({
            where: {
              userId,
              priority: {
                $gte: priority,
                $lt: labelStatus.priority,
              },
            },
          }).then(labelStatuses => {
            labelStatuses.forEach(labelStatus_ => {
              labelStatus_.update({priority: labelStatus_.priority + 1});
            });
            labelStatus.update({priority}).then(() => {
              Label.findAllFromStatus({
                where: {userId},
                order: [['priority', 'ASC']],
              }).then(labels => {
                resolve(labels);
              });
            });
          });
        }
      });
    });
  };

  return Label;
};
