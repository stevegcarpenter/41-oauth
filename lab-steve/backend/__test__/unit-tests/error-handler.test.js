'use strict';

const eH = require('../../lib/error-handler.js');

// Test Response Class
class _TestRes {
  constructor() {
    this.statusCode = '';
    this.message = '';
  }

  status(stat) {
    this.statusCode = stat;
    return this;
  }

  send(msg) {
    this.message = msg;
    return this;
  }
}

describe('Error Handler', () => {
  this.res = new _TestRes();

  this.validation = new Error('Validation error: Cannot create content missing');
  this.enoent = new Error('enoent');
  this.pathError = new Error('path error');
  this.objectId = new Error('objectid failed');
  this.duplicate = new Error('duplicate key');
  this.generic = new Error('generic');

  // bad request
  it('should respond 400 status', () => {
    expect(eH(this.validation, this.res).statusCode).toEqual(400);
  });

  // not found
  it('should respond with 404 status', () => {
    expect(eH(this.pathError, this.res).statusCode).toEqual(404);
  });

  // not found
  it('should respond with 404 status', () => {
    expect(eH(this.objectId, this.res).statusCode).toEqual(404);
  });

  // conflict
  it('should respond with 409 status', () => {
    expect(eH(this.duplicate, this.res).statusCode).toEqual(409);
  });

  // internal server error
  it('should respond with 500 status', () => {
    expect(eH(this.generic, this.res).statusCode).toEqual(500);
  });
});
