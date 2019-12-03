const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    createdAt:{
        type:String,
        default:Date.now()
    },
    text:{
        type:String
    },
    image:{
        type:String
    },
    senderAvatarLink:{
        type:String,
        default:'https://placeimg.com/140/140/any'
    },
    senderID:{
        type:String,
        required:true
    }
})

const ChatsSchema = new mongoose.Schema({
    messages:{
    type:[MessageSchema]
    },
    studentUID:{
    type:String
    },
    teacherUserID:{
        type:String
    },
    teacherProfilePic:{
        type:String,
        
    },
    teacherFname:{       
        type:String
    },
    studentrProfilePic:{
        type:String,
        
    },
    studentFname:{         
        type:String
    },
});

module.exports = mongoose.model('Chats', ChatsSchema);