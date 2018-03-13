'use strict';

const superagent = require('superagent');
const faker = require('faker');

const server = require('../../lib/server');
const Auth = require('../../model/auth');

// Const vars
const PORT = process.env.PORT;
const ENDPOINT_SIGNIN = `:${PORT}/api/v1/signin`;
const ENDPOINT_SIGNUP = `:${PORT}/api/v1/signup`;

describe('GET /api/v1/signup', function() {
  beforeAll(() => server.start(PORT, () => console.log(`Listening on ${PORT}`)));
  afterAll(() => server.stop());
  afterAll(() => Promise.all([Auth.remove()]));

  // Create a fake account and save the response, then get it for testing
  beforeAll(() => {
    return superagent.post(ENDPOINT_SIGNUP)
      .send(new Auth({
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
      }))
      .then(res => this.response = res)
      .then(() => {
        return superagent.get(ENDPOINT_SIGNIN)
          .auth(this.response.request._data.username, this.response.request._data.password)
          .then(res => this.test = res);
      });
  });

  describe('Valid', () => {
    it('should respond with a status of 200', () => {
      expect(this.test.status).toBe(200);
    });
  });

  describe('Invalid', () => {
    it('should get a 401 if the user could not be authenticated', () => {
      return superagent.get(ENDPOINT_SIGNIN)
        .auth('steve', 'pass')
        .catch(err => expect(err.status).toBe(401));
    });
  });
});
