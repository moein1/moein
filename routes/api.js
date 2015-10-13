var db = require('../accessDB.js');

//using mailer
var nodemailer = require('nodemailer');


function sendEmail(subject,text,callback) {
    //start test mailer
    var smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: 'm.mammad.karimi@gmail.com', pass: 'nilufar1356' }
    });

    var mailOptions = {
        from: 'm.mammad.karimi@gmail.com',
        //to: emails.join(','),
        to: 'm.mammad.karimi@gmail.com',
        subject: subject,
        text: text
    };

    smtpTransport.sendMail(mailOptions, function (error, response) {
        //console.log('Message sent: ' + response.message);
        if (error)
            callback(error);
        else {
            if (response) {
                callback(null, true);
            }
        }
        console.log('Sending email response :' + response);
        smtpTransport.close();
        //done();
    });

}

exports.login = function (req, res) {
    console.log('**api login');

    db.login(req.body, function (err, user) {
        if (err) {
            console.log('error in api ' + err);
            //res.json({ token: user });
            res.send(401, err);
        } else {
            res.send({ token: user });
        }

    });
}

exports.signup = function (req, res) {
    console.log('***api signup');
    console.log('new user is : ' + req.body);
    db.signup(req.body, function (err, user) {
        if (err) {
            console.log('error signup');
            //res.send(err);
            res.send(401, 'Invalid username/password');
        } else {
            console.log('sign up user in api' + user);
            res.send(200);
        }
    });
}

//foerget pasword
exports.forgetPassword = function (req, res) {
    console.log('###api forgetPassword start');
    var hostname = req.headers.host;
    console.log('host is' + hostname);
    var resetPasswordUrl = 'http://' + hostname + '/resetPassword';
    db.forgetPassword(req.body.email, function (err, user) {
        if (err) {
            //we send back the error has been catched from database 
            res.send({ status: false, message: err });
        }
        else {
            resetPasswordUrl += '?account=' + user._id;
            sendEmail('Socila net password request', 'Please click here to reset your password: ' + resetPasswordUrl, function (err, success) {
                if (err) {
                    res.send('400', err);
                } else if (success) {
                    //send back successfullly send reset password to user
                    res.send({ status: true });
                }
            });
            
        }
    });
}
exports.resetPassword = function (req, res) {
    console.log('***resetpassword start in api');
    db.resetPassword(req.body, function (err, result) {
        if (err) {
            res.send('500', err);
        } else {
            if (result) {
                res.send({ status: true });
            }
        }
    });
}
//chech unique email
exports.checkUniqueEmail = function (req, res) {
    db.checkUniqueEmail(req.query.email, function (err, result) {
        if (err) res.send('500', 'can not check unique email');
            res.send({ available: !result });
        
    });
}

exports.updateProfile = function (req, res) {
    console.log('***update profile api start');

    db.updateProfile(req.params._id, req.body, function (err, profile) {
        if (err) {
            res.send(500, err);
        } else {
            console.log('updaing profile successfully and token is :' + profile);

            res.send({ token: profile });
        }

    });
}

//adding social api
exports.addStatus = function (req, res) {
    
    

    console.log('***accessdb.add status start');
    //console.log('status is' + req.body);
    db.addStatus(req.params._id, req.body, function (err, result) {
        if (err) {
            console.log('***Add status failed');
            res.send(404, err);
        } else {
            console.log('***add status successfully');
            res.send({
                activities: result.activities,
                status: result.status
            });
            /* we can send back to user abount sending this status
            sendEmail('You post new status', 'You can check your profile for seeng new status', function (err, success) {
            });*/
        }
    });
}

exports.getDesiredFriends = function (req, res) {
    db.getDesiredFriends(req.params._id, function (err, friends) {
        if (err) {
            res.send(404, err);
        }
        else {
            res.send({
                desiredFriends: friends.desireFriends,
                askedFriends: friends.askedFriends,
                recievedFriends: friends.recievedFriends,
                acceptFriends: friends.acceptFriends,
                accountActivity: friends.accountActivity,
                accountState: friends.accountState
            });
        }
    });
}

exports.sendFriendRequest = function (req, res) {
    console.log('@@@api sendFriendRequest start ');
    db.sendFriendRequest(req.params._id, req.body.contactId, function (err, status) {
        if (err) {
            res.send(500, err);
        } else {
            console.log('send request successfully');
            res.send({ status: status });
        }
    });
}

