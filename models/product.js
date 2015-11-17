var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//this is a setting for producing id for product table
var settingSchema = new Schema({
    collectionName: { type: String, required: true, trim: true, default: 'products' },
    nextSeqNumber: { type: Number, default: 1 }
});
var productSchema = new Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    id: { type: Number , unique: true }
});

//settingb inex
productSchema.index({ id: 1, type: 1 });

//i make sure that this is the last pre save middlware
var Settings = mongoose.model('settings', settingSchema);

//this pre save methos can set the last id to last inseeted product
productSchema.pre('save', function (next) {
    var doc = this;

    if (this.isNew) {
        console.log(doc);
        //the setting table has only one row for each colletion in this example products collection
        //in every change if this is a insert you can increnent the seq number by one and catch the current seq number
        //for this last insert row to products colection
        Settings.findOneAndUpdate({ 'collectionName': 'products' }, { $inc: { nextSeqNumber: 1 } }, function (err, setting) {
            if(setting==null){
                var firstrow=new Settings;
                console.log('we re in setting null');
                firstrow.save(function (err) {
                    if(err) next(err);

                    doc.id=1;
                    next();
                })
            }else{
                console.log(setting);
                if (err) next(err);
                doc.id = setting.nextSeqNumber - 1;
                console.log(doc.id);
                next();
           }
            
        });
    } else
        next();
});

exports.productSchema = productSchema;

module.exports = mongoose.model('product', productSchema);

