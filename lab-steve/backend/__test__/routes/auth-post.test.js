'use strict';

const superagent = require('superagent');
const faker = require('faker');

const server = require('../../lib/server');
const Auth = require('../../model/auth');

const PORT = process.env.PORT;
const ENDPOINT_SIGNUP = `:${PORT}/api/v1/signup`;

describe('POST /api/v1/signup', function() {
  this.mockAccount = {
    username: faker.internet.userName(),
    password: faker.internet.password(),
    email: faker.internet.email(),
  };
  beforeAll(() => server.start(PORT, () => console.log(`Listening on ${PORT}`)));
  afterAll(server.stop);

  describe('Valid', () => {
    beforeAll(() => {
      return superagent.post(ENDPOINT_SIGNUP)
        .send(this.mockAccount)
        .then(res => this.response = res);
    });

    it('should return a 201 status', () => {
      expect(this.response.status).toBe(201);
    });
  });

  describe('Invalid', () => {
    it('should return a 401 status if no request body was provided', () => {
      return superagent.post(ENDPOINT_SIGNUP)
        .catch(err => expect(err.status).toBe(401));
    });

    it('should respond with a 404 status if a fake path is given', () => {
      return superagent.post(`${ENDPOINT_SIGNUP}/fakepath`)
        .send({username: 'steve', password: 'pass', email: 's@s.com'})
        .catch(err => expect(err.status).toBe(404));
    });

    it('should return a 400 status if no username was provided', () => {
      return superagent.post(ENDPOINT_SIGNUP)
        .send(new Auth({
          password: faker.internet.password(),
          email: faker.internet.email(),
        }))
        .catch(err => expect(err.status).toBe(400));
    });
  });
});
