'use strict';

var express = require('express');
var controller = require('./whois.controller');

var router = express.Router();

router.post('/', controller.index);
router.get('/', controller.index);

module.exports = router;