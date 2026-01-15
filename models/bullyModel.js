const mongoose = require('mongoose')

const bullySchema = new mongoose.Schema({
    school_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'School',
    },
    reported_by:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    bully_name:{
        type:String,
        required:true
    },
    bully_class:{
        type:mongoose.Schema.Types.ObjectId,
        re:'Class'
    },
    description:String,
    status:{
        type:String,
        enum:['Pending','Resolved'],
        default:'Pending'
    }
})
bullySchema.index({school_id:1})

module.exports = mongoose.model('Bully', bullySchema)