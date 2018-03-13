'use strict';

const bodyParser = require('body-parser').json();

const Car = require('../model/car');
const errorHandler = require('../lib/error-handler');
const bearerAuth = require('../lib/bearer-auth-middleware');
const debug = require('debug')('http:route-car');

const ERROR_MESSAGE = 'Authorization Failed';

// Export router
module.exports = router => {
  router.route('/car/:_id?')
    .post(bearerAuth, bodyParser, (req, res) => {
      // sgc - Assume user valid since validation happens in middleware
      req.body.userId = req.user._id;
      debug(`#put: req.user: ${req.user}`);

      // Make a new car, save it, and return the JSON
      return new Car(req.body).save()
        .then(car => res.status(201).json(car))
        .catch(err => errorHandler(err, res));
    })

    .get(bearerAuth, (req, res) => {
      // sgc - Get single car
      if (req.params._id) {
        return Car.findById(req.params._id)
          .then(car => res.status(200).json(car))
          .catch(err => errorHandler(err, res));
      }

      // sgc - Get all car Ids
      return Car.find()
        .then(galleries => galleries.map(car => car._id))
        .then(ids => res.status(200).json(ids))
        .catch(err => errorHandler(err, res));
    })

    .put(bearerAuth, bodyParser, (req, res) => {
      Car.findOne({
        userId: req.user._id.toString(),
        _id: req.params._id.toString(),
      })
        .then(car => {
          if (!car) {
            debug('#put: Could not find car by id');
            return Promise.reject(new Error(ERROR_MESSAGE));
          }
          return car.set(req.body).save();
        })
        .then(() => res.sendStatus(204))
        .catch(err => errorHandler(err, res));
    })

    .delete(bearerAuth, (req, res) => {
      return Car.findOne({
        _id: req.params._id,
      })
        .then(car => {
          if(car.userId.toString() === req.user._id.toString())
            return car.remove();

          debug('#delete: Could not find car by id.');
          return errorHandler(new Error(ERROR_MESSAGE), res);
        })
        .then(() => res.sendStatus(204))
        .catch(err => errorHandler(err, res));
    });
};
