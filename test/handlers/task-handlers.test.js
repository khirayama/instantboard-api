// Modules
const test = require('ava');
const Ajv = require('ajv');
const uuid = require('uuid/v4');

// Test modules
const {createRequest, createResponse} = require('../mock');

// Src modules
const {User, Label, LabelStatus, Task} = require('../../src/models');
const {taskResponseSchema, tasksResponseSchema} = require('../schemas/task-response-schema');
const {
  indexTaskHandler,
  createTaskHandler,
  showTaskHandler,
  updateTaskHandler,
  destroyTaskHandler,
  sortTaskHandler,
} = require('../../src/handlers/task-handlers');

const ajv = new Ajv();

test.cb('indexTaskHandler > work single task without error', t => {
  const req = createRequest();
  const res = createResponse();

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(label => {
        Task.createWithPriority({
          userId: user.id,
          labelId: label.id,
          content: 'Test Task',
        }).then(() => {
          resolve(user);
        });
      });
    });
  }).then(user => {
    req.user = user;

    indexTaskHandler(req, res);
  });

  res.on(tasks => {
    t.is(tasks.length, 1);
    t.true(ajv.validate(tasksResponseSchema, tasks));
    t.end();
  });
});

test.cb('indexTaskHandler > work multi tasks without error', t => {
  const req = createRequest();
  const res = createResponse();

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(label => {
        Task.createWithPriority({
          userId: user.id,
          labelId: label.id,
          content: 'Test Task',
        }).then(() => {
          Task.createWithPriority({
            userId: user.id,
            labelId: label.id,
            content: 'Test Task',
          }).then(() => {
            resolve(user);
          });
        });
      });
    });
  }).then(user => {
    req.user = user;

    indexTaskHandler(req, res);
  });

  res.on(tasks => {
    t.is(tasks.length, 2);
    t.is(tasks[0].priority, 0);
    t.is(tasks[1].priority, 1);
    t.true(ajv.validate(tasksResponseSchema, tasks));
    t.end();
  });
});

test.cb('indexTaskHandler > work multi tasks without error', t => {
  const req = createRequest();
  const res = createResponse();

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      User.create({
        uid: uuid(),
        provider: 'facebook',
      }).then(user2 => {
        Label.createWithStatus({
          userId: user2.id,
          name: 'Test Label',
        }).then(label => {
          // Accept request
          LabelStatus.create({
            userId: user.id,
            labelId: label.id,
            priority: 0,
          }).then(() => {
            Task.createWithPriority({
              userId: user.id,
              labelId: label.id,
              content: 'Test Task',
            }).then(() => {
              Task.createWithPriority({
                userId: user.id,
                labelId: label.id,
                content: 'Test Task',
              }).then(() => {
                resolve(user);
              });
            });
          });
        });
      });
    });
  }).then(user => {
    req.user = user;

    indexTaskHandler(req, res);
  });

  res.on(tasks => {
    t.is(tasks.length, 2);
    t.is(tasks[0].priority, 0);
    t.is(tasks[1].priority, 1);
    t.true(ajv.validate(tasksResponseSchema, tasks));
    t.end();
  });
});

test.cb('showTaskHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(label => {
        Task.createWithPriority({
          userId: user.id,
          labelId: label.id,
          content: 'Test task',
        }).then(task => {
          resolve({user, task});
        });
      });
    });
  }).then(({user, task}) => {
    req.user = user;
    req.params.id = task.id;

    showTaskHandler(req, res);
  });

  res.on(task => {
    t.true(ajv.validate(taskResponseSchema, task));
    t.end();
  });
});

test.cb('createTaskHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(label => {
        resolve({user, label});
      });
    });
  }).then(({user, label}) => {
    req.user = user;
    req.body.labelId = label.id;
    req.body.content = 'Test label';

    createTaskHandler(req, res);
  });

  res.on(task => {
    t.is(task.priority, 0);
    t.true(ajv.validate(taskResponseSchema, task));
    t.end();
  });
});

test.cb('createTaskHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(label => {
        Task.createWithPriority({
          userId: user.id,
          labelId: label.id,
          content: 'Test task',
        }).then(() => {
          resolve({user, label});
        });
      });
    });
  }).then(({user, label}) => {
    req.user = user;
    req.body.labelId = label.id;
    req.body.content = 'Test label';

    createTaskHandler(req, res);
  });

  res.on(task => {
    t.is(task.priority, 1);
    t.true(ajv.validate(taskResponseSchema, task));
    t.end();
  });
});

test.cb('updateTaskHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(label => {
        Task.createWithPriority({
          userId: user.id,
          labelId: label.id,
          content: 'Test task',
        }).then(task => {
          resolve({user, task});
        });
      });
    });
  }).then(({user, task}) => {
    req.user = user;
    req.params.id = task.id;
    req.body.content = 'Updated task';
    req.body.completed = true;

    updateTaskHandler(req, res);
  });

  res.on(task => {
    t.is(task.content, 'Updated task');
    t.true(task.completed);
    t.true(ajv.validate(taskResponseSchema, task));
    t.end();
  });
});

test.cb('updateTaskHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(label => {
        Label.createWithStatus({
          userId: user.id,
          name: 'Test Label',
        }).then(label2 => {
          Task.createWithPriority({
            userId: user.id,
            labelId: label2.id,
            content: 'Test task',
          }).then(task => {
            resolve({user, task, label});
          });
        });
      });
    });
  }).then(({user, task, label}) => {
    req.user = user;
    req.params.id = task.id;
    req.body.labelId = label.id;
    req.body.content = 'Updated task';
    req.body.completed = true;

    updateTaskHandler(req, res);
  });

  res.on(task => {
    t.is(task.content, 'Updated task');
    t.true(task.completed);
    t.true(ajv.validate(taskResponseSchema, task));
    t.end();
  });
});

