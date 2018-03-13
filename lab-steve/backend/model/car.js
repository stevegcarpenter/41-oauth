'use strict';

const mongoose = require('mongoose');

const Car = mongoose.Schema({
  model: {
    type: String,
    required: true,
  },
  make: {
    type: String,
    required: true,
  },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user',
  },
});

// Export the Model
module.exports = mongoose.model('car', Car);