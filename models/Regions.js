const mongoose = require('mongoose');


const RegionSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    subRegions:[String]
});

module.exports = mongoose.model('Regions', RegionSchema);