test.cb('updateTaskHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  let userId = null;

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      userId = user.id;

      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(label => {
        Label.createWithStatus({
          userId: user.id,
          name: 'Test Label',
        }).then(label2 => {
          Task.createWithPriority({
            userId: user.id,
            labelId: label.id,
            content: 'Test task',
          }).then(task => {
            Task.createWithPriority({
              userId: user.id,
              labelId: label.id,
              content: 'Test task',
            }).then(() => {
              Task.createWithPriority({
                userId: user.id,
                labelId: label2.id,
                content: 'Test task',
              }).then(() => {
                resolve({user, task, label2});
              });
            });
          });
        });
      });
    });
  }).then(({user, task, label2}) => {
    req.user = user;
    req.params.id = task.id;
    req.body.labelId = label2.id;
    req.body.content = 'Updated task';
    req.body.completed = true;

    updateTaskHandler(req, res);
  });

  res.on(task => {
    t.is(task.content, 'Updated task');
    t.true(task.completed);
    t.true(ajv.validate(taskResponseSchema, task));

    Label.findAllFromStatus({
      where: {userId},
    }).then(labels => {
      const labelIds = labels.map(label => label.id);
      Task.findAll({
        where: {labelId: labelIds},
      }).then(tasks => {
        const labelTasks = tasks.filter(task_ => task_.labelId !== task.label.id);
        const label2Tasks = tasks.filter(task_ => task_.labelId === task.label.id);
        t.is(labelTasks.length, 1);
        t.is(label2Tasks.length, 2);
        t.end();
      });
    });
  });
});

test.cb('destroyTaskHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(label => {
        Task.createWithPriority({
          userId: user.id,
          labelId: label.id,
          content: 'Test task',
        }).then(task => {
          resolve(({user, task}));
        });
      });
    });
  }).then(({user, task}) => {
    req.user = user;
    req.params.id = task.id;

    destroyTaskHandler(req, res);
  });

  res.on(task => {
    t.true(ajv.validate(taskResponseSchema, task));
    t.end();
  });
});

test.cb('destroyTaskHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  let userId = null;

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      userId = user.id;

      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(label => {
        Task.createWithPriority({
          userId: user.id,
          labelId: label.id,
          content: 'Test task',
        }).then(task => {
          Task.createWithPriority({
            userId: user.id,
            labelId: label.id,
            content: 'Test task',
          }).then(() => {
            resolve(({user, task}));
          });
        });
      });
    });
  }).then(({user, task}) => {
    req.user = user;
    req.params.id = task.id;

    destroyTaskHandler(req, res);
  });

  res.on(task => {
    t.true(ajv.validate(taskResponseSchema, task));
    t.end();

    Label.findAllFromStatus({
      where: {userId},
    }).then(labels => {
      const labelIds = labels.map(label => label.id);
      Task.findAll({
        where: {labelId: labelIds},
      }).then(tasks => {
        t.is(tasks.length, 1);
        t.is(tasks[0].priority, 0);
        t.end();
      });
    });
  });
});

test.cb('sortTaskHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label 0',
      }).then(label => {
        Task.createWithPriority({
          userId: user.id,
          labelId: label.id,
          content: 'Test task 0',
        }).then(task => {
          Task.createWithPriority({
            userId: user.id,
            labelId: label.id,
            content: 'Test task 1',
          }).then(() => {
            Task.createWithPriority({
              userId: user.id,
              labelId: label.id,
              content: 'Test task 2',
            }).then(() => {
              resolve(({user, task}));
            });
          });
        });
      });
    });
  }).then(({user, task}) => {
    req.user = user;
    req.params.id = task.id;
    req.body.priority = 2;

    sortTaskHandler(req, res);
  });

  res.on(tasks => {
    t.is(tasks.length, 3);
    t.is(tasks[0].priority, 0);
    t.is(tasks[0].content, 'Test task 1');
    t.is(tasks[1].priority, 1);
    t.is(tasks[1].content, 'Test task 2');
    t.is(tasks[2].priority, 2);
    t.is(tasks[2].content, 'Test task 0');
    t.true(ajv.validate(tasksResponseSchema, tasks));
    t.end();
  });
});

test.cb('sortTaskHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label 0',
      }).then(label => {
        Task.createWithPriority({
          userId: user.id,
          labelId: label.id,
          content: 'Test task 0',
        }).then(() => {
          Task.createWithPriority({
            userId: user.id,
            labelId: label.id,
            content: 'Test task 1',
          }).then(() => {
            Task.createWithPriority({
              userId: user.id,
              labelId: label.id,
              content: 'Test task 2',
            }).then(task => {
              resolve(({user, task}));
            });
          });
        });
      });
    });
  }).then(({user, task}) => {
    req.user = user;
    req.params.id = task.id;
    req.body.priority = 0;

    sortTaskHandler(req, res);
  });

  res.on(tasks => {
    t.is(tasks.length, 3);
    t.is(tasks[0].priority, 0);
    t.is(tasks[0].content, 'Test task 2');
    t.is(tasks[1].priority, 1);
    t.is(tasks[1].content, 'Test task 0');
    t.is(tasks[2].priority, 2);
    t.is(tasks[2].content, 'Test task 1');
    t.true(ajv.validate(tasksResponseSchema, tasks));
    t.end();
  });
});
