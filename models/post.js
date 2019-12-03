const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  
  offerRate:{
      type:Number
  },
  exam:String,
  Region:String,
  description:{
      type:String           //Description of post
  },
  studentFirebaseUID:{
      type:String
  },
  studentfName:{
    type:String
  },
  studentProfilePic:{
      type:String
  },
  chatID:{
      type:String
  },
  subject:{
     type: String 
  }

});

module.exports = mongoose.model('Posts', postSchema);