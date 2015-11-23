var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var compression = require('compression');
var Schema = mongoose.Schema;

var app = express();



//socket start
var http = require('http');
var server = http.createServer(app);
var socket = require('./routes/socket.js');
var io = require('socket.io').listen(server);
io.sockets.on('connection', socket);

//using agenda
/*var Agenda = require('agenda');
var agenda = new Agenda({ db: { address: 'localhost:27017/productmanager' } });
agenda.define('greet the world', function (job, done) {
    console.log(job.attrs.data.time, 'hello world!');
    done();
});
agenda.schedule('in 10 seconds', 'greet the world', { time: new Date() });
agenda.start();

console.log('wait 10 seconds');*/

/*var multer = require('multer');
app.use(multer({
    dest: './public/img/',
    rename: function (fieldname, filename) {
        return filename;
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
        done = true;
    }
}));*/


//set up the authentication
var jwt = require('jwt-simple');
var tokenSecret = 'your secret token';

//decoding the recived token from client side by jwt by using special token secret
function ensureAuthenticated(req, res, next) {
    console.log(req.headers);
    if (req.headers.authorization) {
        var token = req.headers.authorization.split(' ')[1];

        try {
            var decoded = jwt.decode(token, tokenSecret);
            if (decoded.exp <= Date.now()) {
                res.send(400, 'Access token has expried');
            } else {
                req.user = token.user;
                return next();
            }
        }
        catch (err) {
            return res.send(500, 'error parsing token');
        }
    } else {
        //this error can catch by client $http provider and a proper acknowledge will be made
        return res.send(401);
    }
}
// view engine setup

app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 86400000 }));




app.set('port',process.env.PORT|| 5006);

var config= require('./routes/config');

var conn = config.db;

var DB = require('./accessDB');
var api = require('./routes/api');

//open connection
var db = new DB.startup(conn);

var baseUrl = '/api/dataService/';

//app.get(baseUrl + 'products', api.products);
//adding authenication
app.post('/api/login', api.login);

app.post('/api/signup', api.signup);

app.get('/api/logout', function (req, res) {
    res.send(200);
});

//forget password
app.post('/api/forgetPassword', api.forgetPassword);

//resetPassword
app.post('/api/resetPassword', api.resetPassword);
//cheking unique email address
app.get('/api/user', api.checkUniqueEmail);



app.get(baseUrl + 'GetLimitProducts', api.getLimitProducts);

app.get(baseUrl + 'GetProduct/:id', api.getProduct);

app.post(baseUrl + 'PostProduct', api.addProduct);

app.put(baseUrl + 'PutProduct/:id', api.editProduct);

app.delete(baseUrl + 'DeleteProduct/:id', ensureAuthenticated, api.deleteProduct);

//profile url
var profileUrl = '/api/Profile/';

app.put(profileUrl + 'updateProfile/:_id', api.updateProfile);
//this is must use as the final route and befor error
//can prevent any error by refreshing the page when using htm5 without #
//adding social

app.put(profileUrl + 'addStatus/:_id', api.addStatus);

app.get(profileUrl + 'getDesiredFriends/:_id', api.getDesiredFriends);

app.put(profileUrl + 'sendFriendRequest/:_id', api.sendFriendRequest);

app.put(profileUrl + 'acceptFriend/:_id', api.acceptFriend);

app.put(profileUrl + 'shareStatus/:_id', api.shareStatus);

app.put(profileUrl + 'addCommnet/:_id', api.addCommnet);

app.put(profileUrl + 'likeStatus/:_id', api.likeStatus);
//uplad image
app.post('/api/uploadFile', api.uplaodImage);
//end social
app.get('*', function (req, res) {
    res.redirect('/#' + req.originalUrl);
});

app.use(function (req, res, err, next) {
    console.log(err.stack);
    res.send(500, { message: err.message });
});

/*app.listen(app.get('port'), function () {
    console.log('We are listening in port number ' + app.get('port'));
});
*/
//for using socket chat must use server
server.listen(app.get('port'), function () {
    console.log('We are listening on port number :' + app.get('port'));
});