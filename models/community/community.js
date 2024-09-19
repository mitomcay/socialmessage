const mongoose = require('mongoose');

const  communitychema  = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    CommunityPicture:{
        type: mongoose.Schema.ObjectId,
        ref: 'media',
    },
    createdAt:{
        type: Date,
        type: Date.now,
    },
    updatedAt:{
        type: Date,
        type: Date.now,
    },
    Isprivate:{
        type: Boolean,
        default: false,
    }

});

const community = mongoose.model('community', communitychema);

module.exports = community;