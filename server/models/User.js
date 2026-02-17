const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: { // Add the _id field to match the Firebase UID
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    hostelAddress:{
        type: String, 
        required: true,
        trim: true
    },
    phoneNumber:{
        type: String,
        required: true,
        trim: true
    },
    avatarId:{
        type:String,
        required:true,
    },
    reputation:{
        type: Number,
        default: 0,
        index : true,
    },

    reputationLevel:{
        type: String,
        enum: ['new','trusted','contributor','moderator'],
        default: 'new',
    },
}, {
    timestamps: true,
});
userSchema.index({ reputation: -1});


module.exports = mongoose.model('User', userSchema);;