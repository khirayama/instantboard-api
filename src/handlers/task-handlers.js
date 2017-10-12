const {Label, Task} = require('../models');
const {parseTextWithSchedule} = require('../utils/parse-text-with-schedule');

function _transformTask(task, label) {
  const task_ = task.dataValues || task;
  const {schedule, text} = parseTextWithSchedule(task_.content, new Date(task_.createdAt));
  return {
    id: task_.id,
    label: {
      id: label.id,
      name: label.name,
      priority: label.priority,
      visibled: label.visibled,
    },
    priority: task_.priority,
    content: task_.content,
    completed: task_.completed,
    text,
    schedule,
    createdAt: task_.createdAt,
    updatedAt: task_.updatedAt,
  };
}

function _indexTask(userId) {
  return new Promise(resolve => {
    Label.findAllFromStatus({
      where: {userId},
    }).then(labels => {
      const labelIds = labels.map(label => label.id);
      Task.findAll({
        where: {labelId: labelIds},
        order: [['priority', 'ASC']],
      }).then(tasks => {
        const formattedTasks = tasks.map(task => {
          for (let i = 0; i < labels.length; i++) {
            const label = labels[i];
            if (label.id === task.labelId) {
              return _transformTask(task, label);
            }
          }
          return null;
        });
        resolve(formattedTasks);
      });
    });
  });
}

function indexTaskHandler(req, res) {
  const userId = req.user.id;

  _indexTask(userId).then(tasks => {
    res.json(tasks);
  });
}

function createTaskHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.body.labelId;
  const content = req.body.content;

  Task.createWithPriority({
    userId,
    labelId,
    content,
  }).then(task => {
    Label.findByIdAndUser(labelId, userId).then(label => {
      res.json(_transformTask(task, label));
    });
  });
}

function showTaskHandler(req, res) {
  const userId = req.user.id;
  const taskId = req.params.id;

  Task.findById(taskId).then(task => {
    Label.findByIdAndUser(task.labelId, userId).then(label => {
      res.json(_transformTask(task, label));
    });
  });
}

function updateTaskHandler(req, res) {
  const userId = req.user.id;
  const taskId = req.params.id;
  const labelId = req.body.labelId;
  const content = req.body.content;
  const completed = req.body.completed;

  Task.findById(taskId).then(task => {
    if (labelId && labelId !== String(task.labelId)) {
      Promise.all([
        Task.count({
          where: {labelId},
        }),
        Task.findAll({
          where: {
            labelId: task.labelId,
            priority: {
              $gt: task.priority,
            },
          },
        }),
      ]).then(values => {
        const count = values[0];
        const tasks = values[1];

        tasks.forEach(task_ => {
          task_.update({priority: task_.priority - 1});
        });

        task.update({
          labelId: (labelId === undefined) ? task.labelId : labelId,
          content: (content === undefined) ? task.content : content,
          completed: (completed === undefined) ? task.completed : completed,
          priority: count,
        }).then(task_ => {
          Label.findByIdAndUser(task_.labelId, userId).then(label => {
            res.json(_transformTask(task_, label));
          });
        });
      });
    } else {
      task.update({
        content: (content === undefined) ? task.content : content,
        completed: (completed === undefined) ? task.completed : completed,
      }).then(task_ => {
        Label.findByIdAndUser(task_.labelId, userId).then(label => {
          res.json(_transformTask(task_, label));
        });
      });
    }
  });
}

function destroyTaskHandler(req, res) {
  const userId = req.user.id;
  const taskId = req.params.id;

  Task.findById(taskId).then(task => {
    Task.findAll({
      where: {
        labelId: task.labelId,
        priority: {
          $gt: task.priority,
        },
      },
    }).then(tasks => {
      tasks.forEach(task_ => {
        task_.update({priority: task_.priority - 1});
      });
    });

    task.destroy().then(destroyedTask => {
      Label.findByIdAndUser(destroyedTask.labelId, userId).then(label => {
        res.json(_transformTask(task, label));
      });
    });
  });
}

function sortTaskHandler(req, res) {
  const userId = req.user.id;
  const taskId = req.params.id;
  const priority = req.body.priority;

  Label.findAllFromStatus({
    where: {userId},
  }).then(labels => {
    Task.findById(taskId).then(task => {
      if (task.priority < priority) {
        Task.findAll({
          where: {
            labelId: task.labelId,
            priority: {
              $gt: task.priority,
              $lte: priority,
            },
          },
        }).then(tasks => {
          tasks.forEach(task_ => {
            task_.update({priority: task_.priority - 1});
          });
          task.update({priority}).then(() => {
            _indexTask(userId).then(tasks => {
              res.json(tasks);
            });
          });
        });
      } else if (task.priority > priority) {
        Task.findAll({
          where: {
            labelId: task.labelId,
            priority: {
              $gte: priority,
              $lt: task.priority,
            },
          },
        }).then(tasks => {
          tasks.forEach(task_ => {
            task_.update({priority: task_.priority + 1});
          });
          task.update({priority}).then(() => {
            _indexTask(userId).then(tasks => {
              res.json(tasks);
            });
          });
        });
      } else {
        _indexTask(userId).then(tasks => {
          res.json(tasks);
        });
      }
    });
  });
}

module.exports = {
  indexTaskHandler,
  createTaskHandler,
  showTaskHandler,
  updateTaskHandler,
  destroyTaskHandler,
  sortTaskHandler,
};
