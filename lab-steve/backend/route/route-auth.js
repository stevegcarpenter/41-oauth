'use strict';

const superagent = require('superagent');

const Auth = require('../model/auth');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');
const basicAuth = require('../lib/basic-auth-middleware');

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

module.exports = function(router) {
  router.post('/signup', bodyParser, (req, res) => {
    let pw = req.body.password;
    delete req.body.password;

    let user = new Auth(req.body);

    user.generatePasswordHash(pw)
      .then(newUser => newUser.save())
      .then(userRes => userRes.generateToken())
      .then(token => res.status(201).json(token))
      .catch(err => errorHandler(err, res));
  });

  router.get('/signin', basicAuth, (req, res) => {
    Auth.findOne({username: req.auth.username})
      .then(user => {
        return user
          ? user.comparePasswordHash(req.auth.password)
          : Promise.reject(new Error('Authorization Failed. User not found.'));
      })
      .then(user => {
        delete req.headers.authorization;
        delete req.auth.password;
        return user;
      })
      .then(user => user.generateToken())
      .then(token => res.status(200).json(token))
      .catch(err => errorHandler(err, res));
  });

  router.get('/oauth/google', (req, res) => {
    // sgc - expecting code from google (step 3)

    // redirect to the client when there is no code
    if (!req.query.code) {
      res.redirect(process.env.CLIENT_URL);
      return;
    }

    // code is truthy
    console.log('__CODE__', req.query.code);
    // sgc - step 3.1
    console.log('step 3.1');

    // add client id & secret to code from google
    return superagent.post(GOOGLE_OAUTH_URL)
      .type('form')
      .send({
        code: req.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_OAUTH_ID,
        client_secret: process.env.GOOGLE_OAUTH_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google`,
      })
      .then(tokenRes => {
        // sgc - step 3.2
        console.log('step 3.2 - GOOGLE TOKEN');

        // extract google token from request
        const token = tokenRes.body.access_token;
        if (!token) res.redirect(process.env.CLIENT_URL);

        console.log('gtoken:', token);
        // send google token to openId/google+ to get user/profile
        return superagent.get(OPEN_ID_URL)
          .set('Authorization', `Bearer ${token}`);
      })
      .then(openIdRes => {
        console.log('openId Response');
        console.log(openIdRes.body);
        // create token / account / find account
        // create cookie, send cookie / token
        const username = openIdRes.body.name.trim().toLowerCase().replace(/\s+/g, '_');
        Auth.findOne({username})
          .then(dbUser => {
            // if the user doesn't exist make one
            if (!dbUser) {
              console.log('Creating new user!');
              new Auth({
                username,
                email: openIdRes.body.email,
              }).save()
                .then(user => user.generateToken())
                .then(token => res.cookie('X-401d21-OAuth-Token', token))
                .then(() => res.redirect(process.env.CLIENT_URL))
                .catch(err => errorHandler(err, res));
            } else {
              console.log('Found a user!', dbUser);
              const token = dbUser.generateToken();
              res.cookie('X-401d21-OAuth-Token', token);
              res.redirect(process.env.CLIENT_URL);
            }
          })
          .catch(err => console.log('error:', err));
      })
      .catch(err => {
        console.log('__ERROR__', err.message);
        res.cookie('X-401d21-OAuth-Token','');
        res.redirect(process.env.CLIENT_URL + '?error=oauth'); // TODO: Add error configuration
      });
  });
};
