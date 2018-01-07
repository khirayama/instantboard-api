const { Label } = require('../models');

function _transformLabel(label) {
  return {
    id: label.id,
    name: label.name,
    priority: label.priority,
    visibled: label.visibled,
    requests: label.requests,
    createdAt: label.createdAt,
    updatedAt: label.updatedAt,
  };
}

function indexLabelHandler(req, res) {
  const userId = req.user.id;

  Label.findAllFromStatus({
    where: { userId },
    order: [['priority', 'ASC']],
  }).then(labels => {
    res.json(labels.map(_transformLabel));
  });
}

function createLabelHandler(req, res) {
  const userId = req.user.id;
  const name = req.body.name;

  Label.createWithStatus({ userId, name })
    .then(label => {
      res.json(_transformLabel(label));
    })
    .catch(err => {
      res.status(400).send(err.message);
    });
}

function showLabelHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.params.id;

  Label.findByIdAndUser(labelId, userId).then(label => {
    res.json(_transformLabel(label));
  });
}

function updateLabelHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.params.id;
  const name = req.body.name;
  const visibled = req.body.visibled;

  Label.updateWithStatus(labelId, userId, { name, visibled }).then(label => {
    res.json(_transformLabel(label));
  });
}

function destroyLabelHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.params.id;

  Label.destroyByUser(labelId, userId).then(label => {
    res.json(_transformLabel(label));
  });
}

function sortLabelHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.params.id;
  const priority = req.body.priority;

  Label.sort(labelId, userId, priority).then(labels => {
    res.json(labels.map(_transformLabel));
  });
}

module.exports = {
  indexLabelHandler,
  createLabelHandler,
  showLabelHandler,
  updateLabelHandler,
  destroyLabelHandler,
  sortLabelHandler,
};
