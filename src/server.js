'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var connect = function () {
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    mongoose.connect('mongodb://localhost/auth-test-audit', options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

var AuditSchema = new mongoose.Schema({
    ip: String,
    timestamp: String,
    action: String,
    username: String
});

mongoose.model('Audit', AuditSchema);
var Audit = mongoose.model('Audit');

var app = express();
var port = process.env.PORT || 8080;
var secret = 'auth 1-2=3#4';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/public')));

app.use('/api', expressJwt({secret: secret}));

app.use(function(err, req, res, next){
    if (err.constructor.name === 'UnauthorizedError') {
        res.status(401).send('Unauthorized');
    }
});

app.post('/authenticate', function (req, res) {

    var ip = req.connection.remoteAddress;
    var timestamp = Date.now();
    var action = 'AUTH_FAILURE';
    var username = req.body.username;
    var token;

    if ((isValidUsername(req.body.username) && isValidPassword(req.body.password))) {
        var profile = {
            id: req.body.username.toLowerCase()
        };

        token = jwt.sign(profile, secret, {expiresInMinutes: 60 * 5});
        action = 'AUTH_SUCCESS';
    }

    var audit = new Audit();
    audit.ip = ip;
    audit.timestamp = timestamp;
    audit.action = action;
    audit.username = username;
    audit.save(function () {
        if (token) {
            res.json({token: token});
        } else {
            res.status(401).send('Wrong user or password');
        }
    });
});

app.get('/api/data', function (req, res) {

    if (req.user.id !== 'admin') {
        res.status(401).send('Only admin is allowed');
        return;
    }

    Audit.find({}, function (err, docs) {
        res.json(docs);
    });
});

app.listen(port);
console.log('Express app started on port ' + port);

function isValidUsername(name) {
    var users = '"user", "manager", "admin", "developer", "tester"'.toUpperCase();

    return users.indexOf('"' + name.toUpperCase() + '"') > -1;
}

function isValidPassword(pass) {
    return pass === 'password';
}