'use strict'

/**
 * Module Dependencies
 */
const config = require('./config'),
    restify = require('restify'),
    bunyan = require('bunyan'),
    winston = require('winston'),
    bunyanWinston = require('bunyan-winston-adapter'),
    errs = require('restify-errors');

/**
 * Logging
 */
global.log = new winston.Logger({
    transports: [
        new winston.transports.File({
            name: 'info-file',
            level: 'info',
            filename: "./logs/info.log",
            json: true
        }),
        new winston.transports.File({
            name: 'error-file',
            level: 'error',
            filename: "./logs/error.log",
            json: true
        }),
        new winston.transports.File({
            name: 'verbose-file',
            level: 'verbose',
            filename: "./logs/verbose.log",
            json: true
        }),
        new winston.transports.File({
            name: 'silly-file',
            level: 'silly',
            filename: "./logs/silly.log",
            json: true
        }),
        new winston.transports.File({
            name: 'debug-file',
            level: 'debug',
            filename: "./logs/debug.log",
            json: true
        }),
        new winston.transports.File({
            name: 'warn-file',
            level: 'warn',
            filename: "./logs/warn.log",
            json: true
        }),
        new winston.transports.Console({
            level: 'info',
            timestamp: () => {
                return new Date().toString()
            },
            json: true
        }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: './logs/exceptions.log', json: true })
    ],
    exitOnError: false
})

/**
 * Initialize Server
 */
global.server = restify.createServer({
    name: config.name,
    version: config.version,
    log: bunyanWinston.createAdapter(log),
});

server.pre(function(req, res, next) {
    //before routing
    return next();
});

/**
 * Middleware
 */
server.pre(restify.plugins.jsonBodyParser({ mapParams: true }));
server.pre(restify.plugins.acceptParser(server.acceptable));
server.pre(restify.plugins.queryParser({ mapParams: true }));
server.pre(restify.plugins.fullResponse());

/**
 * Error Handling
 */
server.on('uncaughtException', (req, res, route, err) => {
    log.error(err.stack)
    res.send(err);
});

server.on('InternalServer', function(req, res, err, cb) {
    // if you don't want restify to automatically render the Error object
    // as a JSON response, you can customize the response by setting the
    // `body` property of the error
    og.error(err.stack)
    err.body = '<html><body>some custom error content!</body></html>';
    return cb();
});

server.on('NotFound', function(req, res, err, cb) {
    // do not call res.send! you are now in an error context and are outside
    // of the normal next chain. you can log or do metrics here, and invoke
    // the callback when you're done. restify will automtically render the
    // NotFoundError as a JSON response.
    log.error(err.stack)
    return cb();
});

server.on('restifyError', function(req, res, err, cb) {
    // this listener will fire after both events above!
    // `err` here is the same as the error that was passed to the above
    // error handlers.
    log.error(err.stack)
    return cb();
});

server.listen(config.port, function() {
    require('./routes');
    console.log('%s listening at %s', config.name, config.base_url);
});