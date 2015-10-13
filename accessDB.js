var mongoose = require('mongoose'),
    Product = require('./models/product'),
    User = require('./models/user');
//Account = require('./models/Account');

//encoding thev user and expire dat of that by special token
var jwt = require('jwt-simple');
var moment = require('moment');
var tokenSecret = 'your secret token';
var bcrypt = require('bcryptjs');
function createjwttoken(user) {
    var payload = {
        user: user,
        iat: new Date().getTime(),
        exp: moment().add('days', 7).valueOf
    };
    return jwt.encode(payload, tokenSecret);
}


//connect to database
module.exports = {
    startup: function (dbToUse) {
        mongoose.connect(dbToUse);
        //check connection to mongodb
        mongoose.connection.on('open', function () {
            console.log('we have connected to database');
        });
    },
    //disconnect from database
    closeDB: function () {
        mongoose.disconnect();

    },
    //adding authentication part 
    login: function (req_body, callback) {
        console.log('**accessDB.login');
        console.log(req_body.email);
        //we shoud use findOne instead of find beacause it return a single user
        User.findOne({ 'email': req_body.email }, {}, function (err, user) {
            if (!user) {
                console.log('user name does ont exist');
                return callback('User does not exist');
            } else {
                console.log('accessdb.get user : ' + user.password);
                console.log('req_body pass : ' + req_body.password);
                //var token = createjwttoken(user);
                // callback(null, token);
                user.comparePassword(req_body.password, function (err, isMatch) {
                    if (!isMatch) {
                        
                        return callback('Invalid username/password');
                    }
                    console.log('is match is  ' + isMatch);
                    var token = createjwttoken(user);
                    callback(null, token);
                
                })
            }
        })
    },
    signup:function(req_body,callback)
    {
        var user = new User;
        user.name = req_body.name;
        user.email = req_body.email;
        user.password = req_body.password;
        user.fullName.first = req_body.firstName;
        user.fullName.last = req_body.lastName;
        user.country = req_body.country;
        user.occupation = req_body.occupation;
        console.log('***accessdb.start signup name ' + req_body);
        //we need to create an new Account
        //var account = new Account;
        //account.email = req_body.email;
        //account.password = req_body.password;
        user.save(function (err, user) {
            if (err) {
                console.log('error signup :' + user);
                return callback('signup error');
               
            } else {
                //save new account
                
                console.log('new signup user :'+user);
                return callback(null, user);
            }
        });
    },
    //forget password
    forgetPassword: function (email, callback) {
        console.log('**localDB forgotpassword start');
        User.findOne({ email: email }, {}, function (err, user) {
            if (err) {
               return callback('there is some problem in db request');
            }
            if (!user) {
              return  callback('Email does not exist');
            } else {
                //send back the related account to this email address
                console.log('user is ' + user);
                return callback(null, user);
            }
        });
    },
    //reset passwortd
    resetPassword: function (req_body, callback) {
        console.log('Reset passeword start in accessDb');
        console.log('req_body is ' + req_body.accountId);
        console.log('req_body new pass is:' + req_body.newPassword);
        User.findOne({ '_id': req_body.accountId }, {}, function (err, user) {
            if (!user) {
                console.log('some problem occured duting change password');
                return callback('User does not exist');
            }
            else {
                console.log('user with old pass is ' + user.password);
                user.password = req_body.newPassword;
                user.save(function (err, newuser) {
                    if (err)
                        return callback('Some error has been occured during changing password');
                    else {
                        console.log('Account with new pass is' + newuser.password);
                        return callback(null, true);
                    }
                });
                
            }
        });
    },
    //check unique email
        checkUniqueEmail: function (email, callback) {
        if (email) {
            User.findOne({ 'email': email }, {}, function (err, user) {
                if (!user) {
                   return callback(null, false);
                } else {
                   return callback(null, true);
                }
            });
        } else {
            return callback('you must enter email');
        }
    },
    updateProfile:function(id,req_body,callback)
    {
        console.log('***update profile in accessdb');
       // var user = new User;
        User.findOne({ '_id': id }, {}, function (err, user) {
            if (!user) {
                return callback('user not found');
            } else {
                console.log(user);
            }

            user.fullName.first = req_body.fullName.first||user.fullName.first;
            user.fullName.last = req_body.fullName.last || user.fullName.last;
            user.email = req_body.email || user.email;
            user.biography = req_body.biography || user.biography;
            user.birthday = req_body.birthday || user.birthday;
            user.country = req_body.country || user.country;
            user.occupation = req_body.occupation || user.occupation;
            user.mobile = req_body.mobile || user.mobile;
            user.phone = req_body.phone || user.phone;
            user.uploadedFile = req_body.uploadedFile || user.uploadedFile;
            user.websiteUrl = req_body.websiteUrl || user.websiteUrl;
            console.log('current profile in accesdb is :' + user);
            user.save(function (err) {
                if (err) {
                    console.log('Update prfile error :' + err);
                    return callback(err);
                } else {
                    console.log('just after update profile ' + user);
                    //we must update the token
                    var token = createjwttoken(user);
                    console.log('token is ; ' + token);
                    return callback(null, token);
                }
            });
        });
    },

    addStatus: function (accountId,req_body, callback)
    {
        console.log('status id in accessdb is ' + req_body.status);

        User.findOne({ '_id': accountId }, {}, function (err, account) {
            if (!account) {
               // console.log('Account full name:' + account.fullName.first);
                
                return callback('Account not found');
            } else {
                var addedDate = new Date();
                
                newStatus = {
                    fullName: { first: account.fullName.first, last: account.fullName.last },
                    status: req_body.status,
                    photoUrl: account.uploadedFile,
                    added: addedDate,
                    accountId: account._id
                };
                //console.log('new status in accessdb ' + newStatus);
                //status is your own stauss
               // console.log('account is ' + account);
                //console.log('new status is ' + newStatus);
                account.status.push(newStatus);

                //activity is the status that all the friends can see 
                //so you have to update this but your friend 
                //can not be aware about your new status 
                //push the status to all friends
                account.activity.push(newStatus);
                account.save(function (err,updateAccount) {
                    if (err) {
                        console.log('Adding status failed' + err);
                        return callback('Adding status failed :' + err);
                    } else {
                        //firdt policy send all the account in every status add
                        /*console.log('New status has been added successfully');
                        var token = createjwttoken(updateAccount);
                        return callback(null, token);*/
                        //second
                        console.log('accoun after adding status' + account);
                        return callback(null, { activities: account.activity, status: account.status });
                    }
                });
            }
        });
    },
    getDesiredFriends: function (accountId, callback)
    {
        User.findOne({ '_id': accountId }, {}, function (err, account) {
            if (!account) {
                console.log('Account does not exist');
                return callback('Account does not exist');
            } else {
                console.log('get account successfully');
                //now we must decide about serching friend related to this account
                //first take 10 friends from your country
                var accountActivity = account.activity;
                var accountStatus = account.status;
                var ExceptFriends = [];
                //we need to send asked and recieved firends to client
                //in every refresh
                //because we do not refresh the user profile in every postbback
                var askedFriends = [];
                var recievedFriends = [];
                var accpetFriends = [];
                var countryFilter = account.country;
                var occupationFilter = account.occupation;
                if (!countryFilter && !occupationFilter) {
                    return callback('there is no country set');
                }
               // console.log('country is :' + countryFilter);
                //finding friend request in contacts
                //we must except this trecieved friend by some special flag
                //we must add your accountid as exception
                //we must except asked friends too
                ExceptFriends.push(account._id);
                for (var i = 0; i < account.contacts.length; i++) {
                    if (account.contacts[i].status == 'recieved' ) {
                        ExceptFriends.push(account.contacts[i].accountId);
                        recievedFriends.push(account.contacts[i]);
                    } else if (account.contacts[i].status == 'sent') {
                        ExceptFriends.push(account.contacts[i].accountId);
                        askedFriends.push(account.contacts[i]);
                    } else if (account.contacts[i].status == 'accepted') {
                        ExceptFriends.push(account.contacts[i].accountId);
                        accpetFriends.push(account.contacts[i]);
                    }
                    
                };
                
               // console.log('recieved friends are ' + ExceptFriends);
                User.find({
                    $and: [{ $or: [{ 'country': countryFilter }, { 'occupation': occupationFilter }] },
                        { '_id': { $not: { $in: ExceptFriends } } }]
                },
                    { '_id': 1, 'fullName.first': 1, 'fullName.last': 1, 'occupation': 1, 'country': 1, 'uploadedFile': 1 }).
                    limit(10).exec(function (err, desireFriends) {
                        if (err) return callback('some error occured in getting friends')
                        else {
                            //console.log('desired friends are ' + desireFriends);
                            //at the same time we can carry out cuurent activity and state of account
                            return callback(null,
                                {
                                    desireFriends: desireFriends, askedFriends: askedFriends,
                                    recievedFriends: recievedFriends, acceptFriends: accpetFriends,
                                    accountActivity: accountActivity, accountState: accountStatus
                                });
                        }

                    });

            }
        });
    },
    sendFriendRequest: function (accountId,contactId, callback)
    {
        User.findOne({ '_id': accountId }, function (err,account) {
            if (!account) {
                console.log('Account does not exist');
                return callback('Account does not exist');
            } else {
                console.log('get account successfully');
                User.findOne({ '_id': contactId }, function (err, contact) {
                    if (!contact) {
                        console.log('Contact does not exist');
                    } else {
                        console.log('Get contact successfully');
                        //we must add a contact to cntactid and another one to accountid
                        //the state of contactid is requested and the other one is asked
                        var reciver = {
                            fullName: { first: contact.fullName.first, last: contact.fullName.last },
                            accountId: contactId,
                            updated: new Date(),
                            status: 'recieved',
                            photoUrl: contact.uploadedFile,
                            occupation: contact.occupation,
                            country: contact.country
                        };
                        account.contacts.push(reciver);
                        account.save(function (err) {
                            if (err) return callback('adding asked to account failed');
                        });
                        var sender = {
                            fullName: { first: account.fullName.first, last: account.fullName.last },
                            accountId: accountId,
                            updated: new Date(),
                            status: 'sent',
                            photoUrl: account.uploadedFile,
                            occupation: account.occupation,
                            country: account.country
                        };
                        contact.contacts.push(sender);
                        contact.save(function (err) {
                            if (err) return callback('adding requested to account failed');
                        });
                    }
                });
                
                return callback(null, true);
            };
        });
    },
    acceptFriend: function (accountId, contactId, callback) {
        console.log('accept friend accountid is ' + accountId);
        console.log('accept friend contactId is ' + contactId);
        User.findOne({ '_id': accountId }, function (err, account) {
            if (!account) {
                console.log('Account does not exist');
                return callback('Accont does not exist');
            } else {
                //set the sent friend to accept and updated to new date
                for (var i = 0; i < account.contacts.length; i++) {
                    if (account.contacts[i].accountId == contactId) {
                        //console.log('account id is ' + contactId);
                        account.contacts[i].status = 'accepted';
                        account.contacts[i].updated = new Date();
                        account.save(function (err) {
                            if (err) return callback('Saving accept friend in account failed');
                        });
                        break;
                    }
                }

                

                //send thec reverse
                User.findOne({ _id: contactId }, function (err, contact) {
                    if (!contact) {
                        console.log('Contact does not exist');
                        return callback('contact does not exist');
                    } else {
                        for (var i = 0; i < contact.contacts.length; i++) {
                            if (contact.contacts[i].accountId == accountId) {
                                console.log('accountid is ' + accountId);
                                contact.contacts[i].status = 'accepted';
                                contact.save(function (err) {
                                    if (err) return callback('saving accpet friend in contact failed');
                                });
                                break;
                            }
                        }
                    }
                   
                });
                console.log('set accept friend successfully' + account.fullName.first);
                return callback(null, true);
            }
        });
    }
    ,
    shareStatus: function (accountId, status, callback)
    {
        console.log('status fro share is ' + status);
        //first we must find the friends
        var friendsList = [];
        User.findOne({ '_id': accountId }, {}, function (err, account) {
            if (!account) {
                console.log('Account does not exist');
                return callback('Account does not exist');
            } else {
                console.log('Account has been found successfully');
                for (var i = 0; i < account.contacts.length; i++) {
                    //search for friends
                    if (account.contacts[i].status == 'accepted') {
                        friendsList.push(account.contacts[i].accountId);
                    }
                }

                //now we must add this status to all the friends list
                User.find({ '_id': { $in: friendsList } }, {}, function (err, contacts) {
                    for (var i = 0; i < contacts.length; i++) {
                        contacts[i].activity.push(status);
                       // contacts[i].
                        contacts[i].save(function (err) {
                        });
                    }
                    return callback(null, true);
                });
            }
        });

    },
    addCommnet:function(originAccountId,req_body,callback)
    {
        var comment = req_body.comment;
        var statusId = req_body.statusId;
       // console.log('origin accountid is' + originAccountId);
        console.log('**accessdb.addcomment*** +commenttext:' + comment.commentText);
        //we must search through the all the account friends
        //because the source of the status has been this account
        //so we must search for friend of this account
        //then we must search for their status that be same as statusId
        var originFriends = [];
        User.findOne({ '_id': originAccountId }, { 'contacts': 1 }, function (err, account) {
            if (!account) {
                console.log('Account does not exist');
                return callback('Account does not exist');

            }
            //now we must find the originAccount friends
            //console.log('origin account is ' + account.contacts);
            for (var i = 0; i < account.contacts.length; i++) {
                if (account.contacts[i].status == 'accepted') {
                    originFriends.push(account.contacts[i].accountId);
                }
            }

            //now we must find the corresponding statusId of this friends and add the
            //this comment to them we must be csrefull not to forget origninAccountId
           // console.log('origin friends are' + originFriends);
            originFriends.push(originAccountId);
            //console.log('origbifreind + origin account ' + originFriends);

            User.find({ '_id': { $in: originFriends } }, {}, function (err, accounts) {
                if (!accounts) {
                    console.log('there is no corresponding friend list');
                   // console.log('acconts are ' + accounts);
                    return callback('there is no corresponding friend list');
                } else {
                  
                    for (var i = 0; i < accounts.length; i++) {
                        for (var j = 0; j < accounts[i].activity.length; j++) {
                            if (accounts[i].activity[j]._id == statusId) {
                                accounts[i].activity[j].comments.push(comment);
                                accounts[i].save(function (err) {
                                    if (err) {
                                        console.log('error adding new comment to this activity of this friend');
                                        
                                    }
                                });
                            }
                        }

                    }
                }
                return callback(null, true);
            });
        });


    },
    likeStatus:function(originAcountId,req_body,callback)
    {
        console.log('**accessdb.astart adding like');
        //first we must find all the friends of origin account
        var acceptFriends = [];
        User.findOne({ '_id': originAcountId }, {}, function (err, account) {
            if (!account) {
                console.log('Account does not exist');
                return callback('unable to find account');
            } else {
                //finding list of freinds
                for (var i = 0; i < account.contacts.length; i++) {
                    if (account.contacts[i].status == 'accepted') {
                        acceptFriends.push(account.contacts[i].accountId);
                    }
                }
                
                //we must add originAccount too
                acceptFriends.push(originAcountId);

                //now we must add like to this friend list
                User.find({ '_id': { $in: acceptFriends } }, {}, function (err, accounts) {
                    if (!accounts) {
                        console.log('Aunable to find friends list')
                        return callback('unable to find friend list');
                    }

                    for (var i = 0; i < accounts.length; i++) {
                        for (var j = 0; j < accounts[i].activity.length; j++) {
                            if (accounts[i].activity[j]._id == req_body.statusId) {
                                accounts[i].activity[j].likes.push(req_body.newLike);
                                accounts[i].save(function (err) {
                                });
                            }
                        }
                    }
                    console.log('likes add successfully');
                   return callback(null, true);
                });
            }
        });
    },
    getProducts: function (callback) {
        console.log('AccessDB.getProducts');

        Product.find({}, {}, function (err, products) {
            callback(null, products);
        });
    },
    insertProduct: function (req_body, callback) {
        console.log('AccessDB.Insertproduct');
        console.log(req_body);
        var product = new Product;

        product.name = req_body.name;
        product.price = req_body.price;
        product.category = req_body.category;
        product.id = 1;//the id will calculate by pre save event
        product.save(function (err, prod) {
            if (err) {
                console.log('**new Product save err :' + err);
                //we can feed the callback function we the err parameter that
                //can realize the process of insering had some problem 
                return callback(err);
            }
            console.log('product id' + prod.id);
            //in callback function we catch err and result if the err=null will be sent we can recognize the 
            //insering process has been done succesfully and the id of inserted product has been sent back to client side 
            callback(null, prod.id);
        });
    },
    getProduct:function(id,callback)
    {
        console.log('**accessDB.getsingleProduct');
        Product.findOne({ 'id': id }, {}, function (err, product) {
            if (err) {
                return callback(err);
                console.log('**get product error');
            } else {
                return callback(null, product);
            }

            
        });
    },
    getLimitProducts: function (skip, top,orderby,reverse, callback) {
        var counts;
        var asc;
        console.log('***accessDB.getLimitProdut**');
        var order = orderby;
        console.log('orderby : ' + order);
        var query=Product.find({});
        query.exec(function (err, prods) {
            counts = prods.length;
        });
        console.log('reverse is :' + reverse);
        reverse == -1 ? asc = '' : asc = '-';
        //we use asc var for asc and desc order
        console.log('asc :' + asc);
        query.sort(asc+order).skip(skip).limit(top).exec(function (err, docs) {
            result = ({
                count: counts,
                data: docs
            });
            if (err) {
                console.log('Error has been occured in getting products');
                return callback(err);
            } else {
                console.log('accessDB.Get limit products ok');

                return callback(null, result);
            }
        });

       /* Product.find({}, {}, function (err, products) { counts = products.length }).sort('name').skip(skip).limit(top)
        .exec(function (err, docs) {
            result = ({
                count: counts,
                data: docs
            });
            if (err) {
                console.log('Error has been occured in getting products');
                return callback(err);
            } else {
                console.log('accessDB.Get limit products ok');

                return callback(null, result);
            }
        });*/
    },
    editProduct: function (id, req_body, callback) {
        console.log('****Edit product.accessDB');

        //first we must query the single product corresponding to the id 
        //and after then we can update the informtion that come from the client side
        Product.findOne({ 'id': id }, {}, function (err, product) {
            if (err) return callback(err);

            product.name = req_body.name || product.name;
            product.price = req_body.price || product.price;
            product.category = req_body.category || product.category;

            product.save(function (err) {
                if (err) {
                    //this means that some error occured during update procsess
                    console.log('**Edit product failed:' + err);
                    return callback(err);
                    
                }

                //returning callback function with null means there is no error and updating
                //has been done successfully
                callback(null);
            });
        });
    },
    deleteProduct: function (id, callback) {
        console.log('****accessDb.delete productno:' + id);
        //query the products collection for specific product and in exec we can remove that
        var query = Product.findOne({ 'id': id }, {}, function (err, doc) {
            console.log('just befor deletig : ' + doc);
            doc.remove(function (err, deletedDoc) {
                if (err) callback(err)
                else {
                    console.log('Just after deleting product : ' + deletedDoc);
                    callback(null);
                }
            });
        });
       
    }
}

