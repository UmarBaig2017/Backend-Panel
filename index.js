const express = require('express')
var http = require('http');

const app = express()
var server = http.createServer(app);
const Chats = require('./models/Chats')
const process = require('process')
const bodyParser = require('body-parser')
const User = require('./models/User')
const Teacher = require('./models/TeacherProfile')
const Region = require('./models/Regions')
const Activity = require('./models/Activity') 
const Post = require('./models/post') 

const Exam = require('./models/Exams')
const mongoose = require('mongoose')
const url = 'mongodb://demo:demo123@ds245018.mlab.com:45018/studentportal'
const port = process.env.PORT || 5000
const cors = require('cors')
const io = require('socket.io').listen(server);
var serviceAccount = require("./service.json");
const admin = require('firebase-admin');
io.origins("*:*")
const client = io.sockets
app.use(bodyParser.json()) 

 //Body Parser MiddleWare
app.use(express.json())
app.use(cors())
app.use(bodyParser())
function handleErr(err){
    if(err)return{
        message:"Failed",
        err
    }   
   }
   function handleSuccess(data){
       if(data)return{
           message:"Success",
           doc:data
       }
   }

mongoose.connect(url, { useNewUrlParser: true }) //MongoDB connection using Mongoose
var db = mongoose.connection //Mongo Connection Instance
db.on('open', () => console.log('database connected'))  

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://student-portal-b981b.firebaseio.com"
  });
admin.auth().getUserByEmail('adminpanel@gmail.com')
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log('Successfully fetched user data:', userRecord.toJSON());
    })
    .catch(function(error) {
     console.log('Error fetching user data:', error);
    });
  
app.delete('/api/deleteSubject',(req,res)=>{
    if(req.body._id){
        Exam.findById(req.body._id,(err,doc)=>{
            if(err)return res.json(handleErr(err))
            else{
                let subjects = doc.subjects.filter((sub)=>{
                    return sub!=req.body.subject
                })
                Exam.findByIdAndUpdate(req.body._id,{subjects:subjects},{new:true},(er,exam)=>{
                    if(er)return res.json(handleErr(er))
                    else return res.json(handleSuccess(exam))
                })
            }
        })
    }
})
app.delete('/api/deleteSubRegion',(req,res)=>{
    if(req.body._id){
        Region.findById(req.body._id,(err,doc)=>{
            if(err)return res.json(handleErr(err))
            else{
                let subRegions = doc.subRegions.filter((sub)=>{
                    return sub!=req.body.subRegions
                })
                Region.findByIdAndUpdate(req.body._id,{subRegions:subRegions},{new:true},(er,exam)=>{
                    if(er)return res.json(handleErr(er))
                    else return res.json(handleSuccess(exam))
                })
            }
        })
    }
})
 app.delete("/api/deleteAdminOrUSer",(req,res)=>{
      admin.auth().deleteUser(req.body.uid)
    .then(()=> {
       
        res.json({
            message: "success",

        })
    })

    .catch(function(error) {
        res.json({
            message: "Fail",

        })
    });
  })
  
app.put("/api/createUser",(req,res)=>{
    admin.auth().createUser({
        email: req.body.email,
        password: req.body.password,
        displayName: req.body.name,
        disabled: false
      })
        .then(function(userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log('Successfully created new user:', userRecord.uid);
          
        })
        .catch(function(error) {
          console.log('Error creating new user:', error);
        });
})

app.post('/api/getSub',(req,res)=>{
    let Name = req.body.name
    Exam.find({name:Name},(err,docs)=>{
        if(err)throw err
        res.json({
            message:'Success',
            docs
        })
    })
})


app.post('/api/addUser', (req, res) => {
    const user = req.body
    console.log(req.body)
    User.create(user, (err, doc) => {
        if (err) {
            res.json(err)
        }
        Activity.create({ firebaseUID: user.firebaseUID })
        if(user.userType===false){
            let data = {
                offerRate:user.offerRate,
                title:user.title,
                description:user.description,
                firebaseUID:user.firebaseUID,
                
              
            }
            Teacher.create(data,(er,profile)=>{
                if(er)return res.json({message:"Failed",er})
                else{
                    let data = {
                        doc,
                        profile
                    }
                    return res.json({
                        message: "Success",
                        user: data
                    })
                }
            })
        }
        else{
            if(err)return res.json({message:"Failed",err})
            else{
                return res.json(handleSuccess(doc))
            }
        }
    })
})
app.post('/api/createPost',(req,res)=>{
    console.log(req.body)
    if(req.body.studentFirebaseUID){
        let post = req.body
        Post.create(post,(err,doc)=>{
            if(err)return res.json(handleErr(err))
            else{
                return res.json(handleSuccess(doc))
            }
        })
    }
})
app.get('/api/getPosts',(req,res)=>{  
    Post.find({},(err,docs)=>{
        if(err)return res.json(handleErr(err))
        else{
            return res.json(handleSuccess(docs))
        }
    })
})
app.get("/api/getExmas", (req,res)=>{
    Exam.find({},(err,docs)=>{
        if(err)return res.json(handleErr(err))
        else{
            return res.json(handleSuccess(docs))
        }
    })  
})
app.get("/api/getRegions", (req,res)=>{
    Region.find({},(err,docs)=>{
        if(err)return res.json(handleErr(err))
        else{
            return res.json(handleSuccess(docs))
        }
    })  
})
app.get("/api/getUsers", (req,res)=>{
    User.find({},(err,docs)=>{
        if(err)return res.json(handleErr(err))
        else{
            return res.json(handleSuccess(docs))
        }
    })  
})

