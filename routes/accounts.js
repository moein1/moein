module.exports = function (app, models) {
    app.get('/accounts/:id/contacts', function (req, res) {
        var accountId = req.params.id == 'me' ?
            req.session.accountId :
            req.params.id;

        models.Account.findbyId(accountId, function (account) {
            res.send(account.contacts);
        });
    });

    app.get('/accounts/:id/activity', function (req, res) {
        var accountId = req.params.id == 'me' ?
            req.session.accountId :
            req.params.id;

        models.Account.findbyId(accountId, function (account) {
            res.send(account.activity);
        });
    });

    app.get('/accounts/:id/status', function (req, res) {
        var accountId = req.params.id == 'me' ?
            req.session.accountId :
            req.params.id;

        models.Account.findbyId(accountId, function (account) {
            res.send(account.status);
        });
    });

    app.post('/accounts/:id/status', function (req, res) {
        var accountId = req.params.id == 'me' ?
        req.session.accountId :
        req.params.id;

        models.Account.findbyId(accountId, function (account) {
            var status = {
                name: account.name,
                status: req.param('status', '')
            };
            
            account.status.push(status);

            //push the status to all friends
            account.activity.push(status);
            account.save(function (err) {
                if (err) {
                    console.log('Error saving account : ' + err);
                } else {
                    res.sen(200);
                }
            });
        });
    });

    app.delete('/accounts/:id/contact', function (err, req) {
        var accountId = req.params.id == 'me' ?
        req.session.accountId :
        req.params.id;

        var contactId = req.param('contactId', null);

        //missing contctid do not bother going any further

        if (contactId == nul) {
            res.send(400);
            return;
        }

        models.Account.findbyId(accountId, function (account) {
            if (!account) return;
            models.Account.findbyId(contactId, function (err, contact) {
                if (!contact) return;

                models.Account.removeContact(account, contactId);

                //killing reverse side
                models.Account.removeContact(contact, accountId);
            });
        });

        res.send(200);
    });

    app.post('/accounts/:id/contact', function (req, res) {
        var accountId = req.params.id == 'me' ?
       req.session.accountId :
       req.params.id;

        var contactId = req.param('contactId', null);

        if (contactId == null) {
            res.send(400);
            return;
        }

        models.Account.findbyId(accountId, function (account) {
            if (account) {
                models.Account.findbyId(contactId, function (contact) {
                    models.Account.addContact(account, contact);

                    //make the reverse
                    models.Account.addContact(contact, account);

                    account.save();
                });
            }
        });
        
        res.send(200);
    });

    app.get('/accounts/:id', function (req, res) {
        var accountId = req.params.id == 'me' ?
      req.session.accountId :
      req.params.id;

        models.Account.findbyId(accountId, function (account) {
            if (accountId == 'me' || models.Account.hasContact(account, req.session.accountId)) {
                account.isFriend = true;
            }
            res.send(account);
        });
    });
}