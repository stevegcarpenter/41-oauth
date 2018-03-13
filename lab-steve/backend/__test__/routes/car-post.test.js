'use strict';

const faker = require('faker');
const superagent = require('superagent');

const mocks = require('../lib/mocks');
const server = require('../../lib/server');
require('jest');

const PORT = process.env.PORT;
const CAR_ENDPOINT = `:${PORT}/api/v1/song`;

describe('POST /api/v1/song', () => {
  beforeAll(server.start);
  beforeAll(() => mocks.auth.createOne()
    .then(data => this.mockUser = data)
  );
  afterAll(server.stop);
  afterAll(mocks.auth.removeAll);
  afterAll(mocks.car.removeAll);

  describe('Valid', () => {
    it('should return a 201 status (CREATED)', () => {
      let carMock = null;
      return mocks.car.createOne()
        .then(mock => carMock = mock)
        .then(mock => {
          return superagent.post(`${CAR_ENDPOINT}`)
            .set('Authorization', `Bearer ${mock.token}`)
            .send({
              make: faker.random.words(1),
              model: faker.random.words(1),
            });
        })
        .then(res => {
          expect(res.status).toEqual(201);
          expect(res.body).toHaveProperty('make');
          expect(res.body).toHaveProperty('model');
          expect(res.body).toHaveProperty('_id');
          expect(res.body.userId).toEqual(carMock.car.userId.toString());
        });
    });
  });

  describe('Invalid', () => {
    it('should return a 401 status (NOT AUTHORIZED) with a bad token', () => {
      return superagent.post(`${CAR_ENDPOINT}`)
        .set('Authorization', 'Bearer BADTOKEN')
        .catch(err => expect(err.status).toEqual(401));
    });

    it('should return a 400 status (BAD REQUEST) with an improperly formatted body', () => {
      return superagent.post(`${CAR_ENDPOINT}`)
        .set('Authorization', `Bearer ${this.mockUser.token}`)
        .send({})
        .catch(err => expect(err.status).toEqual(400));
    });
  });
});
