var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var oauth = require('./oauth-models/oauth');
require('dotenv').config()

var index = require('./routes/index.route');
var users = require('./routes/users.route');
var auth = require('./routes/auth.route');
var {initDataSource} = require('./helpers/data-source');
const {connectRedis} = require("./helpers/redis-client");
var app = express();

// handle error
process.on('uncaughtException', err => {
    console.error('There was an uncaught error', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason)
})

// mysql connection typeorm
initDataSource();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/auth', auth);

global.jwtToken = [];

// For handle user count times
global.userCountLoginTimesMap = new Map();

let redisClient = {};
// Init cache data into global
connectRedis().then((res) => {
    redisClient = res;
    redisClient.keys('*').then(keys => {
        for(let i = 0; i < keys.length; i++) {
            redisClient.get(keys[i]).then((value) => {
                global.jwtToken[keys[i]] = value;
                console.log(global.jwtToken)
            });
        }
    });
}).catch((error) => {
    console.log(error)
    console.log("connect redis failed!")
});

app.use(oauth.errorHandler());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    console.log(err)
    res.json('error');
});

module.exports = app;
