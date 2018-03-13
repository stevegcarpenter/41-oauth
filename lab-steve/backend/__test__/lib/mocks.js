'use strict';

const faker = require('faker');

const Auth = require('../../model/auth');
const Car = require('../../model/car');

// sgc - Set mocks as an object that will be exported
const mocks = module.exports = {};

mocks.auth = {};
mocks.auth.createOne = () => {
  let result = {};
  result.password = faker.internet.password();

  return new Auth({
    username: faker.internet.userName(),
    email: faker.internet.email(),
  })
    .generatePasswordHash(result.password)
    .then(user => result.user = user)
    .then(user => user.generateToken())
    .then(token => result.token = token)
    .then(() => result);
};

mocks.car = {};
mocks.car.createOne = () => {
  let resultMock = null;

  return mocks.auth.createOne()
    .then(createdUserMock => resultMock = createdUserMock)
    .then(createdUserMock => {
      return new Car({
        make: faker.random.words(1),
        model: faker.random.words(1),
        userId: createdUserMock.user._id,
      }).save(); // sgc - Save the mock to the DB
    })
    .then(car => resultMock.car = car)
    .then(() => resultMock);
};

mocks.auth.removeAll = () => Promise.all([Auth.remove()]);
mocks.car.removeAll = () => Promise.all([Car.remove()]);