const {errorMessages} = require('../constants');
const {User, Request, LabelStatus} = require('../models');

function _transformUser(user) {
  return {
    id: user.id,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function validUserHandler(req, res) {
  const name = req.query.name;

  User.findOne({
    where: {name},
  }).then(user => {
    if (user) {
      const message = errorMessages.ALREADY_EXISTED_USER;
      res.json({isValid: false, message});
    } else {
      res.json({isValid: true, message: null});
    }
  });
}

function showCurrentUserHandler(req, res) {
  const user = req.user || null;

  if (user === null) {
    res.status(401).json({
      message: errorMessages.NO_ACCESS_TOKEN,
    });
    return;
  }
  res.json(_transformUser(req.user));
}

function updateCurrentUserHandler(req, res) {
  const user = req.user || null;
  const name = req.body.name;

  User.update({name}, {
    where: {id: user.id},
    individualHooks: true,
  }).spread((count, users) => {
    const user_ = users[0].dataValues;
    res.json(_transformUser(user_));
  }).catch(err => {
    let code = 500;
    let message = errorMessages.UNKNOWN_ERROR;

    if (err.errors && err.errors[0].message === 'name must be unique') {
      code = 400;
      message = errorMessages.ALREADY_EXISTED_USER;
    }
    res.status(code).json({message});
  });
}

function destroyCurrentUserHandler(req, res) {
  const userId = req.user.id;

  // Leave: Label, Request, Task
  // Remove: LabelStatus
  LabelStatus.destroy({
    where: {userId},
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
      where: {userId: user.id},
    }),
    Request.findAll({
      where: {memberId: user.id},
    }),
  ]).then(values => {
    const sentRequests = values[0];
    const recievedRequests = values[1];
    const userIds = sentRequests.map(request => request.memberId);
    const memberIds = recievedRequests.map(request => request.userId);
    const allIds = userIds.concat(memberIds).filter(id => id !== user.id).filter((x, i, self) => self.indexOf(x) === i);

    User.findAll({
      where: {id: allIds},
    }).then(users => {
      res.json(users.map(_transformUser));
    });
  });
}

module.exports = {
  validUserHandler,
  showCurrentUserHandler,
  updateCurrentUserHandler,
  destroyCurrentUserHandler,
  indexMemberHandler,
};