app.get('/api/getChatsforAdmin',(req,res)=>{  
    Chats.find({},(err,docs)=>{
        if(err)return res.json(handleErr(err))
        else{
            return res.json(handleSuccess(docs))
        }
    })
})
app.get('/api/getUsers',(req,res)=>{  
    User.find({},(err,docs)=>{
        if(err)return res.json(handleErr(err))
        else{
            return res.json(handleSuccess(docs))
        }
    })
})
app.get('/api/getUserData:firebaseUID',(req,res)=>{ //tested
    User.findOne({ firebaseUID: req.params.firebaseUID },(err,doc)=>{
        if(err){
            res.json({
                message:"Failed",
                err
            })
        }
        else{
            res.json({
                message:"Success",
                doc
            })
        }
    })
})

app.put('/api/addTeacherDetails',(req,res)=>{
    let data =req.body
    if(data.firebaseUID!==undefined){
        Teacher.findOneAndUpdate({firebaseUID:data.firebaseUID},data,{new:true},(er,doc)=>{
            if(er)return res.json({message:"Failed",er})
            else{
                return res.json({
                    message:"Success",
                    doc
                })
            }
        })
    }
})
app.put('/api/updateTeacher',(req,res)=>{
    if(req.body.firebaseUID){
        console.log(req.body)
        let data = req.body
        User.findOneAndUpdate({firebaseUID:req.body.firebaseUID},data,{new:true},(err,doc)=>{
            if(err)res.json(handleErr(err))
            else{
                Teacher.findOneAndUpdate({firebaseUID:req.body.firebaseUID},data,{new:true},(er,teacher)=>{
                    if(er)res.json(handleErr(er))
                    else{
                        let response = {
                            doc,
                            teacher
                        }
                        return res.json(handleSuccess(response))
                    }
                })
            }
        })
    }
    else{
        return res.json(handleErr({
            er:"Firebase UID is required"
        }))
    }
})
// Delete Routes

app.delete('/api/deleteExam',(req,res)=>{
    Exam.findOneAndDelete({_id:req.body.id}, (err, doc) => {
        if (err) res.json(err)
        res.json({
            message: "Success",
            data: doc
        })
    })
 })

 app.delete('/api/deleteRegion',(req,res)=>{
    Region.findOneAndDelete({_id:req.body.id}, (err, doc) => {
        if (err) res.json(err)
        res.json({
            message: "Success",
            data: doc
        })
    })
 })
app.delete('/api/deleteUser',(req,res)=>{
    User.findOneAndDelete({firebaseUID:req.body.uid}, (err, doc) => {
        if (err) res.json(err)
        res.json({
            message: "Success",
            data: doc
        })

       
        
    }
    )
 })
 app.delete('/api/deleteTeacher',(req,res)=>{
    Teacher.findOneAndDelete({firebaseUID:req.body.uid}, (err, doc) => {
        if (err) res.json(err)
        res.json({
            message: "Success",
            data: doc
        })

       
        
    }
    )
 })


app.delete('/api/deleteChat',(req,res)=>{
    Chats.findOneAndDelete({_id:req.body.id}, (err, doc) => {
        if (err) res.json(err)
        res.json({
            message: "Success",
            data: doc
        })
    })
 })
app.delete('/api/deletePosts',(req,res)=>{
    Post.findOneAndDelete({_id:req.body.id}, (err, doc) => {
        if (err) res.json(err)
        res.json({
            message: "Success",
            data: doc
        })
    })
 })
