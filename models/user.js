var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var bcrypt = require('bcryptjs');

var Like = new mongoose.Schema({
    fullName: {
        first: { type: String },
        last: { type: String }
    },
    accountId: { type: mongoose.Schema.ObjectId },
    added: { type: Date }
});

var Comment = new mongoose.Schema({
    fullName: {
        first: { type: String },
        last: { type: String }
    },
    accountId: { type: mongoose.Schema.ObjectId },
    commentText: { type: String },
    photoUrl: { type: String },
    added: { type: Date }
});

//every status must has a acccountId so we
//can recognize who sent this status
//and the database will add an _id for id by default
var Status = new mongoose.Schema({
    fullName: {
        first: { type: String },
        last: { type: String }
    },
    accountId: { type: mongoose.Schema.ObjectId },
    status: { type: String },
    photoUrl: { type: String },
    added: { type: Date },
    comments: [Comment],
    likes: [Like]
});

var Contact = new mongoose.Schema({
    fullName: {
        first: { type: String },
        last: { type: String }
    },
    accountId: { type: mongoose.Schema.ObjectId },
    added: { type: Date },
    updated: { type: Date },
    status: { type: String },
    photoUrl: { type: String },
    occupation: { type: String },
    country: { type: String }
});

var shortAccountSchema = new mongoose.Schema({
name:{type:String,required:true,trim : true },
email : { type: String, required: true, trim: true, unique: true, lowercase: true },
password:{type : String , required : true, trim :true},
userId:{type:String}
})

var userSchema = new Schema({
    shortAccountId:{ type : String },
    //name: { type: String, required: true, trim: true },
    fullName: {
        first: { type: String },
        last: { type: String }
    },
   // email: { type: String, required: true, trim: true, unique: true, lowercase: true },
   // password: { type: String, required: true, trim: true },
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
    uploadedFile:{type:String},
    status: [Status],//my own status only
    activity: [Status],//all status activity including friends
    contacts: [Contact]
});

//this is a method for encrypting the password befor store in database
//we use bcrypt middlewaere
shortAccountSchema.pre('save', function (next) {
    console.log('we are in bscrypt password bsessin');
    var user = this;
    //
    if (!user.isModified('password')) next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

shortAccountSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {

        if (err) return cb(err);
        cb(null, isMatch);
        console.log(candidatePassword);
    });
}


exports.userSchema = userSchema;
module.exports ={
    User :  mongoose.model('User', userSchema),
    ShortAccount : mongoose.model('ShortAccount' , shortAccountSchema)
}

