/* eslint no-irregular-whitespace: ["error", { "skipRegExps": true }] */
const { Op } = require('sequelize');
const { errorMessages } = require('../constants');
const { User, Request, LabelStatus } = require('../models');

function parseQueryForSequelizeWhere(q = '', fields = []) {
  const keywords = q.split(/( |　)/).filter(str => str !== ' ' && str !== '　');
  const query = {};
  for (let i = 0; i < fields.length; i++) {
    query[fields[i]] = { [Op.or]: keywords };
  }

  return { [Op.or]: query };
}

function _transformUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function _transformMember(user) {
  return {
    id: user.id,
    name: user.name,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function searchUsersHandler(req, res) {
  const query = req.query;
  const where = parseQueryForSequelizeWhere(query.q, ['name', 'email']);

  User.findAll({ where }).then(users => {
    res.json(users.map(_transformMember));
  });
}

function showUserHandler(req, res) {
  const user = req.user || null;

  if (user === null) {
    res.status(401).json({
      message: errorMessages.NO_ACCESS_TOKEN,
    });
    return;
  }
  res.json(_transformUser(req.user));
}

function destroyUserHandler(req, res) {
  const userId = req.user.id;

  // Leave: Label, Request, Task
  // Remove: LabelStatus
  LabelStatus.destroy({
    where: { userId },
  }).then(() => {
    User.destroy({
      where: {
        id: userId,
      },
    }).then(() => {
      res.json();
    });
  });
}

function indexMemberHandler(req, res) {
  const user = req.user || null;

  Promise.all([
    Request.findAll({
      where: {
        userId: user.id,
        status: 'accepted',
      },
    }),
    Request.findAll({
      where: {
        memberId: user.id,
        status: 'accepted',
      },
    }),
  ]).then(values => {
    const sentRequests = values[0];
    const recievedRequests = values[1];
    const userIds = sentRequests.map(request => request.memberId);
    const memberIds = recievedRequests.map(request => request.userId);
    const allIds = userIds
      .concat(memberIds)
      .filter(id => id !== user.id)
      .filter((x, i, self) => self.indexOf(x) === i);

    User.findAll({
      where: { id: allIds },
    }).then(users => {
      res.json(users.map(_transformMember));
    });
  });
}

module.exports = {
  searchUsersHandler,
  showUserHandler,
  destroyUserHandler,
  indexMemberHandler,
};
