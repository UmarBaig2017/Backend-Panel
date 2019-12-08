const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  email:{
      type:String,
      required:[true,'Email is required']
  },
  fName:{
      type:String,
      rrequired:[true,'First Name is required']
  },
  lName:{
      type:String,
      rrequired:[true,'Last Name is required']
  },
  profilePic:{
      type:String,
     default: "https://via.placeholder.com/400x400"
  },
  firebaseUID:{
      type:String,
      unique:true
  },
  isLoggedIn:{
      type:Boolean,
      default:false
  },
  createdDate:{
      type:Date,
      default:Date.now()
  },
  telephone:{
      type:String
  },
  gender:{
      type:Boolean,
      default: true    
  },
  userType:{
      type:Boolean,      //false:Student, true:Tutor,
      default:false
  }
});
UserSchema.index({name:'text','fName':"text"})

module.exports = mongoose.model('Users', UserSchema);