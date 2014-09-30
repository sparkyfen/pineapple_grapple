'use strict';

var express = require('express');
var controller = require('./query.controller');

var router = express.Router();

router.post('/', controller.index);

module.exports = router;