exports.acceptFriend = function (req, res) {
    console.log('***accepting friend requet started');
    db.acceptFriend(req.params._id, req.body.contactId, function (err, status) {
        if (err) {
            res.send(500, err);
        } else {
            res.send({ status: status });
        }
    });
}

exports.shareStatus = function (req, res) {
    console.log('***sharing comment start');
    db.shareStatus(req.params._id, req.body, function (err, status) {
        if (err) {
            res.send(500, err);
        } else {
            res.send({ status: status });
        }
    });
}

exports.addCommnet = function (req, res) {
    console.log('****start adding comment**');
    //console.log('req.body.comment is' + req.body.comment);
    //console.log('req.body.statusId is:' + req.body.statusId);
    //res.send(200);
    db.addCommnet(req.params._id, req.body, function (err, status) {
        if (err) {
            console.log('***adding comment failed***');
            res.send(404, err);
        } else {
            console.log('***adding comment successfully');
            res.send({ status: status });
        }
    });
}

exports.likeStatus = function (req, res) {
    console.log('***start like status***');
    db.likeStatus(req.params._id, req.body, function (err, status) {
        if (err) {
            console.log('***adding like failed');
            res.send(404, err);
        } else {
            console.log('***adding like successfuly');
            res.send({ status: status });
        }
    });
}
var formidable = require('formidable'),
    util = require('util'),
    fs = require('fs-extra');

exports.uplaodImage = function (req, res) {
    console.log('***api upload image start');
    var form = new formidable.IncomingForm();
    var message;
    form.parse(req, function (err, fields, files) {
        if (files.file.size > 30000) {
            //alertingService.startAlert('error', 'File size must be less than 30k');
            message = 'File size must be less than 30k';
            console.log('the file is too big');
            res.send({ status: false, message: message });
        } else if (files.file.type != 'image/jpeg') {
            // alertingService.startAlert('error', 'File type must be image/jpeg only');
            message = 'File type must be image/jpeg only';
            console.log('file type is wrong');
            res.send({ status: false, message: message });
        } else {
            /* Temporary location of our uploaded file */
            var temp_path = files.file.path;
            /* The file name of the uploaded file */
            var file_name = files.file.name;
            /* Location where we want to copy the uploaded file */
            var new_location = 'public/img/';
            fs.copy(temp_path, new_location + file_name, function (err) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("success!")
                    res.send({ status: true });

                }
            });
        };
        
    });

}
//end social api
exports.products = function (req, res) {
    console.log('****get products');


    db.getProducts(function (err, products) {
        if (err) {
            console.log('**product error');
            res.json({ products: products });
        } else {
            console.log('**product ok');
            res.json(products);
        }

    });
}

exports.getProduct = function (req, res) {
    console.log('***get single product');
    var productid = req.params.id;
    db.getProduct(productid, function (err, product) {
        if (err) {
            consol.log('**get product error');
            res.json({ product: product });
        } else {
            console.log('***get product ok');
            res.json({ product: product });
        }
    });

};

exports.getLimitProducts = function (req, res) {
    console.log('get limit products');
    var top = req.query.$top;
    var skip = req.query.$skip;
    var orderby = req.query.$orderby;
    var reverse = req.query.$reverse;
    db.getLimitProducts(skip, top, orderby, reverse, function (err, result) {
        if (err) {
            console.log('get limit doc error');
            res.json({ status: false });
        } else {
           // console.log('count is' + result.count);
           // res.setHeader('X-InlineCount', result.count);

            console.log('get limit products ok');
            res.json(result.data);
        }

    });
}

exports.addProduct = function (req, res) {
    console.log('***add product');

    db.insertProduct(req.body, function (err,result) {
        if (err) {
            console.log('***insert customer faild');
            res.json(false);
        } else {
            console.log('***insert customer ok');
            //we can send the just added product to database back to client to 
            //catch the specific result ni clien side
            res.json({ id: result });
        }
    });
}

exports.editProduct = function (req, res) {
    console.log('***editing product');

    db.editProduct(req.params.id, req.body, function (err) {
        if (err) {
            console.log('***edit product failded :err');
            res.json({ 'status': false });
        } else {
            console.log('***edit product ok');
            res.json({ status: true });
        }

    });
}

exports.deleteProduct = function (req, res) {
    console.log('***api.deleting product');

    db.deleteProduct(req.params.id, function (err) {
        if (err) {
            console.log('****delete product failed');
            res.json({ status: false });
        } else {
            console.log('***edleting product ok');
            res.json({ status: true });
        }
    });
}