app.get('/api/allTutors:page',(req,res)=>{ //tested
    var perPage = 20
    var page = req.params.page || 1
    User.find({
        userType:true
    }).skip((perPage * page) - perPage).limit(perPage).exec((error, data) => {
        if(error)res.json(handleErr(error))
        let profiles = data.map(user=>{
            let obj = {
            }
            obj.user = user
            Teacher.findOne({firebaseUID:user.firebaseUID},(er,doc)=>{
                if(er)return res.json(handleErr(er))
                else{
                    obj.teacher = doc
                    return obj
                }
            })
        })
        res.json({
            profiles,
            current: page,
            pages: Math.ceil(data.length / perPage)
        })
    })
})
app.get('/api/getTutors',(req,res)=>{
    Teacher.find({},(err,docs)=>{
        if(err)res.json({
            message:"Failed",
            err
        })
        else{
            if(docs.length>0){
                let teachers =[]
                 docs.forEach((teacher)=>{
                    User.findOne({firebaseUID:teacher.firebaseUID},(er,doc)=>{
                        if(er)return res.json(handleErr(er))
                        else {
                            let data ={
                                userData:doc,
                                teacher
                            }
                            teachers.push(data)
                        }
                    })


                })
                setTimeout(() => {
                    return res.json(handleSuccess(teachers))

                }, 2000);
            }
        }
    })
})
// app.get('/api/allStudents:page',(req,res)=>{ //tested
//     var perPage = 20
//     var page = req.params.page || 1
//     User.find({
//         userType:false
//     }).skip((perPage * page) - perPage).limit(perPage).exec((error, data) => {
//         if(error)res.json(handleErr(error))
//         let profiles = data.map(user=>{
//             let obj = {
//             }
//             obj.user = user
//             Student.findOne({firebaseUID:user.firebaseUID},(er,doc)=>{
//                 if(er)return res.json(handleErr(er))
//                 else{
//                     obj.student = doc
//                     return obj
//                 }
//             })
//         })
//         res.json({
//             profiles,
//             current: page,
//             pages: Math.ceil(data.length / perPage)
//         })
//     })
// })
app.post('/api/addExam',(req,res)=>{
    if(req.body){
        let exam = req.body
        Exam.create(exam,(err,doc)=>{
            if(err)res.json(handleErr(err))
            else res.json(handleSuccess(doc))
        })
    }
})
app.post('/api/addRegion',(req,res)=>{
    if(req.body){
        let exam = req.body
        Region.create(exam,(err,doc)=>{
            if(err)res.json(handleErr(err))
            else res.json(handleSuccess(doc))
        })
    }
})
app.post('/api/addSubject',(req,res)=>{
    if(req.body){
        let exam = req.body
        console.log(req.body)
        Exam.findByIdAndUpdate(exam._id,{$push:{subjects:exam.name}},{new:true},(err,doc)=>{
            if(err)return res.json(handleErr(err))
            else{
                res.json(handleSuccess(doc))
            }
        })
    }
})
app.post('/api/addSubRegions',(req,res)=>{
    if(req.body){
        let reg = req.body
        console.log(req.body)
        Region.findByIdAndUpdate(reg._id,{$push:{subRegions:reg.name}},{new:true},(err,doc)=>{
            if(err)return res.json(handleErr(err))
            else{
                res.json(handleSuccess(doc))
            }
        })
    }
})
app.post('/api/updateRegion',(req,res)=>{
    if(req.body){
        let region = req.body
        console.log(req.body)
        Region.findByIdAndUpdate(region._id,{$set:{name:region.name}},{new:true},(err,doc)=>{
            if(err)return res.json(handleErr(err))
            else{
                res.json(handleSuccess(doc))
            }
        })
    }
})
app.post('/api/updateExam',(req,res)=>{
    if(req.body){
        let exam = req.body
        console.log(req.body)
        Exam.findByIdAndUpdate(exam._id,{$set:{name:exam.name}},{new:true},(err,doc)=>{
            if(err)return res.json(handleErr(err))
            else{
                res.json(handleSuccess(doc))
            }
        })
    }
})

app.put('/api/login', (req, res) => {
    const {firebaseUID} = req.body
    User.findOneAndUpdate(firebaseUID, { $set: { isLoggedIn: true } }, { new: true }, (err, doc) => {
        if (err) return res.json(handleErr(err))
        else{
            if(doc.userType==false){
                Teacher.findOne({firebaseUID:doc.firebaseUID},(er,teacher)=>{
                    if(er)return res.json(handleErr(er))
                    else{
                        let data={
                            userData:doc,
                            teacher
                        }
                        return res.json(handleSuccess(data))
                    }
                })
            }
            else{
                let data = {
                    userData:doc
                }
                return res.json(handleSuccess(data))
            }
        }
    })
})

app.put('/api/logout', (req, res) => {
    const {firebaseUID} = req.body
    User.findOneAndUpdate({firebaseUID}, { isLoggedIn: false }, { new: true }, (err, doc) => {
        if (err) res.json(err)
        res.json({
            message: 'Success',
            user: doc
        })
    })
})

app.put('/api/updateUser',(req,res)=>{ 
    User.findOneAndUpdate({firebaseUID},req.body,{new:true},(err,doc)=>{
        if(err){
            res.json(handleErr(err))
        }
        else{
            res.json(handleSuccess(doc))
        }
    })
})

