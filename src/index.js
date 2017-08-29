const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('./models');

const {
  extractAccessTokenFromHeader,
  checkAccessToken,
} = require('./utils');

const {
  createTokenHandler,
} = require('./handlers/token-handlers');

const {
  validUserHandler,
  showCurrentUserHandler,
  updateCurrentUserHandler,
  destroyCurrentUserHandler,
  indexMemberHandler,
} = require('./handlers/user-handlers');

const {
  indexTaskHandler,
  createTaskHandler,
  showTaskHandler,
  updateTaskHandler,
  destroyTaskHandler,
  sortTaskHandler,
} = require('./handlers/task-handlers');

const {
  indexLabelHandler,
  createLabelHandler,
  showLabelHandler,
  updateLabelHandler,
  destroyLabelHandler,
  sortLabelHandler,
} = require('./handlers/label-handlers');

const {
  indexRequestHandler,
  createRequestHandler,
  updateRequestHandler,
  destroyRequestHandler,
} = require('./handlers/request-handlers');

const app = express();

const port = process.env.PORT || 3000;
const host = process.env.HOST || '127.0.0.1';

function requireAuthorization(req, res, next) {
  const accessToken = extractAccessTokenFromHeader(req.headers.authorization);
  const payload = checkAccessToken(accessToken);

  if (payload === null) {
    res.status(401).send({
      error: 'Need to set access token to header.Authorization as Bearer.',
    });
    return;
  }

  User.findById(payload.sub).then(user => {
    req.user = user;
    req.isAuthenticated = true;
    next();
  }).catch(() => {
    res.status(401).send({
      error: 'Invalid access token.',
    });
  });
}

const router = new express.Router('');

router.use('/api', new express.Router()
  .use('/v1', new express.Router()
    .use('/tokens', new express.Router()
      .post('/', createTokenHandler)
    )
    .use('/users', new express.Router()
      .get('/valid', [requireAuthorization], validUserHandler)
      .get('/current', [requireAuthorization], showCurrentUserHandler)
      .put('/current', [requireAuthorization], updateCurrentUserHandler)
      .delete('/current', [requireAuthorization], destroyCurrentUserHandler)
    )
    .use('/members', new express.Router()
      .get('/', [requireAuthorization], indexMemberHandler)
    )
    .use('/tasks', new express.Router()
      .get('/', [requireAuthorization], indexTaskHandler)
      .post('/', [requireAuthorization], createTaskHandler)
      .get('/:id', [requireAuthorization], showTaskHandler)
      .put('/:id', [requireAuthorization], updateTaskHandler)
      .delete('/:id', [requireAuthorization], destroyTaskHandler)
      .put('/:id/sort', [requireAuthorization], sortTaskHandler)
    )
    .use('/labels', new express.Router()
      .get('/', [requireAuthorization], indexLabelHandler)
      .post('/', [requireAuthorization], createLabelHandler)
      .get('/:id', [requireAuthorization], showLabelHandler)
      .put('/:id', [requireAuthorization], updateLabelHandler)
      .delete('/:id', [requireAuthorization], destroyLabelHandler)
      .put('/:id/sort', [requireAuthorization], sortLabelHandler)
    )
    .use('/requests', new express.Router()
      .get('/', [requireAuthorization], indexRequestHandler)
      .post('/', [requireAuthorization], createRequestHandler)
      .put('/:id', [requireAuthorization], updateRequestHandler)
      .delete('/:id', [requireAuthorization], destroyRequestHandler)
    )
  )
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
app.use(router);

// Main
console.log('Example app listening on port 3000!');
app.listen(port, host);
