const Sequelize = require('sequelize');
const { Label, Task } = require('../models');
const { parseTextWithSchedule } = require('../utils/parse-text-with-schedule');

function _transformTask(task, label) {
  const task_ = task.dataValues || task;
  const { schedule, text } = parseTextWithSchedule(task_.content, new Date(task_.createdAt));
  return {
    id: task_.id,
    label: {
      id: label.id,
      name: label.name,
      priority: label.priority,
      visibled: label.visibled,
    },
    text,
    content: task_.content,
    completed: task_.completed,
    priority: task_.priority,
    schedule,
    createdAt: task_.createdAt,
    updatedAt: task_.updatedAt,
  };
}

async function _indexTask(userId) {
  const labels = await Label.findAllFromStatus({
    where: { userId },
  });
  const labelIds = labels.map(label => label.id);
  const tasks = await Task.findAll({
    where: { labelId: labelIds },
    order: [['priority', 'ASC']],
  });
  const formattedTasks = tasks.map(task => {
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      if (label.id === task.labelId) {
        return _transformTask(task, label);
      }
    }
    return null;
  });
  return formattedTasks;
}

async function indexTaskHandler(req, res) {
  const userId = req.user.id;

  const tasks = await _indexTask(userId);
  res.json(tasks);
}

async function createTaskHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.body.labelId;
  const content = req.body.content;

  const task = await Task.createWithPriority({
    userId,
    labelId,
    content,
  });
  const label = await Label.findByIdAndUser(labelId, userId);
  res.json(_transformTask(task, label));
}

async function showTaskHandler(req, res) {
  const userId = req.user.id;
  const taskId = req.params.id;

  const task = await Task.findById(taskId);
  const label = await Label.findByIdAndUser(task.labelId, userId);
  res.json(_transformTask(task, label));
}

async function updateTaskHandler(req, res) {
  const userId = req.user.id;
  const taskId = req.params.id;
  const labelId = req.body.labelId;
  const content = req.body.content;
  const completed = req.body.completed;

  const task = await Task.findById(taskId);
  if (labelId && String(labelId) !== String(task.labelId)) {
    const values = await Promise.all([
      Task.count({
        where: { labelId },
      }),
      Task.findAll({
        where: {
          labelId: task.labelId,
          priority: {
            [Sequelize.Op.gt]: task.priority,
          },
        },
      }),
    ]);
    const count = values[0];
    const tasks = values[1];

    tasks.forEach(task_ => {
      task_.update({ priority: task_.priority - 1 });
    });
    const task_ = await task.update({
      labelId: labelId === undefined ? task.labelId : labelId,
      content: content === undefined ? task.content : content,
      completed: completed === undefined ? task.completed : completed,
      priority: count,
    });
    const label = await Label.findByIdAndUser(task_.labelId, userId);
    res.json(_transformTask(task_, label));
  } else {
    const task_ = await task.update({
      content: content === undefined ? task.content : content,
      completed: completed === undefined ? task.completed : completed,
    });
    const label = await Label.findByIdAndUser(task_.labelId, userId);
    res.json(_transformTask(task_, label));
  }
}

async function destroyTaskHandler(req, res) {
  const userId = req.user.id;
  const taskId = req.params.id;

  const task = await Task.findById(taskId);
  const tasks = await Task.findAll({
    where: {
      labelId: task.labelId,
      priority: {
        [Sequelize.Op.gt]: task.priority,
      },
    },
  });
  tasks.forEach(task_ => {
    task_.update({ priority: task_.priority - 1 });
  });

  const destroyedTask = await task.destroy();
  const label = await Label.findByIdAndUser(destroyedTask.labelId, userId);
  res.json(_transformTask(task, label));
}

async function sortTaskHandler(req, res) {
  const userId = req.user.id;
  const taskId = req.params.id;
  const priority = req.body.priority;

  const task = await Task.findById(taskId);
  if (task.priority < priority) {
    const tasks = await Task.findAll({
      where: {
        labelId: task.labelId,
        priority: {
          [Sequelize.Op.gt]: task.priority,
          [Sequelize.Op.lte]: priority,
        },
      },
    });
    tasks.forEach(task_ => {
      task_.update({ priority: task_.priority - 1 });
    });
    await task.update({ priority });
    const tasks_ = await _indexTask(userId);
    res.json(tasks_);
  } else if (task.priority > priority) {
    const tasks = await Task.findAll({
      where: {
        labelId: task.labelId,
        priority: {
          [Sequelize.Op.gte]: priority,
          [Sequelize.Op.lt]: task.priority,
        },
      },
    });
    tasks.forEach(task_ => {
      task_.update({ priority: task_.priority + 1 });
    });
    await task.update({ priority });
    const tasks_ = await _indexTask(userId);
    res.json(tasks_);
  } else {
    const tasks = await _indexTask(userId);
    res.json(tasks);
  }
}

module.exports = {
  indexTaskHandler,
  createTaskHandler,
  showTaskHandler,
  updateTaskHandler,
  destroyTaskHandler,
  sortTaskHandler,
};
