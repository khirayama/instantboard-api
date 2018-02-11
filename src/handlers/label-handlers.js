const { Label } = require('../models');

function _transformLabel(label) {
  return {
    id: label.id,
    name: label.name,
    priority: label.priority,
    visibled: label.visibled,
    members: label.requests.map(request => {
      return {
        id: request.member.id,
        name: request.member.name,
        imageUrl: request.member.imageUrl,
        requestId: request.id,
        status: request.status,
      };
    }),
    createdAt: label.createdAt,
    updatedAt: label.updatedAt,
  };
}

async function indexLabelHandler(req, res) {
  const userId = req.user.id;

  const labels = await Label.findAllFromStatus({
    where: { userId },
    order: [['priority', 'ASC']],
  });
  res.json(labels.map(_transformLabel));
}

async function createLabelHandler(req, res) {
  const userId = req.user.id;
  const name = req.body.name;

  const label = await Label.createWithStatus({ userId, name });
  res.json(_transformLabel(label));
}

async function showLabelHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.params.id;

  const label = await Label.findByIdAndUser(labelId, userId);
  res.json(_transformLabel(label));
}

async function updateLabelHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.params.id;
  const name = req.body.name;
  const visibled = req.body.visibled;

  const label = await Label.updateWithStatus(labelId, userId, { name, visibled });
  res.json(_transformLabel(label));
}

async function destroyLabelHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.params.id;

  const label = Label.destroyByUser(labelId, userId);
  res.json(_transformLabel(label));
}

async function sortLabelHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.params.id;
  const priority = req.body.priority;

  const labels = Label.sort(labelId, userId, priority);
  res.json(labels.map(_transformLabel));
}

module.exports = {
  indexLabelHandler,
  createLabelHandler,
  showLabelHandler,
  updateLabelHandler,
  destroyLabelHandler,
  sortLabelHandler,
};
