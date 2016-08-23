'use strict';
var express = require('express');
var app = express();
var router = require('express').Router();
module.exports = router;

router.use('/states', require('./states'));
router.use('/counties', require('./counties'));

router.use(function (req, res) {
    res.status(404).end();
});