app.put('/api/addProfilePic',(req,res)=>{
    User.findOneAndUpdate({firebaseUID},{profilePic:req.body.profilePic},{new:true},
        (err,doc)=>{
        if(err)res.json(handleErr(err))
        else res.json(handleSuccess(doc))
    })
})

app.get('/api/searchUsers:name',(req,res)=>{
    if(req.params.name){
            User.find({ $text: { $search: req.params.name } })
                .limit(30)
                .exec((err, docs) => {
                    if (err) throw err
                    res.json(docs)
                });
    }
})
app.post('/api/addRegion',(req,res)=>{
    if(req.body){
        let reqion = req.body
        Region.create(reqion,(err,doc)=>{
            if(err)res.json(handleErr(err))
            else res.json(handleSuccess(doc))
        })
    }
})
// 
app.put('/api/getMessages', (req, res) => {         //get messages of a chat from listing
    Chats.findOne({ studentUID: req.body.studentUID, teacherUserID: req.body.teacherUserID }, (err, docs) => {
        if (err) res.json(err)
        console.log(docs)
        if (docs !== null) {
            res.json({
                message: "Success",
                data: docs
            })
        }
        else {
            let data = req.body
            Chats.create(data, (err, doc) => {
                if (err) res.json(err)
                if (doc !== null) {
                    Activity.findOneAndUpdate({ firebaseUID: req.body.studentUID }, { $push: { Conversations: doc._id } }, { new: true }, (err, res) => console.log('Buyer DOne...', res))
                    Activity.findOneAndUpdate({ firebaseUID: req.body.teacherUserID }, { $push: { Conversations: doc._id } }, { new: true }, (err, res) => console.log('Seller DOne...', res))
                    res.json({
                        message: "Chat created",
                        data: doc
                    })

                }

            })
        }
    })
})
app.post('/api/getChats',(req,res)=>{
        let {userType}=req.body
        if(userType===false){
            Chats.find({teacherUserID:req.body.firebaseUID},(err,docs)=>{
                if(err)return res.json(handleErr(err))
                else{
                    return res.json(handleSuccess(docs))
                }
            })
        }
        else{
            Chats.find({studentUID:req.body.firebaseUID},(err,docs)=>{
                if(err)return res.json(handleErr(err))
                else{
                    return res.json(handleSuccess(docs))
                }
            })
        }
})
app.post('/api/updateStudent', (req, res) => {
    console.log(req.body)
    User.findOneAndUpdate({ firebaseUID: req.body.firebaseUID }, { $set: { 
        fName: req.body.fName, 
        lName:  req.body.lName,
        profilePic:  req.body.profilePic,
        telephone:  req.body.telephone,
        gender:  req.body.gender,
     } }, (err, docs) => {
          
        if (err) res.json(err)
        res.json({
            message: "Success",
            data: docs
        })
    })
})
client.on('connection', (socket) => {
    console.log('Client connected')
    // Create function to send status
    sendStatus = function (s) {
        socket.emit('status', s);
    }

    // Get chats from mongo collection
    // Handle input events
    socket.on('input', (response) => {

        let data = JSON.parse(response)
        let { chatId } = data
        let message = {}
        if (data.hasOwnProperty('text')) {
            message = {
                createdAt: Date.now(),
                text: data.text,
                senderAvatarLink: data.senderAvatarLink,
                senderID: data.senderID
            }
            console.log(message)
        }
        else if (data.hasOwnProperty('image')) {
            message = {
                createdAt: Date.now(),
                image: data.image,
                senderAvatarLink: data.senderAvatarLink,
                senderID: data.senderID
            }
            console.log(message)
        }
        let firebaseUID = data.senderID
        // Check for name and message
        if (firebaseUID == '' || message == undefined) {
            // Send error status
            return
        } else {
            // Insert message
            Chats.findByIdAndUpdate(chatId, { $push: { messages: message } }, { new: true }, (err, docs) => {
                if (err) console.log('Error: ' + err)
                let newmsg = docs.messages[docs.messages.length - 1]
                newmsg.fName = docs.fName
                console.log(docs)
                let emitter = socket.broadcast
                emitter.emit('Sent', JSON.stringify(newmsg))
            })
            // Chats.insert({firebaseUID: firebaseUID, message: message}, function(){
            //     client.emit('output', [data]);

            //     // Send status object
            //     sendStatus({
            //         message: 'Message sent',
            //         clear: true
            //     });
            // });
        }
    });

    // Handle clear
    socket.on('clear', function (data) {
        // Remove all chats from collection
        Chats.remove({}, function () {
            // Emit cleared
            socket.emit('cleared');
        });
    });
});
//Server
server.listen(port,  ()=>{
    console.log('Listening on port' + port)
})