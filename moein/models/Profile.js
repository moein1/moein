module.exports = function (mongoose) {
    Schema = mongoose.Schema;

    var bcrypt = require('bcryptjs');

    var userSchema = new Schema({
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, unique: true, lowercase: true },
        password: { type: String, required: true, trim: true }
    });

    //this is a method for encrypting the password befor store in database
    //we use bcrypt middlewaere
    userSchema.pre('save', function (next) {
        var user = this;
        //
        if (!user.isModified('pssword')) next();

        bcrypt.genSalt(10, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.pssword, salt, function (err, hash) {
                if (err) return next(err);

                user.password = hash;
                next();
            });
        });
    });

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
        email: { type: String, unique: true },
        password: { type: String },
        name: {
            first: { type: String },
            last: { type: String },
            full: { type: String }
        },
        birthday: {
            day: { type: Number, min: 1, max: 31, required: false },
            month: { type: Number, min: 1, max: 12, required: false },
            year: { type: Number }
        },
        photoUrl: { type: String },
        biography: { type: String },
        status: [Status],//my own status only
        activity: [Status],//all status activity including friends
        contacts: [Contact]
    });

    var Account = mongoose.model('Account', accountSchema);

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
    return {
        Account: Account,
        hasContact: hasContact,
        addContact: addContact,
        removeContact: removeContact
    };
}