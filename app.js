var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');
var path = require('path');
var gameRoutes = require('./routes/game');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 'extended':  false }));
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/game', gameRoutes);
app.use(function(request, response, next){
    var error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use(function(error, request, response, next){
    response.locals.message = error.message;
    response.locals.error = request.app.get('env') == 'development' ? error: {};
    response.status(error.status || 500);
    response.json({
        message: error.message,
        error: error
    });
});

module.exports = app;
