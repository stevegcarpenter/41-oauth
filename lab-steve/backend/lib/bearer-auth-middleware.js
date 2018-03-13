'use strict';

const jwt = require('jsonwebtoken');

const errorHandler = require('./error-handler');
const Auth = require('../model/auth');

// sgc - Error Message - Vague on purpose
const ERROR_MESSAGE = 'Authorization Failed';

// sgc - Export the bearer middleware
module.exports = function (req, res, next) {
  let authHeader = req.headers.authorization;

  if (!authHeader)
    return errorHandler(new Error(ERROR_MESSAGE), res);

  // sgc - Bearer tokens are always prefixed with Bearer
  //       extract the token from the auth header
  let token = authHeader.split('Bearer ')[1];

  if (!token)
    return errorHandler(new Error(ERROR_MESSAGE), res);

  // sgc - Verify/decrypt the token for use later
  return jwt.verify(token,process.env.APP_SECRET, (error, data) => {
    if (error) {
      // sgc - Retain error data, but attach generic message
      error.message = ERROR_MESSAGE;
      return errorHandler(error, res);
    }

    // sgc - Use the decoded token to find a user in the database if nothing
    //       is found, then something went wrong
    return Auth.findOne({compareHash: data.token})
      .then(user => {
        if (!user) return errorHandler(new Error(ERROR_MESSAGE),res);
        // sgc - put the user that was found into the req object
        req.user = user;
        next();
      })
      .catch(error => errorHandler(error, res));
  });
};
