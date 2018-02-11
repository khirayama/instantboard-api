const { Request, User, Label } = require('../models');

function _transformRequest(request) {
  return {
    id: request.id,
    member: {
      id: request.member.id,
      name: request.member.name,
      imageUrl: request.member.imageUrl,
    },
    label: {
      id: request.label.id,
      name: request.label.name,
    },
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

async function indexRequestHandler(req, res) {
  const status = req.query.status;

  const requests = await Request.findAll({
    where: {
      memberId: req.user.id,
      status,
    },
    order: [['createdAt', 'ASC']],
  });
  const values = await Promise.all([
    User.findAll({
      where: { id: requests.map(request => request.userId) },
    }),
    Label.findAll({
      where: { id: requests.map(request => request.labelId) },
    }),
  ]);
  const users = values[0];
  const labels = values[1];

  const requests_ = requests.map(request => {
    const request_ = {
      id: request.id,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
    users.forEach(user => {
      if (request.userId === user.id) {
        request_.member = {
          id: user.id,
          name: user.name,
          imageUrl: user.imageUrl,
        };
      }
    });
    labels.forEach(label => {
      if (request.labelId === label.id) {
        request_.label = {
          id: label.id,
          name: label.name,
        };
      }
    });
    return request_;
  });
  res.json(requests_.map(_transformRequest));
}

async function createRequestHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.body.labelId;
  const memberId = req.body.memberId || null;

  const rawRequest = await Request.findOrCreate({
    where: {
      userId,
      labelId,
      memberId,
      status: ['pending', 'accepted'],
    },
    defaults: {
      userId,
      labelId,
      memberId,
      status: 'pending',
    },
  });
  const request = rawRequest[0].dataValues;
  const values = await Promise.all([Label.findById(request.labelId), User.findById(request.memberId)]);
  const label = values[0];
  const member = values[1];
  request.member = member;
  request.label = label;
  res.json(_transformRequest(request));
}

async function updateRequestHandler(req, res) {
  const requestId = req.params.id;
  const status = req.body.status;

  switch (status) {
    case 'accepted': {
      const request = await Request.acceptOne({
        where: { id: requestId },
        individualHooks: true,
      });
      const values = await Promise.all([Label.findById(request.labelId), User.findById(request.memberId)]);
      const label = values[0];
      const member = values[1];
      request.member = member;
      request.label = label;
      res.json(_transformRequest(request));
      break;
    }
    default: {
      const request = await Request.update(
        { status },
        {
          where: { id: requestId },
          individualHooks: true,
        },
      );
      const values = await Promise.all([Label.findById(request.labelId), User.findById(request.memberId)]);
      const label = values[0];
      const member = values[1];
      request.member = member;
      request.label = label;
      res.json(_transformRequest(request));
      break;
    }
  }
}

async function destroyRequestHandler(req, res) {
  const requestId = req.params.id;

  const request = await Request.findById(requestId);
  await Request.destroy({
    where: {
      id: requestId,
    },
  });
  const values = await Promise.all([Label.findById(request.labelId), User.findById(request.memberId)]);
  const label = values[0];
  const member = values[1];
  request.member = member;
  request.label = label;
  res.json(_transformRequest(request));
}

module.exports = {
  indexRequestHandler,
  createRequestHandler,
  updateRequestHandler,
  destroyRequestHandler,
};
