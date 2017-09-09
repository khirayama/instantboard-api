const {Request, User, Label} = require('../models');

function _transformRequest(request) {
  return {
    id: request.id,
    memberName: request.memberName,
    labelName: request.labelName,
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
        where: {id: requests.map(request => request.userId)},
      }),
      Label.findAll({
        where: {id: requests.map(request => request.labelId)},
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
            request_.memberName = user.username;
          }
        });
        labels.forEach(label => {
          if (request.labelId === label.id) {
            request_.labelName = label.name;
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
  const memberName = req.body.memberName || null;

  if (memberId) {
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
      },
    }).then(request => {
      res.json(_transformRequest(request[0]));
    });
  } else if (memberName) {
    User.findOne({
      where: {
        username: memberName,
      },
    }).then(user => {
      Request.findOrCreate({
        where: {
          userId,
          labelId,
          memberId: user.id,
          status: ['pending', 'accepted'],
        },
        defaults: {
          userId,
          labelId,
          memberId: user.id,
          status: 'pending',
        },
      }).then(request => {
        res.json(_transformRequest(request[0]));
      });
    }).catch(err => {
      res.status(400).send({
        error: 'No existed user.',
      });
    });
  }
}

function updateRequestHandler(req, res) {
  const requestId = req.params.id;
  const status = req.body.status;

  switch (status) {
    case 'accepted': {
      Request.acceptOne({
        where: {id: requestId},
        individualHooks: true,
      }).then(request => {
        res.json(_transformRequest(request));
      });
      break;
    }
    default: {
      Request.update({status}, {
        where: {id: requestId},
        individualHooks: true,
      }).then(request => {
        res.json(_transformRequest(request));
      });
      break;
    }
  }
}

function destroyRequestHandler(req, res) {
  const requestId = req.params.id;

  Request.destroy({
    where: {id: requestId},
  }).then(request => {
    res.json(_transformRequest(request));
  });
}

module.exports = {
  indexRequestHandler,
  createRequestHandler,
  updateRequestHandler,
  destroyRequestHandler,
};
