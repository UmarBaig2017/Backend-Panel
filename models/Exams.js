const mongoose = require('mongoose');


const ExamsSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    subjects:{
        type:[String]
    }
});

module.exports = mongoose.model('Exams', ExamsSchema);