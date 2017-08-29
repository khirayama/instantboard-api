// Modules
const test = require('ava');
const Ajv = require('ajv');
const uuid = require('uuid/v4');

// Test modules
const {createRequest, createResponse} = require('../mock');

// Src modules
const {User, Label} = require('../../src/models');
const {labelResponseSchema, labelsResponseSchema} = require('../schemas/label-response-schema');
const {
  indexLabelHandler,
  showLabelHandler,
  createLabelHandler,
  updateLabelHandler,
  destroyLabelHandler,
  sortLabelHandler,
} = require('../../src/handlers/label-handlers');

const ajv = new Ajv();

test.cb('indexLabelHandler > work single label without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(labels => {
    t.is(labels.length, 1);
    t.true(ajv.validate(labelsResponseSchema, labels));
    t.end();
  });

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(() => {
        resolve(user);
      });
    });
  }).then(user => {
    req.user = user;

    indexLabelHandler(req, res);
  });
});

test.cb('indexLabelHandler > work multi labels without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(labels => {
    t.is(labels.length, 2);
    t.is(labels[0].priority, 0);
    t.is(labels[1].priority, 1);
    t.true(ajv.validate(labelsResponseSchema, labels));
    t.end();
  });

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(() => {
        Label.createWithStatus({
          userId: user.id,
          name: 'Test Label',
        }).then(() => {
          resolve(user);
        });
      });
    });
  }).then(user => {
    req.user = user;

    indexLabelHandler(req, res);
  });
});

test.cb('showLabelHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(label => {
    t.true(ajv.validate(labelResponseSchema, label));
    t.end();
  });

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
    req.params.id = label.id;

    showLabelHandler(req, res);
  });
});

test.cb('showLabelHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(label => {
    t.true(ajv.validate(labelResponseSchema, label));
    t.end();
  });

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
    req.params.id = label.id;

    showLabelHandler(req, res);
  });
});

test.cb('createLabelHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(label => {
    t.true(ajv.validate(labelResponseSchema, label));
    t.end();
  });

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      resolve(user);
    });
  }).then(user => {
    req.user = user;
    req.body.name = 'Test label';

    createLabelHandler(req, res);
  });
});

test.cb('updateLabelHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(label => {
    t.is(label.name, 'Updated label');
    t.false(label.visibled);
    t.true(ajv.validate(labelResponseSchema, label));
    t.end();
  });

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
    req.params.id = label.id;
    req.body.name = 'Updated label';
    req.body.visibled = false;

    updateLabelHandler(req, res);
  });
});

test.cb('destroyLabelHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(label => {
    t.true(ajv.validate(labelResponseSchema, label));
    t.end();
  });

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(label => {
        resolve(({user, label}));
      });
    });
  }).then(({user, label}) => {
    req.user = user;
    req.params.id = label.id;

    destroyLabelHandler(req, res);
  });
});

test.cb('destroyLabelHandler > work multi labels without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(label => {
    t.true(ajv.validate(labelResponseSchema, label));

    Label.findAllFromStatus({
      where: {userId: req.user.id},
    }).then(labels => {
      t.true(ajv.validate(labelsResponseSchema, labels));
      t.is(labels.length, 2);
      t.is(labels[0].priority, 0);
      t.is(labels[1].priority, 1);
      t.end();
    });
  });

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label',
      }).then(() => {
        Label.createWithStatus({
          userId: user.id,
          name: 'Test Label',
        }).then(label => {
          Label.createWithStatus({
            userId: user.id,
            name: 'Test Label',
          }).then(() => {
            resolve({user, label});
          });
        });
      });
    });
  }).then(({user, label}) => {
    req.user = user;
    req.params.id = label.id;

    destroyLabelHandler(req, res);
  });
});

test.cb('sortLabelHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(labels => {
    t.is(labels.length, 3);
    t.is(labels[0].priority, 0);
    t.is(labels[0].name, 'Test Label 1');
    t.is(labels[1].priority, 1);
    t.is(labels[1].name, 'Test Label 2');
    t.is(labels[2].priority, 2);
    t.is(labels[2].name, 'Test Label 0');
    t.true(ajv.validate(labelsResponseSchema, labels));
    t.end();
  });

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label 0',
      }).then(label => {
        Label.createWithStatus({
          userId: user.id,
          name: 'Test Label 1',
        }).then(() => {
          Label.createWithStatus({
            userId: user.id,
            name: 'Test Label 2',
          }).then(() => {
            resolve(({user, label}));
          });
        });
      });
    });
  }).then(({user, label}) => {
    req.user = user;
    req.params.id = label.id;
    req.body.priority = 2;

    sortLabelHandler(req, res);
  });
});

test.cb('sortLabelHandler > work without error', t => {
  const req = createRequest();
  const res = createResponse();

  res.on(labels => {
    t.is(labels.length, 3);
    t.is(labels[0].priority, 0);
    t.is(labels[0].name, 'Test Label 2');
    t.is(labels[1].priority, 1);
    t.is(labels[1].name, 'Test Label 0');
    t.is(labels[2].priority, 2);
    t.is(labels[2].name, 'Test Label 1');
    t.true(ajv.validate(labelsResponseSchema, labels));
    t.end();
  });

  new Promise(resolve => {
    User.create({
      uid: uuid(),
      provider: 'facebook',
    }).then(user => {
      Label.createWithStatus({
        userId: user.id,
        name: 'Test Label 0',
      }).then(() => {
        Label.createWithStatus({
          userId: user.id,
          name: 'Test Label 1',
        }).then(() => {
          Label.createWithStatus({
            userId: user.id,
            name: 'Test Label 2',
          }).then(label => {
            resolve(({user, label}));
          });
        });
      });
    });
  }).then(({user, label}) => {
    req.user = user;
    req.params.id = label.id;
    req.body.priority = 0;

    sortLabelHandler(req, res);
  });
});
