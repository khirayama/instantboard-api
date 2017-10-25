const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

const jwt = require('jwt-simple');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const {User} = require('./models');

const {checkAccessToken} = require('./utils');

const {
  searchUsersHandler,
  showUserHandler,
  updateUserHandler,
  destroyUserHandler,
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

const SECRET_KEY = process.env.SECRET_KEY;

const API_SERVER_PORT = process.env.PORT || 3001;
const API_SERVER_HOST = process.env.API_SERVER_HOST || 'http://127.0.0.1:3001';
const APP_SERVER_HOST = process.env.APP_SERVER_HOST || 'http://127.0.0.1:3000';

passport.use(
  new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: `${API_SERVER_HOST}/auth/facebook/callback`,
  }, (accessToken, refreshToken, profile, done) => {
    const provider = 'facebook';
    const uid = profile.id;
    const name = `${provider}-${profile.id}`;

    User.findOrCreate({
      where: {provider, uid},
      defaults: {provider, uid, name},
    }).spread(user => {
      const now = new Date();
      const expires = now.setYear(now.getFullYear() + 3);

      // Ref: [JA] https://hiyosi.tumblr.com/post/70073770678/jwt%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6%E7%B0%A1%E5%8D%98%E3%81%AB%E3%81%BE%E3%81%A8%E3%82%81%E3%81%A6%E3%81%BF%E3%81%9F
      const token = jwt.encode({
        sub: user.id,
        exp: expires,
        iat: now.getTime(),
      }, SECRET_KEY);

      done(null, {token});
    });
  })
);

app.get('/auth/tester', (req, res) => {
  const name = 'tester';
  User.findOrCreate({
    where: {name},
    defaults: {name, provider: name, uid: name},
  }).spread(user => {
    const now = new Date();
    const expires = now.setYear(now.getFullYear() + 3);
    const token = jwt.encode({
      sub: user.id,
      exp: expires,
      iat: now.getTime(),
    }, SECRET_KEY);
    res.redirect(`${APP_SERVER_HOST}/login?token=${token}`);
  });
});

app.get('/auth/:provider', (req, res, next) => {
  const provider = req.params.provider;

  passport.authenticate(provider, {
    session: false,
    scope: [],
  })(req, res, next);
});

app.get('/auth/:provider/callback', (req, res, next) => {
  const provider = req.params.provider;

  passport.authenticate(provider, {
    session: false,
  }, (err, user) => {
    if (err !== null) {
      res.redirect(`${APP_SERVER_HOST}/login`);
    }

    const token = user.token;
    res.redirect(`${APP_SERVER_HOST}/login?token=${token}`);
  })(req, res, next);
});

function requireAuthorization(req, res, next) {
  const accessToken = req.query.token;
  const payload = checkAccessToken(accessToken);

  if (payload === null) {
    res.status(401).send({
      error: 'Need to set access token to header.Authorization as Bearer.',
    });
    return;
  }

  User.findById(payload.sub).then(user => {
    if (user === null) {
      res.status(401).send({
        error: 'Invalid access token.',
      });
      return;
    }

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
    .use('/user', new express.Router()
      .get('/', [requireAuthorization], showUserHandler)
      .put('/', [requireAuthorization], updateUserHandler)
      .delete('/', [requireAuthorization], destroyUserHandler)
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
    .use('/members', new express.Router()
      .get('/', [requireAuthorization], indexMemberHandler)
    )
    .use('/search', new express.Router()
      .get('/users', [requireAuthorization], searchUsersHandler)
    )
  )
);

app.use(compression({
  threshold: 0,
  level: 9,
  memLevel: 9,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', APP_SERVER_HOST);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'PUT, DELETE');
  next();
});
app.use(router);

// Main
console.log(`Start api app at ${new Date()} on ${API_SERVER_HOST}`);
app.listen(API_SERVER_PORT);
