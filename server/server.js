'use strict';

var http = require('http');
var chalk = require('chalk');
var server = http.createServer();

var PORT = process.env.PORT || 1337;

server.on('request', require('./app'));

server.listen(PORT, function () {
    console.log(chalk.blue('Server started on port', chalk.magenta(PORT)));
});