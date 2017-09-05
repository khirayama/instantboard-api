const {Label, Task} = require('../models');
const {parseTextWithSchedule} = require('../utils/parse-text-with-schedule');

function _transformTask(task) {
  const task_ = task.dataValues || task;
  const {schedule, text} = parseTextWithSchedule(task_.content, new Date(task_.createdAt));
  return {
    id: task_.id,
    labelId: task_.labelId,
    priority: task_.priority,
    content: task_.content,
    completed: task_.completed,
    text,
    schedule,
    createdAt: task_.createdAt,
    updatedAt: task_.updatedAt,
  };
}

function indexTaskHandler(req, res) {
  const userId = req.user.id;

  Label.findAllFromStatus({
    where: {userId},
  }).then(labels => {
    const labelIds = labels.map(label => label.id);
    Task.findAll({
      where: {labelId: labelIds},
      order: [['priority', 'ASC']],
    }).then(tasks => {
      res.json(tasks.map(_transformTask));
    });
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
    res.json(_transformTask(task));
  });
}

function showTaskHandler(req, res) {
  const taskId = req.params.id;

  Task.findById(taskId).then(task => {
    res.json(_transformTask(task));
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
          where: {userId, labelId},
        }),
        Task.findAll({
          where: {
            userId,
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
          res.json(_transformTask(task_));
        });
      });
    } else {
      task.update({
        content: (content === undefined) ? task.content : content,
        completed: (completed === undefined) ? task.completed : completed,
      }).then(task_ => {
        res.json(_transformTask(task_));
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
        userId,
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
      res.json(_transformTask(destroyedTask));
    });
  });
}

function sortTaskHandler(req, res) {
  const userId = req.user.id;
  const taskId = req.params.id;
  const priority = req.body.priority;

  Task.findById(taskId).then(task => {
    if (task.priority < priority) {
      Task.findAll({
        where: {
          userId,
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
          Task.findAll({
            where: {userId},
            order: [['priority', 'ASC']],
          }).then(tasks_ => {
            res.json(tasks_.map(_transformTask));
          });
        });
      });
    } else if (task.priority > priority) {
      Task.findAll({
        where: {
          userId,
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
          Task.findAll({
            where: {userId},
            order: [['priority', 'ASC']],
          }).then(tasks_ => {
            res.json(tasks_.map(_transformTask));
          });
        });
      });
    } else {
      Task.findAll({
        where: {userId},
        order: [['priority', 'ASC']],
      }).then(tasks_ => {
        res.json(tasks_.map(_transformTask));
      });
    }
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
