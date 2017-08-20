'use strict'

/**
 * Module Dependencies
 */
const _ = require('lodash'),
    errors = require('restify-errors');

/**
 * GET
 */
server.get('/hello/:name', function(req, res, next) {
    res.send('hello ' + req.params.name);
    next();
});