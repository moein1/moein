   var crypto = require('crypto');

    var Status = new mongoose.Schema({
        name: {
            first: { type: String },
            last: { type: String }
        },
        status: { type: String }
    });

    var Contact = new mongoose.Schema({
        name: {
            first: { type: String },
            last: { type: String }
        },
        accountId: { type: mongoose.Schema.ObjectId },
        added: { type: Date },
        updated: { type: Date }
    });

    var accountSchema = new mongoose.Schema({
        fullName: {
            first: { type: String },
            last: { type: String }
        },
        email: { type: String, unique: true,required:true,trim:true },
        password: { type: String },
        birthday: {
            type: Date
        },
        photoUrl: { type: String },
        biography: { type: String },
        country: { type: String },
        occupation: { type: String },
        mobile: { type: String },
        phone: { type: String },
        websiteUrl: { type: String },
        status: [Status],//my own status only
        activity: [Status],//all status activity including friends
        contacts: [Contact]
    });

    module.exports = mongoose.model('Account', accountSchema);
    
    var addContact = function (account, addcontact) {
        contact = {
            name: addcontact.name,
            accountId: addcontact._id,
            added: new Date(),
            updated: new Date()
        };
        account.contacts.push(contact);

        account.save(function (err) {
            if (err)
                console.log('Error in adding contact to account: ' + err);
        });
    }

    var removeContact = function (account, contactId) {
        if (account.contacts == null) return;

        account.contacts.forEach(function (cont) {
            if (cont.accountId == contactId) {
                account.contacts.remove(cont);
            }
            account.save(function (err) {
                if (err) {
                    console.log('Error removing contact form : ' + err);
                }
            });
        });
    }

    var hasContact = function (account, contactId) {

        if (account.contacts == null) return false;

        account.contacts.forEach(function (cont) {
            if (cont.accountId == contactId) {
                return true;
            }
            
        });
        return false;
    }
   
