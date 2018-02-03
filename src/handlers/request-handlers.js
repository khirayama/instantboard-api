const { Request, User, Label } = require('../models');

function _transformRequest(request) {
  return {
    id: request.id,
    member: {
      id: request.member.id,
      name: request.member.name,
      email: request.member.email,
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

function indexRequestHandler(req, res) {
  const status = req.query.status;

  Request.findAll({
    where: {
      memberId: req.user.id,
      status,
    },
    order: [['createdAt', 'ASC']],
  }).then(requests => {
    Promise.all([
      User.findAll({
        where: { id: requests.map(request => request.userId) },
      }),
      Label.findAll({
        where: { id: requests.map(request => request.labelId) },
      }),
    ]).then(values => {
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
              email: user.email,
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
    });
  });
}

function createRequestHandler(req, res) {
  const userId = req.user.id;
  const labelId = req.body.labelId;
  const memberId = req.body.memberId || null;

  Request.findOrCreate({
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
  }).spread((rawRequest) => {
    const request = rawRequest.dataValues;
    Promise.all([Label.findById(request.labelId), User.findById(request.memberId)]).then(res_ => {
      const label = res_[0];
      const member = res_[1];
      request.member = member;
      request.label = label;
      res.json(_transformRequest(request));
    });
  });
}

function updateRequestHandler(req, res) {
  const requestId = req.params.id;
  const status = req.body.status;

  switch (status) {
    case 'accepted': {
      Request.acceptOne({
        where: { id: requestId },
        individualHooks: true,
      }).then(request => {
        Promise.all([Label.findById(request.labelId), User.findById(request.memberId)]).then(res_ => {
          const label = res_[0];
          const member = res_[1];
          request.member = member;
          request.label = label;
          res.json(_transformRequest(request));
        });
      });
      break;
    }
    default: {
      Request.update(
        { status },
        {
          where: { id: requestId },
          individualHooks: true,
        },
      ).then(request => {
        Promise.all([Label.findById(request.labelId), User.findById(request.memberId)]).then(res_ => {
          const label = res_[0];
          const member = res_[1];
          request.member = member;
          request.label = label;
          res.json(_transformRequest(request));
        });
      });
      break;
    }
  }
}

function destroyRequestHandler(req, res) {
  const requestId = req.params.id;

  Request.destroy({
    where: { id: requestId },
  }).then(request => {
    Promise.all([Label.findById(request.labelId), User.findById(request.memberId)]).then(res_ => {
      const label = res_[0];
      const member = res_[1];
      request.member = member;
      request.label = label;
      res.json(_transformRequest(request));
    });
  });
}

module.exports = {
  indexRequestHandler,
  createRequestHandler,
  updateRequestHandler,
  destroyRequestHandler,
};
